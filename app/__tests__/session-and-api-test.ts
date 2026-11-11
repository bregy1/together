/**
 * Session storage keeps the token in expo-secure-store on the phone, for this
 * device only and readable while it is unlocked; the typed API client attaches
 * the base URL and the session token.
 * spec: ADR-0005 (sessions in expo-secure-store, one session per device)
 */
import * as SecureStore from 'expo-secure-store';

import { createApiClient } from '../src/api/client';
import { sessionStore } from '../src/session/sessionStore';
import type { SessionStore } from '../src/session/types';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'mock-when-unlocked-this-device-only',
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  };
});

describe('native session store', () => {
  it('stores, reads and clears the token through expo-secure-store', async () => {
    await sessionStore.setToken('abc');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(expect.any(String), 'abc', expect.anything());
    await expect(sessionStore.getToken()).resolves.toBe('abc');
    await sessionStore.clear();
    await expect(sessionStore.getToken()).resolves.toBeNull();
  });

  it('keeps the token for this device only, readable while the device is unlocked', async () => {
    await sessionStore.setToken('abc');
    await sessionStore.getToken();
    const options = { keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY };
    expect(SecureStore.setItemAsync).toHaveBeenLastCalledWith(expect.any(String), 'abc', options);
    expect(SecureStore.getItemAsync).toHaveBeenLastCalledWith(expect.any(String), options);
  });
});

describe('typed API client', () => {
  const memoryStore = (token: string | null): SessionStore => ({
    getToken: async () => token,
    setToken: async () => {},
    clear: async () => {},
  });
  const ok = async () => new Response('{"status":"ok"}', { status: 200, headers: { 'Content-Type': 'application/json' } });

  it('joins the base URL and sends the session token', async () => {
    const fetchImpl = jest.fn(ok);
    const client = createApiClient({ baseUrl: 'http://localhost:8080/', sessionStore: memoryStore('tok'), fetchImpl });

    const { data } = await client.GET('/healthz');

    expect(data).toEqual({ status: 'ok' });
    const request = (fetchImpl.mock.calls[0] as unknown[])[0] as Request;
    expect(request.url).toBe('http://localhost:8080/healthz');
    expect(request.headers.get('Authorization')).toBe('Bearer tok');
  });

  it('sends no Authorization header without a session', async () => {
    const fetchImpl = jest.fn(ok);
    const client = createApiClient({ baseUrl: 'http://localhost:8080', sessionStore: memoryStore(null), fetchImpl });

    await client.GET('/healthz');

    const request = (fetchImpl.mock.calls[0] as unknown[])[0] as Request;
    expect(request.headers.has('Authorization')).toBe(false);
  });
});
