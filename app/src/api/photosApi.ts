// The sign-up photo calls on the typed API client: upload a prepared JPEG into a slot,
// remove a slot, and the source to show an already uploaded photo (the 400 px version,
// read with the session header). Outcomes come back in the same result shape as the
// other sign-up calls: the data, the server's error code, or "offline".
// spec: ONB-014, ONB-008, ONB-020
import { Platform } from 'react-native';

import { sessionStore as defaultSessionStore } from '../session/sessionStore';
import type { SessionStore } from '../session/types';
import { apiBaseUrl, apiClient, type ApiClient } from './client';
import type { components } from './generated/schema';
import type { ApiResult, ErrorDetails } from './signUpApi';

export type Photo = components['schemas']['Photo'];
/** 0 is the portrait; 1 to 3 are the further photos. */
export type PhotoSlot = 0 | 1 | 2 | 3;

/** What an Image needs to show an uploaded photo. */
export type PhotoSource = { uri: string; headers?: Record<string, string> };

type Outcome<T> = { data?: T; error?: unknown; response: Response };

async function settle<T>(call: () => Promise<Outcome<T>>): Promise<ApiResult<T>> {
  let outcome: Outcome<T>;
  try {
    outcome = await call();
  } catch (thrown) {
    // fetch rejects with a TypeError when no answer arrives (no connection, server unreachable).
    if (thrown instanceof TypeError) return { ok: false, kind: 'offline' };
    return { ok: false, kind: 'error', code: 'unknown' };
  }
  // A 204 carries no body; the success is in the status.
  if (outcome.error === undefined && outcome.response.ok) return { ok: true, data: outcome.data as T };
  const body = outcome.error;
  if (body && typeof body === 'object' && 'code' in body && typeof body.code === 'string') {
    const details = 'details' in body ? (body.details as ErrorDetails | undefined) : undefined;
    return details ? { ok: false, kind: 'error', code: body.code, details } : { ok: false, kind: 'error', code: body.code };
  }
  return { ok: false, kind: 'error', code: 'unknown' };
}

/**
 * The multipart body with the prepared JPEG. On the web the file is read into a Blob;
 * on the phone React Native's FormData sends the local file named by its uri.
 */
async function photoForm(uri: string): Promise<FormData> {
  const form = new FormData();
  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    form.append('photo', blob, 'photo.jpg');
  } else {
    // React Native's FormData accepts a file part as { uri, name, type }.
    form.append('photo', { uri, name: 'photo.jpg', type: 'image/jpeg' } as unknown as Blob);
  }
  return form;
}

export function createPhotosApi(client: ApiClient, store: SessionStore, baseUrl: () => string) {
  const path = (slot: PhotoSlot) => ({ params: { path: { slot } } });
  return {
    /** Stores the photo in the slot, replacing the photo already there. */
    putSignUpPhoto: (slot: PhotoSlot, uri: string): Promise<ApiResult<Photo>> =>
      settle(async () => {
        const form = await photoForm(uri);
        // The FormData is passed through as it is; fetch sets the multipart boundary.
        return client.PUT('/signup/photos/{slot}', { ...path(slot), body: form as never });
      }),
    /** Empties the slot; an empty slot is fine too. */
    deleteSignUpPhoto: (slot: PhotoSlot): Promise<ApiResult<undefined>> =>
      settle(() => client.DELETE('/signup/photos/{slot}', path(slot)) as Promise<Outcome<undefined>>),
    /**
     * The source of an uploaded photo. On the phone the Image sends the session header
     * itself; on the web it cannot, so the photo is read here and shown from a blob URL.
     */
    signUpPhotoSource: async (slot: PhotoSlot): Promise<PhotoSource | null> => {
      if (Platform.OS === 'web') {
        try {
          const { data } = await client.GET('/signup/photos/{slot}', { ...path(slot), parseAs: 'blob' });
          return data ? { uri: URL.createObjectURL(data as Blob) } : null;
        } catch {
          return null;
        }
      }
      const token = await store.getToken();
      const uri = `${baseUrl().replace(/\/+$/, '')}/signup/photos/${slot}`;
      return token ? { uri, headers: { Authorization: `Bearer ${token}` } } : { uri };
    },
  };
}

const photosApi = createPhotosApi(apiClient, defaultSessionStore, apiBaseUrl);
export const putSignUpPhoto = photosApi.putSignUpPhoto;
export const deleteSignUpPhoto = photosApi.deleteSignUpPhoto;
export const signUpPhotoSource = photosApi.signUpPhotoSource;
