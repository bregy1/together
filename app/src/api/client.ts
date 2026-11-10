// Thin wrapper around fetch: the one place where the API base URL and the
// session token are attached. The typed client generated from api/openapi.yaml
// (CR-0001.T04) will be built on top of this.
// spec: ADR-0004, ADR-0005
import { sessionStore as defaultSessionStore } from '../session/sessionStore';
import type { SessionStore } from '../session/types';

export type ApiClientConfig = {
  baseUrl: string;
  sessionStore: SessionStore;
  fetchImpl?: typeof fetch;
};

export type ApiClient = {
  baseUrl: string;
  request(path: string, init?: RequestInit): Promise<Response>;
};

export function createApiClient({ baseUrl, sessionStore, fetchImpl = fetch }: ApiClientConfig): ApiClient {
  const base = baseUrl.replace(/\/+$/, '');
  return {
    baseUrl: base,
    async request(path, init = {}) {
      const headers = new Headers(init.headers);
      const token = await sessionStore.getToken();
      // The header format is provisional until the OpenAPI security scheme is written (CR-0001.T04).
      if (token) headers.set('Authorization', `Bearer ${token}`);
      return fetchImpl(`${base}/${path.replace(/^\/+/, '')}`, { ...init, headers });
    },
  };
}

/**
 * The base URL comes from the environment (EXPO_PUBLIC_API_BASE_URL, inlined by Expo at bundle time).
 * The local value is set up with the dev command (CR-0001.T03); no address is assumed here.
 */
export function apiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
}

export const apiClient = createApiClient({ baseUrl: apiBaseUrl(), sessionStore: defaultSessionStore });
