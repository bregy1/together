// One interface for the login session token, with a platform implementation:
// sessionStore.ts (iOS and Android, expo-secure-store) and
// sessionStore.web.ts (development-only stand-in for the browser preview).
// spec: ADR-0005, ADR-0009
export interface SessionStore {
  getToken(): Promise<string | null>;
  setToken(token: string): Promise<void>;
  clear(): Promise<void>;
}

export const SESSION_TOKEN_KEY = 'yaruno.session.token';
