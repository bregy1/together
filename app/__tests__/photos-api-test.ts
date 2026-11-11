/**
 * The sign-up photo calls: the prepared JPEG goes as the multipart field `photo` to its
 * slot with the session header; removing answers 204; failures come back as codes;
 * an uploaded photo is read with the session header.
 * spec: ONB-014, ONB-008, ONB-020
 */
import { createApiClient } from '../src/api/client';
import { createPhotosApi } from '../src/api/photosApi';
import type { SessionStore } from '../src/session/types';

const store: SessionStore = {
  getToken: async () => 'tok-1',
  setToken: async () => {},
  clear: async () => {},
};

function setup(answer: (request: Request) => Response | Promise<Response>) {
  const requests: Request[] = [];
  const fetchImpl = async (request: Request) => {
    requests.push(request);
    return answer(request);
  };
  const client = createApiClient({ baseUrl: 'https://api.test/', sessionStore: store, fetchImpl });
  return { api: createPhotosApi(client, store, () => 'https://api.test/'), requests };
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

it('uploads the photo as multipart field `photo` to its slot with the session header', async () => {
  const { api, requests } = setup(() => json(200, { slot: 2, version: 'v9' }));
  const result = await api.putSignUpPhoto(2, 'file:///prepared.jpg');

  expect(result).toEqual({ ok: true, data: { slot: 2, version: 'v9' } });
  const [request] = requests;
  expect(request.method).toBe('PUT');
  expect(request.url).toBe('https://api.test/signup/photos/2');
  expect(request.headers.get('Authorization')).toBe('Bearer tok-1');
  expect(request.headers.get('Content-Type') ?? '').not.toContain('application/json');
});

it('a refused photo comes back with its code', async () => {
  const { api } = setup(() => json(413, { code: 'photo_too_large', message: 'too large' }));
  expect(await api.putSignUpPhoto(0, 'file:///prepared.jpg')).toEqual({ ok: false, kind: 'error', code: 'photo_too_large' });
});

it('removing a slot answers 204 and counts as done', async () => {
  const { api, requests } = setup(() => new Response(null, { status: 204 }));
  expect(await api.deleteSignUpPhoto(3)).toEqual({ ok: true, data: undefined });
  expect(requests[0].method).toBe('DELETE');
  expect(requests[0].url).toBe('https://api.test/signup/photos/3');
});

it('no answer at all is reported as offline', async () => {
  const { api } = setup(() => {
    throw new TypeError('Network request failed');
  });
  expect(await api.deleteSignUpPhoto(1)).toEqual({ ok: false, kind: 'offline' });
});

it('an uploaded photo is read on the phone with the session header', async () => {
  const { api } = setup(() => json(500, {}));
  expect(await api.signUpPhotoSource(0)).toEqual({
    uri: 'https://api.test/signup/photos/0',
    headers: { Authorization: 'Bearer tok-1' },
  });
});
