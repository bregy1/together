// Package session defines what the HTTP wiring needs from device sessions:
// a verifier that maps a bearer token to a session, and the request context
// through which handlers learn the caller's session.
//
// It is a package of its own so that the area packages (login, signup,
// photos) can read the session without importing the wiring, which imports
// them. The database-backed verifier comes with CR-0001.T11.
//
// spec: ADR-0005
package session

import (
	"context"
	"errors"
)

// Session is a verified device session. Tokens are opaque random values of
// which the server stores only a hash, one session per device (ADR-0005);
// the token itself never appears here. CR-0001.T11 adds the fields that
// say whom the session belongs to.
type Session struct {
	// ID identifies the stored session (not the token).
	ID string
}

// ErrNotFound is returned by a Verifier when no valid session matches the
// token: unknown, expired or revoked. It is answered with 401.
var ErrNotFound = errors.New("session not found")

// Verifier maps a bearer token to its session. It returns ErrNotFound when
// there is none; any other error is a server failure (answered with 500).
// Implementations never log the token.
type Verifier interface {
	Verify(ctx context.Context, token string) (Session, error)
}

// RejectAll is the verifier the server runs with until device sessions
// exist (CR-0001.T11): it knows no session, so every signed-in call is
// answered with 401.
type RejectAll struct{}

// Verify implements Verifier.
func (RejectAll) Verify(context.Context, string) (Session, error) {
	return Session{}, ErrNotFound
}

type holderKey struct{}

// holder carries the verified session of one request. The wiring puts an
// empty holder into the request context before the request is validated;
// the session check, which cannot replace the request context, fills it.
type holder struct {
	session Session
	ok      bool
}

// WithHolder returns a context that can receive the request's session.
// Used by the wiring only.
func WithHolder(ctx context.Context) context.Context {
	return context.WithValue(ctx, holderKey{}, &holder{})
}

// Attach records the verified session in a context prepared with
// WithHolder. It reports false when ctx has no holder. Used by the wiring
// only.
func Attach(ctx context.Context, s Session) bool {
	h, ok := ctx.Value(holderKey{}).(*holder)
	if !ok {
		return false
	}
	h.session, h.ok = s, true
	return true
}

// FromContext returns the caller's verified session. It reports false when
// the request carried none, which for operations that require a session
// cannot happen: the wiring answers them with 401 first.
func FromContext(ctx context.Context) (Session, bool) {
	h, ok := ctx.Value(holderKey{}).(*holder)
	if !ok || !h.ok {
		return Session{}, false
	}
	return h.session, true
}
