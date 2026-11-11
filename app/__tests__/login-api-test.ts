/**
 * The login calls on the typed API client: success, the server's error codes and
 * a missing connection come back as one result shape; and the app's own phone
 * number format check.
 * spec: ONB-002, ONB-003, ONB-004
 */
import { createApiClient } from '../src/api/client';
import { createLoginApi } from '../src/features/login/loginApi';
import { checkPhoneNumber, formatSwissNumber } from '../src/features/login/phoneNumber';
import type { SessionStore } from '../src/session/types';

const noSession: SessionStore = { getToken: async () => null, setToken: async () => {}, clear: async () => {} };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function loginApiWith(fetchImpl: (request: Request) => Promise<Response>) {
  return createLoginApi(createApiClient({ baseUrl: 'http://api.test', sessionStore: noSession, fetchImpl }));
}

describe('login API', () => {
  it('requests a code with the number in the body, never in the address', async () => {
    const fetchImpl = jest.fn(async (_request: Request) => json(202, { codeValidForSeconds: 300, resendAfterSeconds: 60 }));
    const result = await loginApiWith(fetchImpl).requestLoginCode('+41791234567');

    expect(result).toEqual({ ok: true, data: { codeValidForSeconds: 300, resendAfterSeconds: 60 } });
    const request = fetchImpl.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(request.url).toBe('http://api.test/login/code-requests');
    await expect(request.json()).resolves.toEqual({ phoneNumber: '+41791234567' });
  });

  it('returns the error code and details the server answered', async () => {
    const api = loginApiWith(async () => json(422, { code: 'login_code_wrong', details: { attemptsLeft: 2 } }));
    await expect(api.verifyLoginCode('+41791234567', '111111')).resolves.toEqual({
      ok: false,
      kind: 'error',
      code: 'login_code_wrong',
      details: { attemptsLeft: 2 },
    });
  });

  it('treats an answer without an error body as a general error', async () => {
    const api = loginApiWith(async () => new Response('Bad gateway', { status: 502 }));
    await expect(api.requestLoginCode('+41791234567')).resolves.toEqual({ ok: false, kind: 'error', code: 'unknown' });
  });

  it('reports a failed network request as offline', async () => {
    const api = loginApiWith(async () => {
      throw new TypeError('Network request failed');
    });
    await expect(api.requestLoginCode('+41791234567')).resolves.toEqual({ ok: false, kind: 'offline' });
  });
});

describe('phone number format check', () => {
  it.each([
    ['079 123 45 67', '+41791234567'],
    ['0791234567', '+41791234567'],
    ['79 123 45 67', '+41791234567'],
    ['+41 79 123 45 67', '+41791234567'],
    ['+41 079 123 45 67', '+41791234567'],
    ['0041 79 123 45 67', '+41791234567'],
  ])('accepts %s as %s', (typed, e164) => {
    expect(checkPhoneNumber(typed)).toEqual({ kind: 'ok', e164 });
  });

  it.each(['+49 151 23456789', '0049 151 23456789', '+1 202 555 0100', '+33 6 12 34 56 78'])('refuses %s as not Swiss', (typed) => {
    expect(checkPhoneNumber(typed)).toEqual({ kind: 'notSwiss' });
  });

  it.each(['', '079 123 45', '+41 79 123', '+', '+4', '079 123 45 67 8'])('refuses %p as invalid', (typed) => {
    expect(checkPhoneNumber(typed)).toEqual({ kind: 'invalid' });
  });

  it('shows the Swiss grouping', () => {
    expect(formatSwissNumber('+41791234567')).toEqual({ national: '79 123 45 67', international: '+41 79 123 45 67' });
  });
});
