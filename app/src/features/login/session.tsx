// Whether this device has a session, and whose: decides if the app opens sign-up
// or the tabs. The token itself stays in the secure session store.
// spec: ONB-001, ONB-004, ONB-007, ADR-0005
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { sessionStore as defaultSessionStore } from '../../session/sessionStore';
import type { SessionStore } from '../../session/types';
import type { Me } from './loginApi';

/**
 * `loading`: the stored token is being read. `signedOut`: no session.
 * `signingUp`: verified number, sign-up not finished. `member`: a member's session.
 */
export type SessionStatus = 'loading' | 'signedOut' | 'signingUp' | 'member';

type SessionContextValue = {
  status: SessionStatus;
  /** Keeps the token from verifyLoginCode on this device and records who it belongs to. */
  startSession(token: string, me: Me): Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children, store = defaultSessionStore }: { children: ReactNode; store?: SessionStore }) {
  const [status, setStatus] = useState<SessionStatus>('loading');

  useEffect(() => {
    let active = true;
    store.getToken().then(
      // Known gap: at start-up only the token is known, not whether its sign-up is finished.
      // Resuming an unfinished sign-up after a restart is ONB-008 (CR-0001.T10).
      (token) => active && setStatus(token ? 'member' : 'signedOut'),
      () => active && setStatus('signedOut'),
    );
    return () => {
      active = false;
    };
  }, [store]);

  const startSession = useCallback(
    async (token: string, me: Me) => {
      await store.setToken(token);
      setStatus(me.status === 'member' ? 'member' : 'signingUp');
    },
    [store],
  );

  const value = useMemo(() => ({ status, startSession }), [status, startSession]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession needs a SessionProvider.');
  return value;
}
