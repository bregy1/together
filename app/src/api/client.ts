// The typed API client, built with openapi-fetch on the types generated from
// api/openapi.yaml. The one place where the base URL and the session token
// (`Authorization: Bearer`, the `session` scheme of the contract) are attached.
// spec: ADR-0004, ADR-0005
import createClient, { type Client } from 'openapi-fetch';

import { sessionStore as defaultSessionStore } from '../session/sessionStore';
import type { SessionStore } from '../session/types';
import type { paths } from './generated/schema';

export type ApiClient = Client<paths>;

export type ApiClientConfig = {
  baseUrl: string;
  sessionStore: SessionStore;
  fetchImpl?: (request: Request) => Promise<Response>;
};

export function createApiClient({ baseUrl, sessionStore, fetchImpl }: ApiClientConfig): ApiClient {
  const client = createClient<paths>({
    baseUrl: baseUrl.replace(/\/+$/, ''),
    // Resolved per call, so a fetch replaced after start-up (e.g. in tests) is used.
    fetch: (request) => (fetchImpl ?? globalThis.fetch)(request),
  });
  client.use({
    async onRequest({ request }) {
      const token = await sessionStore.getToken();
      if (token) request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
  });
  return client;
}

/**
 * The base URL comes from the environment (EXPO_PUBLIC_API_BASE_URL, inlined by Expo at bundle time).
 * The local value is set up with the dev command (CR-0001.T03); no address is assumed here.
 */
export function apiBaseUrl(): string {
  return process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
}

export const apiClient = createApiClient({ baseUrl: apiBaseUrl(), sessionStore: defaultSessionStore });
