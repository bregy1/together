/**
 * SCR-onb-phone and SCR-onb-code: entering the phone number, sending and checking
 * the SMS code, resending, changing the number and landing on the next step or on
 * Entdecken. The API calls are mocked; the server decides about numbers and codes.
 * spec: ONB-001 … ONB-007
 */
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Text } from 'react-native';

import type { components } from '../src/api/generated/schema';
import { requestLoginCode, verifyLoginCode } from '../src/features/login/loginApi';

type Me = components['schemas']['Me'];

jest.mock('../src/features/login/loginApi', () => ({
  requestLoginCode: jest.fn(),
  verifyLoginCode: jest.fn(),
}));

// At start-up with a stored token the app asks the server who the person is (ONB-008).
jest.mock('../src/api/signUpApi', () => ({
  getMe: jest.fn(async () => ({ ok: true, data: { status: 'member', member: { id: 'm1', firstName: 'Lea' } } })),
}));

let mockToken: string | null = null;
jest.mock('../src/session/sessionStore', () => ({
  sessionStore: {
    getToken: jest.fn(async () => mockToken),
    setToken: jest.fn(async (token: string) => {
      mockToken = token;
    }),
    clear: jest.fn(async () => {
      mockToken = null;
    }),
  },
}));

const requestCode = requestLoginCode as jest.MockedFunction<typeof requestLoginCode>;
const verifyCode = verifyLoginCode as jest.MockedFunction<typeof verifyLoginCode>;

const sent = { ok: true as const, data: { codeValidForSeconds: 300, resendAfterSeconds: 60 } };
const failure = (code: string, details?: Record<string, unknown>) => ({ ok: false as const, kind: 'error' as const, code, details });
const offline = { ok: false as const, kind: 'offline' as const };

const newPerson: Me = { status: 'signingUp', signUp: { step: 'about', interests: [], photos: [] } };
const member: Me = { status: 'member', member: { id: 'm1', firstName: 'Lea' } };

/** The next sign-up step is built by another task; a stub stands in for it. */
function AboutStub() {
  return <Text testID="stub-about">about</Text>;
}

async function openApp() {
  await renderRouter({ appDir: './src/app', overrides: { '(onboarding)/about': AboutStub } }, { initialUrl: '/' });
}

const phoneField = () => screen.getByLabelText('Handynummer');
const sendButton = () => screen.getByRole('button', { name: 'Code senden' });
const codeField = () => screen.getByLabelText('Code');
const continueButton = () => screen.getByRole('button', { name: 'Weiter' });

async function typeNumberAndSend(number: string) {
  await fireEvent.changeText(phoneField(), number);
  await fireEvent.press(sendButton());
}

async function openCodeScreen(number = '079 123 45 67') {
  await openApp();
  requestCode.mockResolvedValueOnce(sent);
  await typeNumberAndSend(number);
  await screen.findByText(/Wir haben dir einen Code an/);
}

async function submitCode(code: string) {
  await fireEvent.changeText(codeField(), code);
  await fireEvent.press(continueButton());
}

beforeEach(() => {
  mockToken = null;
  requestCode.mockReset();
  verifyCode.mockReset();
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

describe('SCR-onb-phone', () => {
  it('@spec ONB-001.S1 without a session the app shows the phone screen with +41, the number field and the hint', async () => {
    await openApp();

    expect(await screen.findByRole('header', { name: 'Deine Handynummer' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/phone');
    expect(screen.getByText('+41')).toBeOnTheScreen();
    expect(screen.getByLabelText('Ländervorwahl +41, Schweiz')).toBeOnTheScreen();
    expect(phoneField()).toBeOnTheScreen();
    expect(phoneField().props.accessibilityHint).toContain(
      'Wir brauchen deine Nummer nur, um dein Konto zu bestätigen. Andere Mitglieder sehen sie nie.',
    );
    expect(screen.getByRole('progressbar', { name: 'Schritt 1 von 5' })).toBeOnTheScreen();
    expect(sendButton()).toBeOnTheScreen();
  });

  it('@spec ONB-001.S2 a link to the privacy policy is shown', async () => {
    await openApp();
    expect(await screen.findByRole('link', { name: 'Datenschutzerklärung' })).toBeOnTheScreen();
  });

  it('@spec ONB-002.S1 a German number is refused with notSwiss and no code is requested', async () => {
    await openApp();
    await typeNumberAndSend('+49 151 23456789');

    expect(await screen.findByText('Yaruno gibt es nur in der Schweiz. Gib eine Schweizer Nummer mit +41 ein.')).toBeOnTheScreen();
    expect(requestCode).not.toHaveBeenCalled();
    expect(screen).toHavePathname('/phone');
  });

  it('@spec ONB-002.S2 a number with too few digits is refused with invalid and no code is requested', async () => {
    await openApp();
    await typeNumberAndSend('079 123 45');

    expect(await screen.findByText('Diese Nummer ist unvollständig. Prüf sie nochmal.')).toBeOnTheScreen();
    expect(requestCode).not.toHaveBeenCalled();
    expect(screen).toHavePathname('/phone');
  });

  it('shows the server refusal of a number at the field (phone_invalid, phone_not_swiss)', async () => {
    await openApp();
    requestCode.mockResolvedValueOnce(failure('phone_invalid'));
    await typeNumberAndSend('079 123 45 67');
    expect(await screen.findByText('Diese Nummer ist unvollständig. Prüf sie nochmal.')).toBeOnTheScreen();

    requestCode.mockResolvedValueOnce(failure('phone_not_swiss'));
    await fireEvent.press(sendButton());
    expect(await screen.findByText(/Yaruno gibt es nur in der Schweiz/)).toBeOnTheScreen();
    expect(screen).toHavePathname('/phone');
  });

  it('@spec ONB-003.S1 a valid Swiss number gets a code and the code screen shows the number it went to', async () => {
    await openApp();
    requestCode.mockResolvedValueOnce(sent);
    await typeNumberAndSend('079 123 45 67');

    expect(await screen.findByText('Wir haben dir einen Code an +41 79 123 45 67 geschickt.')).toBeOnTheScreen();
    expect(requestCode).toHaveBeenCalledTimes(1);
    expect(requestCode).toHaveBeenCalledWith('+41791234567');
    expect(screen).toHavePathname('/code');
  });

  it('accepts the number with spaces, a leading 0, without the 0 or with +41 and sends it in E.164 form', async () => {
    await openApp();
    for (const typed of ['0791234567', '79 123 45 67', '+41 79 123 45 67', '0041 79 123 45 67']) {
      requestCode.mockResolvedValueOnce(failure('sms_send_failed'));
      await typeNumberAndSend(typed);
      await screen.findByText('Wir konnten den Code nicht senden. Nochmal?');
    }
    expect(requestCode.mock.calls.map(([phone]) => phone)).toEqual([
      '+41791234567',
      '+41791234567',
      '+41791234567',
      '+41791234567',
    ]);
  });

  it('@spec ONB-003.S2 when the code cannot be sent, an error with a retry is shown and nothing is created', async () => {
    await openApp();
    requestCode.mockResolvedValueOnce(failure('sms_send_failed'));
    await typeNumberAndSend('079 123 45 67');

    expect(await screen.findByText('Wir konnten den Code nicht senden. Nochmal?')).toBeOnTheScreen();
    expect(screen).toHavePathname('/phone');
    expect(mockToken).toBeNull();

    requestCode.mockResolvedValueOnce(sent);
    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByText(/Wir haben dir einen Code an/)).toBeOnTheScreen();
    expect(requestCode).toHaveBeenCalledTimes(2);
  });

  it('@spec ONB-003.S2 without a connection, the offline message with a retry is shown', async () => {
    await openApp();
    requestCode.mockResolvedValueOnce(offline);
    await typeNumberAndSend('079 123 45 67');

    expect(await screen.findByText('Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Nochmal versuchen' })).toBeOnTheScreen();
    expect(phoneField().props.value).toBe('079 123 45 67');
    expect(screen).toHavePathname('/phone');
  });

  it('shows the limits from the server (too many codes, codes unavailable) and an unknown code as a general error', async () => {
    await openApp();
    requestCode.mockResolvedValueOnce(failure('login_code_rate_limited', { retryAfterSeconds: 600 }));
    await typeNumberAndSend('079 123 45 67');
    expect(await screen.findByText('Zu viele Codes für diese Nummer. Versuch es später nochmal.')).toBeOnTheScreen();

    requestCode.mockResolvedValueOnce(failure('sms_unavailable'));
    await fireEvent.press(sendButton());
    expect(await screen.findByText('Wir können gerade keine Codes senden. Versuch es später nochmal.')).toBeOnTheScreen();

    requestCode.mockResolvedValueOnce(failure('something_new'));
    await fireEvent.press(sendButton());
    expect(await screen.findByText('Das hat nicht geklappt. Nochmal?')).toBeOnTheScreen();
    expect(screen).toHavePathname('/phone');
  });

  it('while sending, the send action shows progress and cannot be tapped twice', async () => {
    await openApp();
    let finish: (value: typeof sent) => void = () => {};
    requestCode.mockReturnValueOnce(new Promise((resolve) => (finish = resolve)));
    await typeNumberAndSend('079 123 45 67');

    await waitFor(() => expect(sendButton()).toBeBusy());
    expect(screen.getByTestId('button-busy-indicator')).toBeOnTheScreen();
    expect(sendButton()).toBeDisabled();
    await fireEvent.press(sendButton());
    expect(requestCode).toHaveBeenCalledTimes(1);

    await act(async () => finish(sent));
    expect(await screen.findByText(/Wir haben dir einen Code an/)).toBeOnTheScreen();
    expect(requestCode).toHaveBeenCalledTimes(1);
  });
});

describe('SCR-onb-code', () => {
  it('@spec ONB-004.S1 the correct code for a new number leads to the about step', async () => {
    await openCodeScreen();
    verifyCode.mockResolvedValueOnce({ ok: true, data: { sessionToken: 'tok-new', me: newPerson } });
    await submitCode('123456');

    expect(await screen.findByTestId('stub-about')).toBeOnTheScreen();
    expect(screen).toHavePathname('/about');
    expect(verifyCode).toHaveBeenCalledWith('+41791234567', '123456');
    expect(mockToken).toBe('tok-new');
  });

  it('@spec ONB-004.S2 a wrong code shows the attempts left and stays on the code screen', async () => {
    await openCodeScreen();
    verifyCode.mockResolvedValueOnce(failure('login_code_wrong', { attemptsLeft: 3 }));
    await submitCode('111111');

    expect(await screen.findByText('Dieser Code stimmt nicht. Du hast noch 3 Versuche.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/code');
    expect(mockToken).toBeNull();

    verifyCode.mockResolvedValueOnce(failure('login_code_wrong', { attemptsLeft: 1 }));
    await submitCode('222222');
    expect(await screen.findByText('Dieser Code stimmt nicht. Du hast noch 1 Versuch.')).toBeOnTheScreen();
  });

  it('@spec ONB-004.S3 an expired or used-up code shows expired with the action to request a new code', async () => {
    jest.useFakeTimers();
    await openCodeScreen();
    verifyCode.mockResolvedValueOnce(failure('login_code_expired'));
    await submitCode('123456');

    expect(await screen.findByText('Dieser Code gilt nicht mehr. Lass dir einen neuen schicken.')).toBeOnTheScreen();
    expect(screen).toHavePathname('/code');

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });
    const resend = screen.getByRole('button', { name: 'Neuen Code senden' });
    expect(resend).toBeEnabled();
    requestCode.mockResolvedValueOnce(sent);
    await fireEvent.press(resend);
    expect(requestCode).toHaveBeenLastCalledWith('+41791234567');
    expect(requestCode).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Dieser Code gilt nicht mehr. Lass dir einen neuen schicken.')).toBeNull();
    expect(screen.getByRole('button', { name: 'Neuer Code in 60 Sekunden' })).toBeDisabled();
  });

  it('@spec ONB-005.S1 20 seconds after sending, the resend action is disabled and shows the seconds left', async () => {
    jest.useFakeTimers();
    await openCodeScreen();

    await act(async () => {
      jest.advanceTimersByTime(20_000);
    });

    const resend = screen.getByRole('button', { name: 'Neuer Code in 40 Sekunden' });
    expect(resend).toBeDisabled();
    await fireEvent.press(resend);
    expect(requestCode).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(40_000);
    });
    expect(screen.getByRole('button', { name: 'Neuen Code senden' })).toBeEnabled();
  });

  it('@spec ONB-006.S1 changing the number returns to the phone screen with the number ready to edit', async () => {
    await openCodeScreen('079 123 45 68');
    await fireEvent.press(screen.getByRole('button', { name: 'Nummer ändern' }));

    expect(await screen.findByRole('header', { name: 'Deine Handynummer' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/phone');
    expect(phoneField().props.value).toBe('79 123 45 68');
    expect(phoneField().props.editable).not.toBe(false);
  });

  it('@spec ONB-007.S1 an existing member who verifies the number lands on Entdecken', async () => {
    await openCodeScreen();
    verifyCode.mockResolvedValueOnce({ ok: true, data: { sessionToken: 'tok-member', me: member } });
    await submitCode('123456');

    expect(await screen.findByRole('header', { name: 'Entdecken' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(screen.queryByTestId('stub-about')).toBeNull();
    expect(mockToken).toBe('tok-member');
  });

  it('without a connection, the offline message with a retry is shown and the code is kept', async () => {
    await openCodeScreen();
    verifyCode.mockResolvedValueOnce(offline);
    await submitCode('123456');

    expect(await screen.findByText('Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?')).toBeOnTheScreen();
    expect(codeField().props.value).toBe('123456');

    verifyCode.mockResolvedValueOnce({ ok: true, data: { sessionToken: 'tok-new', me: newPerson } });
    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByTestId('stub-about')).toBeOnTheScreen();
    expect(verifyCode).toHaveBeenCalledTimes(2);
  });

  it('the continue action stays disabled until six digits are entered', async () => {
    await openCodeScreen();
    expect(continueButton()).toBeDisabled();
    await fireEvent.changeText(codeField(), '12a34');
    expect(codeField().props.value).toBe('1234');
    expect(continueButton()).toBeDisabled();
    await fireEvent.changeText(codeField(), '123456');
    expect(continueButton()).toBeEnabled();
  });
});

describe('session at start', () => {
  it('a person with a session on this device starts on the tabs', async () => {
    mockToken = 'tok-member';
    await openApp();
    expect(await screen.findByRole('header', { name: 'Entdecken' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
  });
});
