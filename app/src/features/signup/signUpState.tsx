// One sign-up state for all steps, kept in memory while the app runs: filled from the
// server's SignUp (at start-up or after the code check) and from what the person types,
// so going back and forward never loses input. A new session (or none) starts it afresh.
// spec: ONB-008, ONB-020
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import type { Interest, Municipality, SignUp, SignUpStep } from '../../api/signUpApi';
import { useSession } from '../login/session';
import { splitIsoDate } from './aboutChecks';

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
  };
}

type SignUpContextValue = {
  draft: SignUpDraft;
  update(change: Partial<SignUpDraft>): void;
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

  const draft = current.draft;
  const value = useMemo(
    () => ({ draft, update, interestList, setInterestList }),
    [draft, update, interestList],
  );
  return <SignUpContext.Provider value={value}>{children}</SignUpContext.Provider>;
}

export function useSignUp(): SignUpContextValue {
  const value = useContext(SignUpContext);
  if (!value) throw new Error('useSignUp needs a SignUpProvider.');
  return value;
}
