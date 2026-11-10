// Package config reads the service configuration from environment variables
// and validates it at startup. Defaults fit local development only; they hold
// no secrets.
//
// spec: ADR-0004, ADR-0012
package config

import (
	"errors"
	"fmt"
	"net"
	"strconv"

	"github.com/jackc/pgx/v5/pgxpool"
)

// Environment variable names.
const (
	EnvHTTPAddr    = "HTTP_ADDR"
	EnvDatabaseURL = "DATABASE_URL"
)

// Local development defaults. The database default carries no password: a
// real deployment always sets DATABASE_URL.
const (
	DefaultHTTPAddr    = "127.0.0.1:8080"
	DefaultDatabaseURL = "postgres://yaruno@localhost:5432/yaruno?sslmode=disable"
)

// Config is the validated service configuration.
type Config struct {
	// HTTPAddr is the host:port the HTTP server listens on.
	HTTPAddr string
	// DatabaseURL is the PostgreSQL connection string. It may hold a
	// password: never log it.
	DatabaseURL string
}

// Load reads the configuration through getenv (os.Getenv in production) and
// validates it. Error messages name the variable but never echo its value.
func Load(getenv func(string) string) (Config, error) {
	cfg := Config{
		HTTPAddr:    valueOr(getenv(EnvHTTPAddr), DefaultHTTPAddr),
		DatabaseURL: valueOr(getenv(EnvDatabaseURL), DefaultDatabaseURL),
	}

	var errs []error
	if err := validateAddr(cfg.HTTPAddr); err != nil {
		errs = append(errs, fmt.Errorf("%s: %w", EnvHTTPAddr, err))
	}
	if _, err := pgxpool.ParseConfig(cfg.DatabaseURL); err != nil {
		// The parse error may quote the connection string; do not wrap it.
		errs = append(errs, fmt.Errorf("%s: not a valid PostgreSQL connection string", EnvDatabaseURL))
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
