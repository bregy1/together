// Package database opens the PostgreSQL connection pool (pgx v5).
//
// spec: ADR-0004
package database

import (
	"context"
	"errors"
	"fmt"
	"net"
	"strconv"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
)

// ErrUnreachable is wrapped by Connect when the database does not answer.
var ErrUnreachable = errors.New("database unreachable")

// ErrInvalidURL is returned when the connection string cannot be parsed.
var ErrInvalidURL = errors.New("invalid database connection string")

// Open parses url and creates a pool without contacting the database; pgx
// connects lazily. The caller closes the pool.
func Open(url string) (*pgxpool.Pool, error) {
	cfg, err := pgxpool.ParseConfig(url)
	if err != nil {
		// The parse error may quote the connection string; do not wrap it.
		return nil, ErrInvalidURL
	}
	pool, err := pgxpool.NewWithConfig(context.Background(), cfg)
	if err != nil {
		return nil, fmt.Errorf("open database pool: %s", redact(err, cfg.ConnConfig.Password))
	}
	return pool, nil
}

// Ping checks that the database answers. The error wraps ErrUnreachable and
// names the server that was tried, but never the password.
func Ping(ctx context.Context, pool *pgxpool.Pool) error {
	if err := pool.Ping(ctx); err != nil {
		cc := pool.Config().ConnConfig
		target := net.JoinHostPort(cc.Host, strconv.Itoa(int(cc.Port)))
		return fmt.Errorf("%w at %s: %s", ErrUnreachable, target, redact(err, cc.Password))
	}
	return nil
}

// Connect opens a pool and checks with Ping that the database answers. On
// failure the pool is closed and nil is returned.
func Connect(ctx context.Context, url string) (*pgxpool.Pool, error) {
	pool, err := Open(url)
	if err != nil {
		return nil, err
	}
	if err := Ping(ctx, pool); err != nil {
		pool.Close()
		return nil, err
	}
	return pool, nil
}

// redact returns the error text with the password removed, as a safeguard in
// case a driver error ever quotes it.
func redact(err error, password string) string {
	msg := err.Error()
	if password == "" {
		return msg
	}
	return strings.ReplaceAll(msg, password, "xxxxx")
}
