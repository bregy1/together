// Package sessiontest offers an in-memory session verifier for tests.
//
// spec: ADR-0005
package sessiontest

import (
	"context"
	"sync"

	"github.com/bregy1/together/server/internal/server/session"
)

// Fake is an in-memory session.Verifier. Tokens it does not know answer
// session.ErrNotFound; Err, when set, is returned for every token instead,
// to test a failing session store.
type Fake struct {
	mu       sync.Mutex
	sessions map[string]session.Session
	Err      error
}

// NewFake returns a Fake that knows the given token-to-session pairs.
func NewFake(sessions map[string]session.Session) *Fake {
	f := &Fake{sessions: map[string]session.Session{}}
	for token, s := range sessions {
		f.sessions[token] = s
	}
	return f
}

// Verify implements session.Verifier.
func (f *Fake) Verify(_ context.Context, token string) (session.Session, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	if f.Err != nil {
		return session.Session{}, f.Err
	}
	s, ok := f.sessions[token]
	if !ok {
		return session.Session{}, session.ErrNotFound
	}
	return s, nil
}
