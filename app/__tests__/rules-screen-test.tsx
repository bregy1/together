/**
 * SCR-onb-rules ("Schritt 5 von 5") and the legal screen: the six Spielregeln with the
 * "not a dating app" line first, the links to the terms of use and the privacy policy
 * (opening and returning keeps the step and the acceptance), the acceptance, finishing
 * the sign-up with the offline path, and landing on Entdecken. The API calls are mocked;
 * the server completes the account.
 * spec: ONB-016, ONB-017, ONB-018
 */
import { fireEvent, waitFor, within } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Text } from 'react-native';

import { finishSignUp, getMe, setSignUpStep, type SignUp } from '../src/api/signUpApi';

jest.mock('../src/api/signUpApi', () => ({
  getMe: jest.fn(),
  updateSignUpAbout: jest.fn(),
  setSignUpStep: jest.fn(),
  setSignUpInterests: jest.fn(),
  searchMunicipalities: jest.fn(),
  listInterests: jest.fn(),
  finishSignUp: jest.fn(),
}));

jest.mock('../src/features/login/loginApi', () => ({
  requestLoginCode: jest.fn(),
  verifyLoginCode: jest.fn(),
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

// The first render of the whole route tree loads every screen module; give it room on a cold cache.
jest.setTimeout(30_000);

const me = getMe as jest.MockedFunction<typeof getMe>;
const saveStep = setSignUpStep as jest.MockedFunction<typeof setSignUpStep>;
const finish = finishSignUp as jest.MockedFunction<typeof finishSignUp>;

const failure = (code: string, details?: Record<string, unknown>) => ({ ok: false as const, kind: 'error' as const, code, details });
const offline = { ok: false as const, kind: 'offline' as const };

const complete: SignUp = {
  step: 'rules',
  firstName: 'Lea',
  birthDate: '1997-03-15',
  homeMunicipality: { id: 6002, name: 'Naters', canton: 'VS' },
  interests: [],
  photos: [{ slot: 0, version: 'v1' }],
};
const member = { id: 'm1', firstName: 'Lea' };

/** The photos step is built by another task; a stub stands in for it. */
function PhotosStub() {
  return <Text testID="stub-photos">photos</Text>;
}
/** The about step is not under test here; a stub keeps it simple. */
function AboutStub() {
  return <Text testID="stub-about">about</Text>;
}

async function openApp(signUp: SignUp | null) {
  if (signUp) {
    mockToken = 'tok-signup';
    me.mockResolvedValue({ ok: true, data: { status: 'signingUp', signUp } });
  }
  await renderRouter(
    { appDir: './src/app', overrides: { '(onboarding)/photos': PhotosStub, '(onboarding)/about': AboutStub } },
    { initialUrl: '/' },
  );
}

async function openRules() {
  await openApp(complete);
  expect(await screen.findByRole('header', { name: 'Spielregeln' })).toBeOnTheScreen();
  expect(screen).toHavePathname('/rules');
}

const rulesScreen = () => within(screen.getByTestId('screen-onb-rules'));
const acceptance = () =>
  rulesScreen().getByRole('checkbox', { name: 'Ich akzeptiere die Nutzungsbedingungen und halte mich an die Spielregeln.' });
const finishButton = () => rulesScreen().getByRole('button', { name: 'Konto anlegen' });

const NOT_DATING = 'Yaruno ist keine Dating-App. Hier findest du Leute für gemeinsame Pläne, nicht für Dates.';
const OFFLINE = 'Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?';

beforeEach(() => {
  mockToken = null;
  for (const mock of [me, saveStep, finish]) mock.mockReset();
  saveStep.mockImplementation(async (step) => ({ ok: true, data: { ...complete, step } }));
  finish.mockResolvedValue({ ok: true, data: member });
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('SCR-onb-rules', () => {
  it('shows step 5 of 5, the six rules as a list, the adults-only note and the two links', async () => {
    await openRules();

    expect(rulesScreen().getByRole('progressbar', { name: 'Schritt 5 von 5' })).toBeOnTheScreen();
    // A container is not itself a screen-reader stop, so it is found by its id and its role checked.
    const list = rulesScreen().getByTestId('onb-rules-list');
    expect(list).toHaveProp('accessibilityRole', 'list');
    expect(list.children).toHaveLength(6);
    for (const title of [
      'Keine Dating-App.',
      'Kein Verkaufen.',
      'Kein Geld unter Teilnehmenden.',
      'Keine Privatadressen.',
      'Absagen statt Ghosten.',
      'Melden statt Aushalten.',
    ]) {
      expect(within(list).getByText(title)).toBeOnTheScreen();
    }
    expect(within(list).getByText('Wenn etwas nicht okay ist, melde es oder blockiere die Person.')).toBeOnTheScreen();
    expect(rulesScreen().getByText('Yaruno ist für Menschen ab 18.')).toBeOnTheScreen();
    expect(rulesScreen().getByRole('link', { name: 'Nutzungsbedingungen' })).toBeOnTheScreen();
    expect(rulesScreen().getByRole('link', { name: 'Datenschutzerklärung' })).toBeOnTheScreen();
    // Resumed on this step: it is already recorded, so nothing is saved again.
    expect(saveStep).not.toHaveBeenCalled();
  });

  it('@spec ONB-016.S1 the finish action is disabled until the person accepts', async () => {
    await openRules();

    expect(acceptance()).not.toBeChecked();
    expect(finishButton()).toBeDisabled();
    await fireEvent.press(finishButton());
    expect(finish).not.toHaveBeenCalled();

    await fireEvent.press(acceptance());
    expect(acceptance()).toBeChecked();
    expect(finishButton()).toBeEnabled();

    await fireEvent.press(acceptance());
    expect(acceptance()).not.toBeChecked();
    expect(finishButton()).toBeDisabled();
  });

  it('@spec ONB-016.S2 the terms of use and the privacy policy open, and returning keeps the step and the acceptance', async () => {
    await openRules();
    await fireEvent.press(acceptance());

    for (const [link, title] of [
      ['Nutzungsbedingungen', 'Nutzungsbedingungen'],
      ['Datenschutzerklärung', 'Datenschutzerklärung'],
    ] as const) {
      await fireEvent.press(rulesScreen().getByRole('link', { name: link }));

      const legal = within(await screen.findByTestId('screen-legal'));
      expect(legal.getByRole('header', { name: title })).toBeOnTheScreen();
      // The placeholder notice stands at the top, right under the title.
      expect(legal.getByTestId('legal-placeholder-notice')).toHaveTextContent('Platzhalter: Der endgültige Text folgt.');
      expect(screen).toHavePathname('/legal');

      await fireEvent.press(legal.getByRole('button', { name: 'Zurück' }));

      await waitFor(() => expect(screen.queryByTestId('screen-legal')).toBeNull());
      expect(screen).toHavePathname('/rules');
      expect(rulesScreen().getByRole('progressbar', { name: 'Schritt 5 von 5' })).toBeOnTheScreen();
      expect(acceptance()).toBeChecked();
      expect(finishButton()).toBeEnabled();
    }
    expect(finish).not.toHaveBeenCalled();
  });

  it('@spec ONB-017.S1 the "not a dating app" line comes before the Spielregeln, so it is visible without scrolling past them', async () => {
    await openRules();

    const scroll = within(screen.getByTestId('screen-onb-rules-scroll'));
    const notDating = scroll.getByText(NOT_DATING);
    const list = scroll.getByTestId('onb-rules-list');
    // In reading order (screen order and screen-reader order) the line comes before the list
    // of rules: every text node is listed depth-first in the order it is laid out.
    const texts = scroll.getAllByText(/./);
    const firstRule = within(list).getByText('Keine Dating-App.');
    expect(texts.indexOf(notDating)).toBeGreaterThanOrEqual(0);
    expect(texts.indexOf(notDating)).toBeLessThan(texts.indexOf(firstRule));
    // It sits right under the headline, not inside or after the list.
    expect(within(list).queryByText(NOT_DATING)).toBeNull();
    const headline = scroll.getByRole('header', { name: 'Spielregeln' });
    const between = texts.slice(texts.indexOf(headline) + 1, texts.indexOf(notDating));
    expect(between).toEqual([]);
  });

  it('@spec ONB-018.S1 when all steps are complete and the person accepts, the account is completed and Entdecken is shown', async () => {
    await openRules();
    await fireEvent.press(acceptance());
    await fireEvent.press(finishButton());

    expect(await screen.findByRole('header', { name: 'Entdecken' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/');
    expect(finish).toHaveBeenCalledTimes(1);
    // The session is now a member's: the tabs are shown and the sign-up screens are gone.
    expect(screen.queryByTestId('screen-onb-rules')).toBeNull();
    expect(screen.getByTestId('screen-discover')).toBeOnTheScreen();
    expect(mockToken).toBe('tok-signup');
  });

  it('@spec ONB-018.S2 when the connection drops while finishing, the offline message with a retry is shown and all input is kept', async () => {
    await openRules();
    await fireEvent.press(acceptance());
    finish.mockResolvedValueOnce(offline);
    await fireEvent.press(finishButton());

    expect(await screen.findByText(OFFLINE)).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(OFFLINE);
    expect(screen).toHavePathname('/rules');
    expect(acceptance()).toBeChecked();
    expect(finishButton()).toBeEnabled();

    // The retry sends the same acceptance again; the server answers the repeat with the member.
    await fireEvent.press(rulesScreen().getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByRole('header', { name: 'Entdecken' })).toBeOnTheScreen();
    expect(finish).toHaveBeenCalledTimes(2);
  });

  it('shows the general error with a retry when finishing fails for another reason, the acceptance kept', async () => {
    await openRules();
    await fireEvent.press(acceptance());
    finish.mockResolvedValueOnce(failure('internal_error'));
    await fireEvent.press(finishButton());

    expect(await screen.findByText('Das hat nicht geklappt. Nochmal?')).toBeOnTheScreen();
    expect(rulesScreen().getByRole('button', { name: 'Nochmal versuchen' })).toBeOnTheScreen();
    expect(acceptance()).toBeChecked();
  });

  it('sends the person to the photos step when the server says the portrait is missing', async () => {
    await openRules();
    await fireEvent.press(acceptance());
    finish.mockResolvedValueOnce(failure('signup_incomplete', { missing: ['portrait'] }));
    await fireEvent.press(finishButton());

    expect(await screen.findByTestId('stub-photos')).toBeOnTheScreen();
    expect(screen).toHavePathname('/photos');
  });

  it('sends the person to the about step when the server says a part of it is missing', async () => {
    await openRules();
    await fireEvent.press(acceptance());
    finish.mockResolvedValueOnce(failure('signup_incomplete', { missing: ['homeMunicipality', 'portrait'] }));
    await fireEvent.press(finishButton());

    expect(await screen.findByTestId('stub-about')).toBeOnTheScreen();
    expect(screen).toHavePathname('/about');
  });

  it('the back button leads to the photos step', async () => {
    await openRules();
    await fireEvent.press(rulesScreen().getByRole('button', { name: 'Zurück' }));

    expect(await screen.findByTestId('stub-photos')).toBeOnTheScreen();
    expect(screen).toHavePathname('/photos');
  });
});

describe('legal screen from the phone screen', () => {
  it('the privacy link on the phone screen opens the privacy policy, and back returns to the phone screen', async () => {
    await openApp(null);
    expect(await screen.findByRole('header', { name: 'Deine Handynummer' })).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('link'));
    const legal = within(await screen.findByTestId('screen-legal'));
    expect(legal.getByRole('header', { name: 'Datenschutzerklärung' })).toBeOnTheScreen();
    expect(legal.getByRole('header', { name: 'Wo deine Daten liegen' })).toBeOnTheScreen();

    await fireEvent.press(legal.getByRole('button', { name: 'Zurück' }));
    await waitFor(() => expect(screen.queryByTestId('screen-legal')).toBeNull());
    expect(screen).toHavePathname('/phone');
  });
});
