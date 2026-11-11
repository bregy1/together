// Package config reads the service configuration from environment variables
// and validates it at startup. Defaults fit local development only; they hold
// no secrets.
//
// spec: ADR-0004, ADR-0012, NFR-SEC-004
package config

import (
	"errors"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Environment variable names.
const (
	EnvHTTPAddr           = "HTTP_ADDR"
	EnvDatabaseURL        = "DATABASE_URL"
	EnvAppEnv             = "APP_ENV"
	EnvCORSAllowedOrigins = "CORS_ALLOWED_ORIGINS"
)

// Local development defaults. The database default carries no password: a
// real deployment always sets DATABASE_URL.
const (
	DefaultHTTPAddr    = "127.0.0.1:8080"
	DefaultDatabaseURL = "postgres://yaruno@localhost:5432/yaruno?sslmode=disable"
	// DefaultCORSAllowedOrigin is the Expo web preview on the developer
	// machine (ADR-0009), allowed in development only.
	DefaultCORSAllowedOrigin = "http://localhost:8081"
)

// Environment says whether the service runs for development or production.
// Development-only behaviour (cross-origin access for the web preview, and
// from CR-0001.T11 the login development switches) must refuse to run in
// production (NFR-SEC-004).
type Environment string

// The environments.
const (
	Development Environment = "development"
	Production  Environment = "production"
)

// IsProduction reports whether e is the production environment.
func (e Environment) IsProduction() bool { return e == Production }

// Valid reports whether e is one of the known environments.
func (e Environment) Valid() bool { return e == Development || e == Production }

// Config is the validated service configuration.
type Config struct {
	// HTTPAddr is the host:port the HTTP server listens on.
	HTTPAddr string
	// DatabaseURL is the PostgreSQL connection string. It may hold a
	// password: never log it.
	DatabaseURL string
	// Environment is development or production.
	Environment Environment
	// CORSAllowedOrigins are the browser origins allowed to call the API
	// cross-origin. Development only; always empty in production.
	CORSAllowedOrigins []string
}

// Load reads the configuration through getenv (os.Getenv in production) and
// validates it. Error messages name the variable but never echo its value.
//
// APP_ENV must be "development" or "production". It may be left unset only
// when HTTP_ADDR is a loopback address (the developer machine); it then
// means development. A server that listens beyond loopback must say
// explicitly which environment it is, so a deployment that forgets the
// setting does not start with development behaviour.
func Load(getenv func(string) string) (Config, error) {
	cfg := Config{
		HTTPAddr:    valueOr(getenv(EnvHTTPAddr), DefaultHTTPAddr),
		DatabaseURL: valueOr(getenv(EnvDatabaseURL), DefaultDatabaseURL),
	}

	var errs []error
	addrErr := validateAddr(cfg.HTTPAddr)
	if addrErr != nil {
		errs = append(errs, fmt.Errorf("%s: %w", EnvHTTPAddr, addrErr))
	}
	if _, err := pgxpool.ParseConfig(cfg.DatabaseURL); err != nil {
		// The parse error may quote the connection string; do not wrap it.
		errs = append(errs, fmt.Errorf("%s: not a valid PostgreSQL connection string", EnvDatabaseURL))
	}

	switch v := getenv(EnvAppEnv); {
	case v == "" && addrErr == nil && isLoopback(cfg.HTTPAddr):
		cfg.Environment = Development
	case v == "":
		if addrErr == nil {
			errs = append(errs, fmt.Errorf("%s: must be set to %q or %q when %s is not a loopback address",
				EnvAppEnv, Development, Production, EnvHTTPAddr))
		}
	case Environment(v).Valid():
		cfg.Environment = Environment(v)
	default:
		errs = append(errs, fmt.Errorf("%s: must be %q or %q", EnvAppEnv, Development, Production))
	}

	origins := getenv(EnvCORSAllowedOrigins)
	switch {
	case cfg.Environment.IsProduction() && origins != "":
		errs = append(errs, fmt.Errorf("%s: cross-origin access is for development only and must not be set in production", EnvCORSAllowedOrigins))
	case cfg.Environment == Development && origins == "":
		cfg.CORSAllowedOrigins = []string{DefaultCORSAllowedOrigin}
	case origins != "":
		list, err := parseOrigins(origins)
		if err != nil {
			errs = append(errs, fmt.Errorf("%s: %w", EnvCORSAllowedOrigins, err))
		}
		if cfg.Environment == Development {
			cfg.CORSAllowedOrigins = list
		}
	}

	if len(errs) > 0 {
		return Config{}, fmt.Errorf("invalid configuration: %w", errors.Join(errs...))
	}
	return cfg, nil
}

func valueOr(v, def string) string {
	if v == "" {
		return def
	}
	return v
}

func validateAddr(addr string) error {
	_, port, err := net.SplitHostPort(addr)
	if err != nil {
		return errors.New("must be host:port, for example 127.0.0.1:8080 or :8080")
	}
	n, err := strconv.Atoi(port)
	if err != nil || n < 1 || n > 65535 {
		return errors.New("port must be a number from 1 to 65535")
	}
	return nil
}

// isLoopback reports whether the host of a valid host:port address can only
// be reached from the same machine. An empty host listens everywhere.
func isLoopback(addr string) bool {
	host, _, err := net.SplitHostPort(addr)
	if err != nil {
		return false
	}
	if host == "localhost" {
		return true
	}
	ip := net.ParseIP(host)
	return ip != nil && ip.IsLoopback()
}

// parseOrigins reads a comma-separated list of browser origins of the form
// scheme://host[:port], with scheme http or https and nothing after the
// host. Wildcards are not supported.
func parseOrigins(v string) ([]string, error) {
	var list []string
	for _, item := range strings.Split(v, ",") {
		item = strings.TrimSpace(item)
		u, err := url.Parse(item)
		if item == "" || err != nil || (u.Scheme != "http" && u.Scheme != "https") || u.Host == "" ||
			u.Path != "" || u.RawQuery != "" || u.Fragment != "" || u.User != nil || u.Opaque != "" ||
			strings.Contains(u.Host, "*") {
			return nil, errors.New("must be a comma-separated list of origins such as http://localhost:8081 (scheme, host and port only)")
		}
		list = append(list, u.Scheme+"://"+u.Host)
	}
	return list, nil
}
