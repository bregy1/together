// Command server runs the Yaruno Go service: it reads its configuration from
// the environment, connects to PostgreSQL and serves the REST API.
//
// spec: ADR-0004, ADR-0012
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/bregy1/together/server/internal/config"
	"github.com/bregy1/together/server/internal/database"
	"github.com/bregy1/together/server/internal/server"
	"github.com/bregy1/together/server/internal/server/session"
)

const (
	connectTimeout  = 10 * time.Second
	shutdownTimeout = 15 * time.Second
)

func main() {
	logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))
	if err := run(logger); err != nil {
		logger.Error("server stopped with an error", "error", err)
		os.Exit(1)
	}
}

func run(logger *slog.Logger) error {
	cfg, err := config.Load(os.Getenv)
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	pool, err := database.Open(cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer pool.Close()

	// The server keeps running when the database is not reachable yet (for
	// example while it is still starting), and the health check answers
	// "unavailable" until it is.
	pingCtx, cancel := context.WithTimeout(ctx, connectTimeout)
	err = database.Ping(pingCtx, pool)
	cancel()
	if err != nil {
		logger.Error("database not reachable at startup; health check answers unavailable until it is", "error", err)
	} else {
		logger.Info("database connected")
	}

	srv, err := server.New(cfg.HTTPAddr, server.Options{
		DB: pool,
		// Device sessions come with CR-0001.T11; until then every
		// signed-in call is answered with 401.
		Sessions:           session.RejectAll{},
		Logger:             logger,
		Environment:        cfg.Environment,
		CORSAllowedOrigins: cfg.CORSAllowedOrigins,
	})
	if err != nil {
		return err
	}
	serveErr := make(chan error, 1)
	go func() {
		logger.Info("http server listening", "addr", cfg.HTTPAddr, "environment", cfg.Environment)
		serveErr <- srv.ListenAndServe()
	}()

	select {
	case err := <-serveErr:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	case <-ctx.Done():
	}

	logger.Info("shutting down")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), shutdownTimeout)
	defer cancel()
	return srv.Shutdown(shutdownCtx)
}
