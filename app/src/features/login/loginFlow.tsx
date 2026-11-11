// What the phone and code screens share while a person logs in: the number as typed
// (so "change number" can bring it back for editing) and the code request that is
// running (number in E.164 form, when it was sent, when a new one may be requested).
// Kept in memory only, never in the address, so the number does not show in a URL.
// spec: ONB-003, ONB-005, ONB-006
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

export type SentCode = {
  /** The number the code went to, in E.164 form. */
  phoneNumber: string;
  /** Date.now() when the server accepted the request. */
  sentAt: number;
  /** From the server's answer (`resendAfterSeconds`). */
  resendAfterSeconds: number;
};

type LoginFlowValue = {
  phoneInput: string;
  setPhoneInput(value: string): void;
  sentCode: SentCode | null;
  setSentCode(value: SentCode | null): void;
};

const LoginFlowContext = createContext<LoginFlowValue | null>(null);

export function LoginFlowProvider({ children }: { children: ReactNode }) {
  const [phoneInput, setPhoneInput] = useState('');
  const [sentCode, setSentCode] = useState<SentCode | null>(null);
  const value = useMemo(() => ({ phoneInput, setPhoneInput, sentCode, setSentCode }), [phoneInput, sentCode]);
  return <LoginFlowContext.Provider value={value}>{children}</LoginFlowContext.Provider>;
}

export function useLoginFlow(): LoginFlowValue {
  const value = useContext(LoginFlowContext);
  if (!value) throw new Error('useLoginFlow needs a LoginFlowProvider.');
  return value;
}
