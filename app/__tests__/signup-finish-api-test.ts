/**
 * The finish call on the typed API client: it sends both acceptances, answers with the
 * member, and passes `signup_incomplete` with the missing parts and a missing connection
 * back in the one result shape.
 * spec: ONB-016, ONB-018
 */
import { createApiClient } from '../src/api/client';
import { createSignUpApi } from '../src/api/signUpApi';
import type { SessionStore } from '../src/session/types';

const session: SessionStore = { getToken: async () => 'tok', setToken: async () => {}, clear: async () => {} };

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

function apiWith(fetchImpl: (request: Request) => Promise<Response>) {
  return createSignUpApi(createApiClient({ baseUrl: 'http://api.test', sessionStore: session, fetchImpl }));
}

describe('finishSignUp', () => {
  it('posts both acceptances and returns the member', async () => {
    const fetchImpl = jest.fn(async (_request: Request) => json(200, { id: 'm1', firstName: 'Lea' }));
    const result = await apiWith(fetchImpl).finishSignUp();

    expect(result).toEqual({ ok: true, data: { id: 'm1', firstName: 'Lea' } });
    const request = fetchImpl.mock.calls[0][0];
    expect(request.method).toBe('POST');
    expect(request.url).toBe('http://api.test/signup/finish');
    expect(request.headers.get('Authorization')).toBe('Bearer tok');
    await expect(request.json()).resolves.toEqual({ acceptTermsOfUse: true, acceptRules: true });
  });

  it('returns signup_incomplete with the missing parts', async () => {
    const api = apiWith(async () => json(409, { code: 'signup_incomplete', message: 'x', details: { missing: ['portrait'] } }));
    await expect(api.finishSignUp()).resolves.toEqual({
      ok: false,
      kind: 'error',
      code: 'signup_incomplete',
      details: { missing: ['portrait'] },
    });
  });

  it('reports offline when no answer arrives', async () => {
    const api = apiWith(async () => {
      throw new TypeError('Network request failed');
    });
    await expect(api.finishSignUp()).resolves.toEqual({ ok: false, kind: 'offline' });
  });
});
