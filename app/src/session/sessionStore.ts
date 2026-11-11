// iOS and Android: the session token lives in the Keychain / Keystore through
// expo-secure-store, never in AsyncStorage or plain files. Sessions are per device,
// so the token is kept for this device only (never in a backup that moves to another
// phone) and is readable only while the device is unlocked.
// spec: ADR-0005
import * as SecureStore from 'expo-secure-store';

import { SESSION_TOKEN_KEY, type SessionStore } from './types';

const options: SecureStore.SecureStoreOptions = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };

export const sessionStore: SessionStore = {
  getToken: () => SecureStore.getItemAsync(SESSION_TOKEN_KEY, options),
  setToken: (token) => SecureStore.setItemAsync(SESSION_TOKEN_KEY, token, options),
  clear: () => SecureStore.deleteItemAsync(SESSION_TOKEN_KEY, options),
};
