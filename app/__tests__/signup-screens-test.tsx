/**
 * SCR-onb-about, SCR-onb-age-stop and SCR-onb-interests: first name, birth date with the
 * age confirmation and the age stop, the home municipality search, the interests, going
 * back without losing input, and resuming an unfinished sign-up at start-up. The API calls
 * are mocked; the server decides every rule.
 * spec: ONB-008 … ONB-013, ONB-020
 */
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Text } from 'react-native';

import {
  getMe,
  listInterests,
  searchMunicipalities,
  setSignUpInterests,
  setSignUpStep,
  updateSignUpAbout,
  type Interest,
  type Municipality,
  type SignUp,
} from '../src/api/signUpApi';

jest.mock('../src/api/signUpApi', () => ({
  getMe: jest.fn(),
  updateSignUpAbout: jest.fn(),
  setSignUpStep: jest.fn(),
  setSignUpInterests: jest.fn(),
  searchMunicipalities: jest.fn(),
  listInterests: jest.fn(),
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

const me = getMe as jest.MockedFunction<typeof getMe>;
const saveAbout = updateSignUpAbout as jest.MockedFunction<typeof updateSignUpAbout>;
const saveStep = setSignUpStep as jest.MockedFunction<typeof setSignUpStep>;
const saveInterests = setSignUpInterests as jest.MockedFunction<typeof setSignUpInterests>;
const searchPlaces = searchMunicipalities as jest.MockedFunction<typeof searchMunicipalities>;
const loadInterests = listInterests as jest.MockedFunction<typeof listInterests>;

const failure = (code: string, details?: Record<string, unknown>) => ({ ok: false as const, kind: 'error' as const, code, details });
const offline = { ok: false as const, kind: 'offline' as const };

const naters: Municipality = { id: 6002, name: 'Naters', canton: 'VS' };
const nax: Municipality = { id: 6267, name: 'Nax', canton: 'VS' };
const interest = (id: string, de: string): Interest => ({ id, names: { de } });
const INTERESTS = [
  interest('outdoor', 'Outdoor'),
  interest('sport', 'Sport'),
  interest('kultur', 'Kultur'),
  interest('essen', 'Essen & Trinken'),
  interest('musik', 'Musik'),
  interest('spiele', 'Spiele'),
  interest('reisen', 'Reisen'),
];

const emptySignUp: SignUp = { step: 'about', interests: [], photos: [] };
const savedAbout: SignUp = {
  step: 'about',
  firstName: 'Lea',
  birthDate: '1997-03-15',
  homeMunicipality: naters,
  interests: [],
  photos: [],
};

// "Today" is 11 November 2026 in Switzerland.
const NOW = Date.parse('2026-11-11T10:00:00Z');

/** The next sign-up step is built by another task; a stub stands in for it. */
function PhotosStub() {
  return <Text testID="stub-photos">photos</Text>;
}

async function openApp(signUp: SignUp | null) {
  if (signUp) {
    mockToken = 'tok-signup';
    me.mockResolvedValue({ ok: true, data: { status: 'signingUp', signUp } });
  }
  await renderRouter({ appDir: './src/app', overrides: { '(onboarding)/photos': PhotosStub } }, { initialUrl: '/' });
}

async function openAbout(signUp: SignUp = emptySignUp) {
  await openApp(signUp);
  expect(await screen.findByRole('header', { name: 'Das bist du' })).toBeOnTheScreen();
}

const firstNameField = () => screen.getByLabelText('Vorname');
const dayField = () => screen.getByLabelText('Tag');
const monthField = () => screen.getByLabelText('Monat');
const yearField = () => screen.getByLabelText('Jahr');
const regionField = () => screen.getByLabelText('Wo möchtest du etwas unternehmen?');
const continueButton = () => screen.getByRole('button', { name: 'Weiter' });

async function typeBirthDate(day: string, month: string, year: string) {
  await fireEvent.changeText(dayField(), day);
  await fireEvent.changeText(monthField(), month);
  await fireEvent.changeText(yearField(), year);
}

async function chooseNaters() {
  searchPlaces.mockResolvedValueOnce({ ok: true, data: [naters, nax] });
  await fireEvent.changeText(regionField(), 'Na');
  await fireEvent.press(await screen.findByRole('button', { name: 'Naters (VS)' }));
}

/** Fills the about step completely with a 29-year-old's data. */
async function fillAbout({ firstName = 'Lea', birth = ['15', '03', '1997'] }: { firstName?: string; birth?: string[] } = {}) {
  await fireEvent.changeText(firstNameField(), firstName);
  const [day, month, year] = birth;
  await typeBirthDate(day, month, year);
  await chooseNaters();
}

/** Whether a call saved a birth date (the age is only saved after the confirmation). */
const birthDateCalls = () => saveAbout.mock.calls.filter(([update]) => update.birthDate !== undefined);

async function confirmAge(age: number) {
  await screen.findByText(`Du bist ${age}. Stimmt das?`);
  await fireEvent.press(screen.getByRole('button', { name: 'Bestätigen' }));
}

beforeEach(() => {
  mockToken = null;
  for (const mock of [me, saveAbout, saveStep, saveInterests, searchPlaces, loadInterests]) mock.mockReset();
  saveAbout.mockImplementation(async (update) => ({ ok: true, data: { ...savedAbout, ...update } as SignUp }));
  saveStep.mockImplementation(async (step) => ({ ok: true, data: { ...savedAbout, step } }));
  saveInterests.mockImplementation(async (ids) => ({
    ok: true,
    data: { ...savedAbout, interests: INTERESTS.filter((i) => ids.includes(i.id)) },
  }));
  searchPlaces.mockResolvedValue({ ok: true, data: [] });
  loadInterests.mockResolvedValue({ ok: true, data: INTERESTS });
  jest.spyOn(Date, 'now').mockReturnValue(NOW);
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('start-up with a stored session', () => {
  it('@spec ONB-008.S1 a person who entered a first name and closed the app resumes on SCR-onb-about with it filled in', async () => {
    await openAbout({ step: 'about', firstName: 'Lea', interests: [], photos: [] });

    expect(screen).toHavePathname('/about');
    expect(firstNameField().props.value).toBe('Lea');
    expect(screen.getByRole('progressbar', { name: 'Schritt 2 von 5' })).toBeOnTheScreen();
    expect(me).toHaveBeenCalledTimes(1);
  });

  it('saves the first name while it is typed, so it is there when the app is reopened', async () => {
    await openAbout();
    await fireEvent.changeText(firstNameField(), 'Lea');
    await waitFor(() => expect(saveAbout).toHaveBeenCalledWith({ firstName: 'Lea' }), { timeout: 3000 });
  });

  it('resumes at the interests step with the saved interests chosen', async () => {
    await openApp({ ...savedAbout, step: 'interests', interests: [INTERESTS[1]] });

    expect(await screen.findByRole('header', { name: 'Was machst du gern?' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/interests');
    expect(screen.getByRole('button', { name: 'Sport' })).toBeSelected();
  });

  it('resumes at the photos step', async () => {
    await openApp({ ...savedAbout, step: 'photos' });
    expect(await screen.findByTestId('stub-photos')).toBeOnTheScreen();
    expect(screen).toHavePathname('/photos');
  });

  it('a member starts on the tabs', async () => {
    mockToken = 'tok-member';
    me.mockResolvedValue({ ok: true, data: { status: 'member', member: { id: 'm1', firstName: 'Lea' } } });
    await openApp(null);
    expect(await screen.findByRole('header', { name: 'Entdecken' })).toBeOnTheScreen();
  });

  it('an unknown or expired session is forgotten and the phone screen is shown', async () => {
    mockToken = 'tok-old';
    me.mockResolvedValue(failure('unauthenticated'));
    await openApp(null);
    expect(await screen.findByRole('header', { name: 'Deine Handynummer' })).toBeOnTheScreen();
    expect(mockToken).toBeNull();
  });

  it('without a connection, the offline message with a retry is shown instead of guessing', async () => {
    mockToken = 'tok-signup';
    me.mockResolvedValueOnce(offline);
    await openApp(null);

    expect(await screen.findByText('Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?')).toBeOnTheScreen();
    expect(screen.queryByRole('header', { name: 'Entdecken' })).toBeNull();
    expect(mockToken).toBe('tok-signup');

    me.mockResolvedValueOnce({ ok: true, data: { status: 'signingUp', signUp: { ...emptySignUp, firstName: 'Lea' } } });
    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByRole('header', { name: 'Das bist du' })).toBeOnTheScreen();
    expect(firstNameField().props.value).toBe('Lea');
  });
});

describe('SCR-onb-about: first name', () => {
  it('@spec ONB-009.S1 an empty first name shows firstNameRequired', async () => {
    await openAbout();
    await typeBirthDate('15', '03', '1997');
    await chooseNaters();
    await fireEvent.press(continueButton());

    expect(await screen.findByText('Wie heisst du? Gib deinen Vornamen ein.')).toBeOnTheScreen();
    expect(screen.queryByText(/Stimmt das\?/)).toBeNull();
    expect(birthDateCalls()).toEqual([]);
  });

  it.each(['Anna2', 'Anna😀'])('@spec ONB-009.S2 the first name %s shows firstNameInvalid', async (name) => {
    await openAbout();
    await fillAbout({ firstName: name });
    await fireEvent.press(continueButton());

    expect(
      await screen.findByText('Nur Buchstaben, Leerzeichen, Bindestrich und Apostroph, höchstens 30 Zeichen.'),
    ).toBeOnTheScreen();
    expect(screen.queryByText(/Stimmt das\?/)).toBeNull();
    expect(birthDateCalls()).toEqual([]);
    expect(saveAbout).not.toHaveBeenCalledWith(expect.objectContaining({ firstName: name }));
  });

  it('@spec ONB-009.S3 the first name "Zoë-Marie" is accepted', async () => {
    await openAbout();
    await fillAbout({ firstName: 'Zoë-Marie' });
    await fireEvent.press(continueButton());
    await confirmAge(29);

    await screen.findByRole('header', { name: 'Was machst du gern?' });
    expect(saveAbout).toHaveBeenCalledWith({ firstName: 'Zoë-Marie', birthDate: '1997-03-15', homeMunicipalityId: 6002 });
    expect(screen.queryByText(/Nur Buchstaben/)).toBeNull();
  });

  it('shows the field errors the server answers with validation_failed', async () => {
    await openAbout();
    await fillAbout();
    await fireEvent.press(continueButton());
    saveAbout.mockResolvedValueOnce(failure('validation_failed', { fields: [{ field: 'firstName', problem: 'invalid' }] }));
    await confirmAge(29);

    expect(await screen.findByText(/Nur Buchstaben, Leerzeichen/)).toBeOnTheScreen();
    expect(screen).toHavePathname('/about');
    expect(saveStep).not.toHaveBeenCalledWith('interests');
  });
});

describe('SCR-onb-about: birth date and age', () => {
  it('@spec ONB-010.S1 a birth date 17 years ago stops the sign-up on SCR-onb-age-stop and creates no profile', async () => {
    await openAbout();
    await fillAbout({ birth: ['11', '11', '2009'] });
    saveAbout.mockResolvedValueOnce(failure('age_below_minimum'));
    await fireEvent.press(continueButton());

    expect(await screen.findByRole('header', { name: 'Yaruno ist ab 18' })).toBeOnTheScreen();
    expect(screen.getByText(/Yaruno ist nur für Menschen ab 18 Jahren/)).toBeOnTheScreen();
    expect(screen).toHavePathname('/age-stop');
    // The birth date goes to the server at once, so the server can delete everything.
    expect(birthDateCalls().map(([update]) => update.birthDate)).toEqual(['2009-11-11']);
    expect(screen.queryByText(/Stimmt das\?/)).toBeNull();
    expect(saveStep).not.toHaveBeenCalled();
    expect(saveInterests).not.toHaveBeenCalled();
    expect(mockToken).toBeNull();
    // No way forward.
    expect(screen.queryByRole('button', { name: 'Weiter' })).toBeNull();
  });

  it('when the server answers age_below_minimum after the confirmation, the age stop is shown too', async () => {
    await openAbout();
    await fillAbout({ birth: ['11', '11', '2008'] });
    await fireEvent.press(continueButton());
    saveAbout.mockResolvedValueOnce(failure('age_below_minimum'));
    await confirmAge(18);

    expect(await screen.findByRole('header', { name: 'Yaruno ist ab 18' })).toBeOnTheScreen();
    expect(mockToken).toBeNull();
    expect(saveStep).not.toHaveBeenCalled();
  });

  it('@spec ONB-010.S2 a person who turns 18 today goes on with the sign-up', async () => {
    await openAbout();
    await fillAbout({ birth: ['11', '11', '2008'] });
    await fireEvent.press(continueButton());
    await confirmAge(18);

    expect(await screen.findByRole('header', { name: 'Was machst du gern?' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/interests');
    expect(saveAbout).toHaveBeenCalledWith({ firstName: 'Lea', birthDate: '2008-11-11', homeMunicipalityId: 6002 });
    expect(saveStep).toHaveBeenCalledWith('interests');
    expect(mockToken).toBe('tok-signup');
  });

  it.each([
    ['a date that does not exist', ['31', '02', '1990']],
    ['a date in the future', ['12', '11', '2026']],
  ])('@spec ONB-010.S5 %s shows birthDateInvalid, does not go on and deletes nothing', async (_, birth) => {
    await openAbout();
    await fillAbout({ birth });
    await fireEvent.press(continueButton());

    expect(await screen.findByText('Dieses Datum gibt es nicht. Prüf es nochmal.')).toBeOnTheScreen();
    expect(screen.queryByText(/Stimmt das\?/)).toBeNull();
    expect(birthDateCalls()).toEqual([]);
    expect(saveStep).not.toHaveBeenCalled();
    expect(screen).toHavePathname('/about');
    expect(mockToken).toBe('tok-signup');
  });

  it('@spec ONB-011.S1 a birth date that gives 29 years shows "Du bist 29. Stimmt das?" with confirm and change', async () => {
    await openAbout();
    await fillAbout({ birth: ['15', '03', '1997'] });
    await fireEvent.press(continueButton());

    expect(await screen.findByText('Du bist 29. Stimmt das?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Bestätigen' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Ändern' })).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Du bist 29. Stimmt das?');
    // Not saved before the confirmation.
    expect(birthDateCalls()).toEqual([]);
  });

  it('@spec ONB-011.S2 choosing change returns to the form with the birth date ready to edit and nothing saved', async () => {
    await openAbout();
    await fillAbout({ birth: ['15', '03', '1997'] });
    await fireEvent.press(continueButton());
    await screen.findByText('Du bist 29. Stimmt das?');
    await fireEvent.press(screen.getByRole('button', { name: 'Ändern' }));

    expect(screen.queryByText('Du bist 29. Stimmt das?')).toBeNull();
    expect(screen).toHavePathname('/about');
    expect(dayField().props.value).toBe('15');
    expect(monthField().props.value).toBe('03');
    expect(yearField().props.value).toBe('1997');
    expect(dayField().props.editable).not.toBe(false);
    expect(birthDateCalls()).toEqual([]);
    expect(saveStep).not.toHaveBeenCalled();
  });

  it('the three date fields form one labelled group', async () => {
    await openAbout();
    expect(screen.getByLabelText('Geburtsdatum')).toBeOnTheScreen();
    expect(screen.getByLabelText('Geburtsdatum')).toContainElement(dayField());
  });

  it('without a connection, the offline message with a retry is shown and the input is kept', async () => {
    await openAbout();
    await fillAbout();
    await fireEvent.press(continueButton());
    saveAbout.mockResolvedValueOnce(offline);
    await confirmAge(29);

    expect(await screen.findByText('Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?')).toBeOnTheScreen();
    expect(firstNameField().props.value).toBe('Lea');
    expect(yearField().props.value).toBe('1997');

    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByRole('header', { name: 'Was machst du gern?' })).toBeOnTheScreen();
  });
});

describe('SCR-onb-about: home region', () => {
  it('@spec ONB-012.S1 searching "Na" offers matching municipalities such as Naters, which can be chosen', async () => {
    await openAbout();
    searchPlaces.mockResolvedValueOnce({ ok: true, data: [naters, nax] });
    await fireEvent.changeText(regionField(), 'Na');

    const result = await screen.findByRole('button', { name: 'Naters (VS)' });
    expect(screen.getByRole('button', { name: 'Nax (VS)' })).toBeOnTheScreen();
    expect(searchPlaces).toHaveBeenCalledWith('Na');
    await fireEvent.press(result);

    expect(await screen.findByRole('button', { name: 'Naters (VS)', selected: true })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Nax (VS)' })).toBeNull();
    await waitFor(() => expect(saveAbout).toHaveBeenCalledWith({ homeMunicipalityId: 6002 }));
  });

  it('waits briefly between keystrokes before searching', async () => {
    await openAbout();
    await fireEvent.changeText(regionField(), 'N');
    await fireEvent.changeText(regionField(), 'Na');
    await fireEvent.changeText(regionField(), 'Nat');
    await waitFor(() => expect(searchPlaces).toHaveBeenCalled());
    expect(searchPlaces.mock.calls).toEqual([['Nat']]);
  });

  it('@spec ONB-012.S2 continuing without a chosen region shows regionRequired', async () => {
    await openAbout();
    await fireEvent.changeText(firstNameField(), 'Lea');
    await typeBirthDate('15', '03', '1997');
    await fireEvent.press(continueButton());

    expect(await screen.findByText('Wähl deine Gemeinde aus der Liste.')).toBeOnTheScreen();
    expect(screen.queryByText(/Stimmt das\?/)).toBeNull();
    expect(birthDateCalls()).toEqual([]);
  });

  it('@spec ONB-012.S3 a place outside Switzerland offers nothing and shows regionNoMatch', async () => {
    await openAbout();
    searchPlaces.mockResolvedValueOnce({ ok: true, data: [] });
    await fireEvent.changeText(regionField(), 'Paris');

    expect(await screen.findByText('Keine Schweizer Gemeinde gefunden. Prüf die Schreibweise.')).toBeOnTheScreen();
    expect(searchPlaces).toHaveBeenCalledWith('Paris');
    expect(screen.queryByRole('button', { name: /\(\w\w\)$/ })).toBeNull();
  });
});

describe('SCR-onb-interests', () => {
  async function openInterests(signUp: Partial<SignUp> = {}) {
    await openApp({ ...savedAbout, step: 'interests', ...signUp });
    expect(await screen.findByRole('header', { name: 'Was machst du gern?' })).toBeOnTheScreen();
    await screen.findByRole('button', { name: 'Outdoor' });
  }
  const searchField = () => screen.getByLabelText('Interesse suchen');

  it('@spec ONB-013.S1 searching "out" offers Outdoor; a word not on the list creates nothing', async () => {
    await openInterests();
    expect(screen.getByRole('progressbar', { name: 'Schritt 3 von 5' })).toBeOnTheScreen();
    expect(loadInterests).toHaveBeenCalledTimes(1);

    await fireEvent.changeText(searchField(), 'out');
    expect(screen.getByRole('button', { name: 'Outdoor' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Sport' })).toBeNull();

    await fireEvent.changeText(searchField(), 'Klettern');
    expect(screen.getByText('Nichts gefunden. Versuch ein anderes Wort.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Klettern' })).toBeNull();
    await fireEvent(searchField(), 'submitEditing');
    expect(screen.queryByRole('button', { name: 'Klettern' })).toBeNull();
    expect(saveInterests).not.toHaveBeenCalled();
  });

  it('@spec ONB-013.S2 with 5 interests chosen, a sixth is not added and the limit is shown', async () => {
    await openInterests();
    for (const name of ['Outdoor', 'Sport', 'Kultur', 'Essen & Trinken', 'Musik']) {
      await fireEvent.press(screen.getByRole('button', { name }));
    }
    expect(screen.getByText('5 von 5 gewählt')).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Spiele' }));

    expect(screen.getByText('Du hast schon 5 Interessen. Entfern eins, um ein anderes zu wählen.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Spiele' })).not.toBeSelected();
    expect(screen.getByText('5 von 5 gewählt')).toBeOnTheScreen();
    expect(screen.getAllByRole('button', { selected: true })).toHaveLength(5);
  });

  it('@spec ONB-013.S3 continuing with no interest chosen shows SCR-onb-photos', async () => {
    await openInterests();
    expect(screen.getByText('0 von 5 gewählt')).toBeOnTheScreen();
    await fireEvent.press(continueButton());

    expect(await screen.findByTestId('stub-photos')).toBeOnTheScreen();
    expect(screen).toHavePathname('/photos');
    expect(saveInterests).toHaveBeenCalledWith([]);
    expect(saveStep).toHaveBeenCalledWith('photos');
  });

  it('saves the chosen interests in the chosen order', async () => {
    await openInterests();
    await fireEvent.press(screen.getByRole('button', { name: 'Kultur' }));
    await fireEvent.press(screen.getByRole('button', { name: 'Outdoor' }));
    await fireEvent.press(continueButton());
    await screen.findByTestId('stub-photos');
    expect(saveInterests).toHaveBeenCalledWith(['kultur', 'outdoor']);
  });

  it('when the list cannot be loaded, the offline message with a retry is shown', async () => {
    loadInterests.mockResolvedValueOnce(offline);
    await openApp({ ...savedAbout, step: 'interests' });

    expect(await screen.findByText('Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByRole('button', { name: 'Outdoor' })).toBeOnTheScreen();
  });

  it('when saving fails, the general error with a retry is shown and the choice is kept', async () => {
    await openInterests();
    await fireEvent.press(screen.getByRole('button', { name: 'Sport' }));
    saveInterests.mockResolvedValueOnce(failure('internal_error'));
    await fireEvent.press(continueButton());

    expect(await screen.findByText('Das hat nicht geklappt. Nochmal?')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Sport' })).toBeSelected();
    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByTestId('stub-photos')).toBeOnTheScreen();
  });
});

describe('going back', () => {
  it('@spec ONB-020.S1 three chosen interests are still chosen after going back to SCR-onb-about and forward again', async () => {
    await openAbout();
    await fillAbout();
    await fireEvent.press(continueButton());
    await confirmAge(29);
    await screen.findByRole('header', { name: 'Was machst du gern?' });
    await screen.findByRole('button', { name: 'Outdoor' });
    for (const name of ['Outdoor', 'Kultur', 'Musik']) {
      await fireEvent.press(screen.getByRole('button', { name }));
    }

    await fireEvent.press(screen.getByRole('button', { name: 'Zurück' }));
    expect(await screen.findByRole('header', { name: 'Das bist du' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/about');
    expect(firstNameField().props.value).toBe('Lea');
    expect(yearField().props.value).toBe('1997');
    expect(screen.getByRole('button', { name: 'Naters (VS)', selected: true })).toBeOnTheScreen();
    await waitFor(() => expect(saveStep).toHaveBeenLastCalledWith('about'));

    await fireEvent.press(continueButton());
    await confirmAge(29);
    expect(await screen.findByRole('header', { name: 'Was machst du gern?' })).toBeOnTheScreen();
    for (const name of ['Outdoor', 'Kultur', 'Musik']) {
      expect(screen.getByRole('button', { name })).toBeSelected();
    }
    expect(screen.getByText('3 von 5 gewählt')).toBeOnTheScreen();
    await act(async () => {});
  });
});
