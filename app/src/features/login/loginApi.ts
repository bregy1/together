// The two login calls (requestLoginCode, verifyLoginCode) on the typed API client.
// Every outcome comes back as one result shape, so the screens never see exceptions:
// the data, the server's error code with its details, or "offline" when no answer
// arrived at all.
// spec: ONB-003, ONB-004, ONB-005, ONB-007
import { apiClient, type ApiClient } from '../../api/client';
import type { components } from '../../api/generated/schema';

type Schemas = components['schemas'];
export type LoginCodeSent = Schemas['LoginCodeSent'];
export type SessionStarted = Schemas['SessionStarted'];
export type Me = Schemas['Me'];
export type ErrorDetails = Schemas['ErrorDetails'];

/** The server's error code, or `unknown` when the answer carried no error body. */
export type ApiFailure = { ok: false; kind: 'offline' } | { ok: false; kind: 'error'; code: string; details?: ErrorDetails };
export type ApiResult<T> = { ok: true; data: T } | ApiFailure;

type Outcome<T> = { data?: T; error?: unknown };

async function settle<T>(call: () => Promise<Outcome<T>>): Promise<ApiResult<T>> {
  let outcome: Outcome<T>;
  try {
    outcome = await call();
  } catch (thrown) {
    // fetch rejects with a TypeError when no answer arrives (no connection, server unreachable).
    if (thrown instanceof TypeError) return { ok: false, kind: 'offline' };
    return { ok: false, kind: 'error', code: 'unknown' };
  }
  if (outcome.error === undefined && outcome.data !== undefined) return { ok: true, data: outcome.data };
  const body = outcome.error;
  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    const details = 'details' in body ? (body.details as ErrorDetails | undefined) : undefined;
    return details ? { ok: false, kind: 'error', code: body.code, details } : { ok: false, kind: 'error', code: body.code };
  }
  return { ok: false, kind: 'error', code: 'unknown' };
}

export function createLoginApi(client: ApiClient) {
  return {
    /** Sends a code by SMS to a number in E.164 form; also used to resend. */
    requestLoginCode: (phoneNumber: string): Promise<ApiResult<LoginCodeSent>> =>
      settle(() => client.POST('/login/code-requests', { body: { phoneNumber } })),
    /** Checks the code; on success the answer carries the device-session token and who the person is. */
    verifyLoginCode: (phoneNumber: string, code: string): Promise<ApiResult<SessionStarted>> =>
      settle(() => client.POST('/login/code-verifications', { body: { phoneNumber, code } })),
  };
}

const loginApi = createLoginApi(apiClient);
export const requestLoginCode = loginApi.requestLoginCode;
export const verifyLoginCode = loginApi.verifyLoginCode;
