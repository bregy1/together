// DEVELOPMENT ONLY: stand-in for the browser preview (ADR-0009).
// expo-secure-store has no web support. This file is picked only by the web
// bundle (*.web.ts), so it never reaches the iOS or Android build. It keeps the
// token in the tab's sessionStorage, which is NOT secure storage: acceptable only
// for the local preview with test data. The web preview is never published.
// spec: ADR-0009, ADR-0005
import { SESSION_TOKEN_KEY, type SessionStore } from './types';

function storage(): Storage {
  if (!__DEV__) {
    throw new Error('The web session stand-in is for local development only.');
  }
  return globalThis.sessionStorage;
}

export const sessionStore: SessionStore = {
  getToken: async () => storage().getItem(SESSION_TOKEN_KEY),
  setToken: async (token) => storage().setItem(SESSION_TOKEN_KEY, token),
  clear: async () => storage().removeItem(SESSION_TOKEN_KEY),
};
