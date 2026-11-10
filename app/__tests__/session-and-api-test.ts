/**
 * Session storage keeps the token in expo-secure-store on the phone, and the
 * API client wrapper attaches the base URL and the session token.
 * spec: ADR-0005 (sessions in expo-secure-store)
 */
import * as SecureStore from 'expo-secure-store';

import { createApiClient } from '../src/api/client';
import { sessionStore } from '../src/session/sessionStore';
import type { SessionStore } from '../src/session/types';

jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (key: string) => store.get(key) ?? null),
    setItemAsync: jest.fn(async (key: string, value: string) => void store.set(key, value)),
    deleteItemAsync: jest.fn(async (key: string) => void store.delete(key)),
  };
});

describe('native session store', () => {
  it('stores, reads and clears the token through expo-secure-store', async () => {
    await sessionStore.setToken('abc');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(expect.any(String), 'abc');
    await expect(sessionStore.getToken()).resolves.toBe('abc');
    await sessionStore.clear();
    await expect(sessionStore.getToken()).resolves.toBeNull();
  });
});

describe('API client wrapper', () => {
  const memoryStore = (token: string | null): SessionStore => ({
    getToken: async () => token,
    setToken: async () => {},
    clear: async () => {},
  });

  it('joins the base URL and sends the session token', async () => {
    const fetchImpl = jest.fn(async () => new Response('{}', { status: 200 }));
    const client = createApiClient({ baseUrl: 'http://localhost:8080/', sessionStore: memoryStore('tok'), fetchImpl });

    await client.request('/healthz');

    expect(fetchImpl).toHaveBeenCalledWith('http://localhost:8080/healthz', expect.anything());
    const init = (fetchImpl.mock.calls[0] as unknown[])[1] as RequestInit;
    expect(new Headers(init.headers).get('Authorization')).toBe('Bearer tok');
  });

  it('sends no Authorization header without a session', async () => {
    const fetchImpl = jest.fn(async () => new Response('{}', { status: 200 }));
    const client = createApiClient({ baseUrl: 'http://localhost:8080', sessionStore: memoryStore(null), fetchImpl });

    await client.request('healthz');

    const init = (fetchImpl.mock.calls[0] as unknown[])[1] as RequestInit;
    expect(new Headers(init.headers).has('Authorization')).toBe(false);
  });
});
