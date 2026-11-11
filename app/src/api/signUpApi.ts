// The sign-up calls on the typed API client: who the session belongs to (getMe), saving
// the about step, the interests and the current step, and the two lists the sign-up
// chooses from. Every outcome comes back in one result shape, as with the login calls:
// the data, the server's error code with its details, or "offline" when no answer
// arrived at all.
// spec: ONB-008, ONB-009, ONB-010, ONB-011, ONB-012, ONB-013, ONB-020
import { apiClient, type ApiClient } from './client';
import type { components } from './generated/schema';

type Schemas = components['schemas'];
export type Me = Schemas['Me'];
export type SignUp = Schemas['SignUp'];
export type SignUpStep = Schemas['SignUpStep'];
export type SignUpAboutUpdate = Schemas['SignUpAboutUpdate'];
export type Municipality = Schemas['Municipality'];
export type Interest = Schemas['Interest'];
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

export function createSignUpApi(client: ApiClient) {
  return {
    /** Who the session belongs to: a member, or a sign-up with everything entered so far and its step. */
    getMe: (): Promise<ApiResult<Me>> => settle(() => client.GET('/me')),
    /** Saves any of first name, birth date and home municipality; omitted fields stay as they are. */
    updateSignUpAbout: (update: SignUpAboutUpdate): Promise<ApiResult<SignUp>> =>
      settle(() => client.PATCH('/signup/about', { body: update })),
    /** Records the step the person is on, so a later start resumes there. */
    setSignUpStep: (step: SignUpStep): Promise<ApiResult<SignUp>> =>
      settle(() => client.PUT('/signup/step', { body: { step } })),
    /** Replaces the chosen interests (0 to 5, in the chosen order). */
    setSignUpInterests: (interestIds: string[]): Promise<ApiResult<SignUp>> =>
      settle(() => client.PUT('/signup/interests', { body: { interestIds } })),
    /** Swiss municipalities whose name matches the search text (at most 20). */
    searchMunicipalities: (q: string): Promise<ApiResult<Municipality[]>> =>
      settle(async () => {
        const { data, error } = await client.GET('/municipalities', { params: { query: { q } } });
        return { data: data?.items, error };
      }),
    /** The interests that can be chosen, with their names per language. */
    listInterests: (): Promise<ApiResult<Interest[]>> =>
      settle(async () => {
        const { data, error } = await client.GET('/interests');
        return { data: data?.items, error };
      }),
  };
}

const signUpApi = createSignUpApi(apiClient);
export const getMe = signUpApi.getMe;
export const updateSignUpAbout = signUpApi.updateSignUpAbout;
export const setSignUpStep = signUpApi.setSignUpStep;
export const setSignUpInterests = signUpApi.setSignUpInterests;
export const searchMunicipalities = signUpApi.searchMunicipalities;
export const listInterests = signUpApi.listInterests;
