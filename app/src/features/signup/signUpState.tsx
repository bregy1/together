// One sign-up state for all steps, kept in memory while the app runs: filled from the
// server's SignUp (at start-up or after the code check) and from what the person types,
// so going back and forward never loses input. A new session (or none) starts it afresh.
// spec: ONB-008, ONB-014, ONB-020
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { PhotoSlot } from '../../api/photosApi';
import type { Interest, Municipality, SignUp, SignUpStep } from '../../api/signUpApi';
import { useSession } from '../login/session';
import { splitIsoDate } from './aboutChecks';

/** A filled photo slot: uploaded (from the server or this run), uploading, or failed. */
export type SignUpPhoto = {
  slot: PhotoSlot;
  status: 'uploaded' | 'uploading' | 'failed';
  /** The server's version once stored. */
  version?: string;
  /** The prepared JPEG on this device, when the photo was added during this app run. */
  localUri?: string;
};

export type SignUpDraft = {
  /** The step the server last recorded. */
  step: SignUpStep;
  firstName: string;
  birthDay: string;
  birthMonth: string;
  birthYear: string;
  municipality: Municipality | null;
  regionQuery: string;
  interests: Interest[];
  /** The filled photo slots, in slot order. */
  photos: SignUpPhoto[];
};

function draftFrom(signUp: SignUp | null): SignUpDraft {
  const birth = splitIsoDate(signUp?.birthDate);
  return {
    step: signUp?.step ?? 'about',
    firstName: signUp?.firstName ?? '',
    birthDay: birth.day,
    birthMonth: birth.month,
    birthYear: birth.year,
    municipality: signUp?.homeMunicipality ?? null,
    regionQuery: '',
    interests: signUp?.interests ?? [],
    photos: (signUp?.photos ?? []).map((photo) => ({
      slot: photo.slot as PhotoSlot,
      version: photo.version,
      status: 'uploaded' as const,
    })),
  };
}

type SignUpContextValue = {
  draft: SignUpDraft;
  update(change: Partial<SignUpDraft>): void;
  /** Fills (or with null empties) one photo slot, based on the latest state. */
  setPhoto(slot: PhotoSlot, photo: SignUpPhoto | null): void;
  /** The interests that can be chosen, loaded once per app run. */
  interestList: Interest[] | null;
  setInterestList(list: Interest[]): void;
};

const SignUpContext = createContext<SignUpContextValue | null>(null);

export function SignUpProvider({ children }: { children: ReactNode }) {
  const { signUp } = useSession();
  const [state, setState] = useState(() => ({ seed: signUp, draft: draftFrom(signUp) }));
  const [interestList, setInterestList] = useState<Interest[] | null>(null);

  // A new session (start-up, login, or none after the age stop) brings its own sign-up.
  let current = state;
  if (state.seed !== signUp) {
    current = { seed: signUp, draft: draftFrom(signUp) };
    setState(current);
  }

  const update = useCallback(
    (change: Partial<SignUpDraft>) => setState((prev) => ({ ...prev, draft: { ...prev.draft, ...change } })),
    [],
  );

  // Uploads finish in any order; each change is applied to the latest list.
  const setPhoto = useCallback(
    (slot: PhotoSlot, photo: SignUpPhoto | null) =>
      setState((prev) => {
        const others = prev.draft.photos.filter((p) => p.slot !== slot);
        const photos = (photo ? [...others, photo] : others).sort((a, b) => a.slot - b.slot);
        return { ...prev, draft: { ...prev.draft, photos } };
      }),
    [],
  );

  const draft = current.draft;
  const value = useMemo(
    () => ({ draft, update, setPhoto, interestList, setInterestList }),
    [draft, update, setPhoto, interestList],
  );
  return <SignUpContext.Provider value={value}>{children}</SignUpContext.Provider>;
}

export function useSignUp(): SignUpContextValue {
  const value = useContext(SignUpContext);
  if (!value) throw new Error('useSignUp needs a SignUpProvider.');
  return value;
}
