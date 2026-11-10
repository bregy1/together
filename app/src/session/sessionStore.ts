// iOS and Android: the session token lives in the Keychain / Keystore through
// expo-secure-store, never in AsyncStorage or plain files.
// spec: ADR-0005
import * as SecureStore from 'expo-secure-store';

import { SESSION_TOKEN_KEY, type SessionStore } from './types';

export const sessionStore: SessionStore = {
  getToken: () => SecureStore.getItemAsync(SESSION_TOKEN_KEY),
  setToken: (token) => SecureStore.setItemAsync(SESSION_TOKEN_KEY, token),
  clear: () => SecureStore.deleteItemAsync(SESSION_TOKEN_KEY),
};
