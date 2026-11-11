// Whether this device has a session, and whose: decides if the app opens sign-up
// or the tabs. The token itself stays in the secure session store. With a stored
// token the app asks the server (getMe) who the person is, so an unfinished sign-up
// resumes at its step with everything entered so far (ONB-008).
// spec: ONB-001, ONB-004, ONB-007, ONB-008, ONB-010, ADR-0005
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getMe, type SignUp } from '../../api/signUpApi';
import { sessionStore as defaultSessionStore } from '../../session/sessionStore';
import type { SessionStore } from '../../session/types';
import type { Me } from './loginApi';

/**
 * `loading`: the stored token is being read and checked. `unreachable`: the check got no
 * usable answer; the app offers a retry instead of guessing. `signedOut`: no session.
 * `signingUp`: verified number, sign-up not finished. `member`: a member's session.
 */
export type SessionStatus = 'loading' | 'unreachable' | 'signedOut' | 'signingUp' | 'member';

/** Why the start-up check failed: no connection, or another failure. */
export type StartProblem = 'onb.error.offline' | 'onb.error.generic';

type SessionContextValue = {
  status: SessionStatus;
  /** The unfinished sign-up as the server last reported it at start-up or login; null otherwise. */
  signUp: SignUp | null;
  /** Set while `status` is `unreachable`. */
  startProblem: StartProblem | null;
  /** Keeps the token from verifyLoginCode on this device and records who it belongs to. */
  startSession(token: string, me: Me): Promise<void>;
  /** Forgets the session on this device (e.g. after the age stop, whose sign-up the server deleted). */
  endSession(): Promise<void>;
  /** Repeats the start-up check after it failed. */
  retry(): void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

type State = { status: SessionStatus; signUp: SignUp | null; startProblem: StartProblem | null };

function fromMe(me: Me): State {
  return me.status === 'member'
    ? { status: 'member', signUp: null, startProblem: null }
    : { status: 'signingUp', signUp: me.signUp, startProblem: null };
}

const signedOut: State = { status: 'signedOut', signUp: null, startProblem: null };

export function SessionProvider({ children, store = defaultSessionStore }: { children: ReactNode; store?: SessionStore }) {
  const [state, setState] = useState<State>({ status: 'loading', signUp: null, startProblem: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const check = async (): Promise<State> => {
      const token = await store.getToken();
      if (!token) return signedOut;
      const result = await getMe();
      if (result.ok) return fromMe(result.data);
      if (result.kind === 'offline') return { status: 'unreachable', signUp: null, startProblem: 'onb.error.offline' };
      if (result.code === 'unauthenticated') {
        // The session is unknown or expired: start again with the phone number.
        await store.clear().catch(() => {});
        return signedOut;
      }
      return { status: 'unreachable', signUp: null, startProblem: 'onb.error.generic' };
    };
    check().then(
      (next) => active && setState(next),
      () => active && setState(signedOut),
    );
    return () => {
      active = false;
    };
  }, [store, attempt]);

  const startSession = useCallback(
    async (token: string, me: Me) => {
      await store.setToken(token);
      setState(fromMe(me));
    },
    [store],
  );

  const endSession = useCallback(async () => {
    await store.clear().catch(() => {});
    setState(signedOut);
  }, [store]);

  const retry = useCallback(() => {
    setState({ status: 'loading', signUp: null, startProblem: null });
    setAttempt((n) => n + 1);
  }, []);

  const value = useMemo(
    () => ({ ...state, startSession, endSession, retry }),
    [state, startSession, endSession, retry],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession needs a SessionProvider.');
  return value;
}
