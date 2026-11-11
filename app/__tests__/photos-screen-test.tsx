/**
 * SCR-onb-photos: one portrait required, up to three more photos, from the camera or the
 * photo library, the denied-permission path, each photo converted to a JPEG of at most
 * 2048 px on the phone before upload, per-photo upload state with retry, removing, and
 * continuing to the Spielregeln. The API, the picker and the manipulator are mocked; the
 * server decides every limit.
 * spec: ONB-014, ONB-015, ONB-008, ONB-020
 */
import { act, fireEvent, waitFor } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { renderRouter, screen } from 'expo-router/testing-library';
import { AccessibilityInfo, Linking, Text } from 'react-native';

import { deleteSignUpPhoto, putSignUpPhoto, signUpPhotoSource } from '../src/api/photosApi';
import { libraryNeedsPermission } from '../src/features/photos/libraryPermission';
import { getMe, setSignUpInterests, setSignUpStep, type SignUp } from '../src/api/signUpApi';

jest.mock('../src/api/signUpApi', () => ({
  getMe: jest.fn(),
  updateSignUpAbout: jest.fn(),
  setSignUpStep: jest.fn(),
  setSignUpInterests: jest.fn(),
  searchMunicipalities: jest.fn(),
  listInterests: jest.fn(async () => ({ ok: true, data: [] })),
}));

jest.mock('../src/api/photosApi', () => ({
  putSignUpPhoto: jest.fn(),
  deleteSignUpPhoto: jest.fn(),
  signUpPhotoSource: jest.fn(),
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

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(),
  requestMediaLibraryPermissionsAsync: jest.fn(),
  getCameraPermissionsAsync: jest.fn(),
  getMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

// The system photo picker needs no permission on any supported platform; the tests of the
// denied-library path switch this on to stand for a platform where it would.
jest.mock('../src/features/photos/libraryPermission', () => ({ libraryNeedsPermission: jest.fn(() => false) }));

// The manipulator records what was asked of it: the load bounds and the save options.
const mockLoad = jest.fn();
const mockSave = jest.fn();
jest.mock('expo-image-manipulator', () => ({
  SaveFormat: { JPEG: 'jpeg', PNG: 'png', WEBP: 'webp' },
  ImageManipulator: {
    manipulate: (uri: string, options: unknown) => {
      mockLoad(uri, options);
      return {
        renderAsync: async () => ({
          saveAsync: async (saveOptions: unknown) => {
            mockSave(uri, saveOptions);
            return { uri: `${uri}.converted.jpg`, width: 2048, height: 1536 };
          },
        }),
      };
    },
  },
}));

const me = getMe as jest.MockedFunction<typeof getMe>;
const saveStep = setSignUpStep as jest.MockedFunction<typeof setSignUpStep>;
const upload = putSignUpPhoto as jest.MockedFunction<typeof putSignUpPhoto>;
const remove = deleteSignUpPhoto as jest.MockedFunction<typeof deleteSignUpPhoto>;
const photoSource = signUpPhotoSource as jest.MockedFunction<typeof signUpPhotoSource>;
const requestCamera = ImagePicker.requestCameraPermissionsAsync as jest.Mock;
const requestLibrary = ImagePicker.requestMediaLibraryPermissionsAsync as jest.Mock;
const getCamera = ImagePicker.getCameraPermissionsAsync as jest.Mock;
const getLibrary = ImagePicker.getMediaLibraryPermissionsAsync as jest.Mock;
const takePhoto = ImagePicker.launchCameraAsync as jest.Mock;
const pickPhoto = ImagePicker.launchImageLibraryAsync as jest.Mock;

const failure = (code: string, details?: Record<string, unknown>) => ({ ok: false as const, kind: 'error' as const, code, details });
const offline = { ok: false as const, kind: 'offline' as const };

const granted = { status: 'granted', granted: true, canAskAgain: true, expires: 'never', accessPrivileges: 'all' };
const denied = { status: 'denied', granted: false, canAskAgain: false, expires: 'never', accessPrivileges: 'none' };

const picked = (uri: string) => ({
  canceled: false,
  assets: [{ uri, width: 4032, height: 3024, mimeType: 'image/heic' }],
});

const atPhotos: SignUp = {
  step: 'photos',
  firstName: 'Lea',
  birthDate: '1997-03-15',
  homeMunicipality: { id: 6002, name: 'Naters', canton: 'VS' },
  interests: [],
  photos: [],
};
const withPhotos = (...slots: number[]): SignUp => ({
  ...atPhotos,
  photos: slots.map((slot) => ({ slot, version: `v${slot}` })),
});

/** The next sign-up step is built by another task; a stub stands in for it. */
function RulesStub() {
  return <Text testID="stub-rules">rules</Text>;
}

async function openPhotos(signUp: SignUp = atPhotos) {
  mockToken = 'tok-signup';
  me.mockResolvedValue({ ok: true, data: { status: 'signingUp', signUp } });
  await renderRouter({ appDir: './src/app', overrides: { '(onboarding)/rules': RulesStub } }, { initialUrl: '/' });
  expect(await screen.findByRole('header', { name: 'Deine Fotos' })).toBeOnTheScreen();
}

const cameraButton = () => screen.queryByRole('button', { name: 'Foto aufnehmen' });
const libraryButton = () => screen.queryByRole('button', { name: 'Aus deinen Fotos wählen' });
const continueButton = () => screen.getByRole('button', { name: 'Weiter' });

const PORTRAIT_REQUIRED = 'Füg ein Porträt hinzu, damit die anderen wissen, mit wem sie unterwegs sind.';
const PERMISSION_DENIED =
  'Ohne Zugriff auf Kamera oder Fotos kannst du kein Porträt hinzufügen, und ohne Porträt geht es nicht weiter. Du kannst den Zugriff in den Einstellungen erlauben.';

beforeEach(() => {
  mockToken = null;
  for (const mock of [me, saveStep, upload, remove, photoSource]) mock.mockReset();
  for (const mock of [requestCamera, requestLibrary, getCamera, getLibrary, takePhoto, pickPhoto, mockLoad, mockSave]) {
    mock.mockReset();
  }
  (libraryNeedsPermission as jest.Mock).mockReturnValue(false);
  saveStep.mockImplementation(async (step) => ({ ok: true, data: { ...atPhotos, step } }));
  (setSignUpInterests as jest.Mock).mockResolvedValue({ ok: true, data: atPhotos });
  upload.mockImplementation(async (slot) => ({ ok: true, data: { slot, version: `new${slot}` } }));
  remove.mockResolvedValue({ ok: true, data: undefined });
  photoSource.mockImplementation(async (slot) => ({
    uri: `https://api.test/signup/photos/${slot}`,
    headers: { Authorization: 'Bearer tok-signup' },
  }));
  requestCamera.mockResolvedValue(granted);
  requestLibrary.mockResolvedValue(granted);
  getCamera.mockResolvedValue(granted);
  getLibrary.mockResolvedValue(granted);
  takePhoto.mockResolvedValue(picked('file:///camera.heic'));
  pickPhoto.mockResolvedValue(picked('file:///library.heic'));
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe('SCR-onb-photos: the portrait', () => {
  it('shows step 4 of 5 with the portrait placeholder and both add actions', async () => {
    await openPhotos();
    expect(screen.getByRole('progressbar', { name: 'Schritt 4 von 5' })).toBeOnTheScreen();
    expect(screen.getByText('Porträt')).toBeOnTheScreen();
    expect(cameraButton()).toHaveProp('accessibilityHint', 'Foto mit der Kamera aufnehmen');
    expect(libraryButton()).toHaveProp('accessibilityHint', 'Foto aus deinen Fotos wählen');
    await waitFor(() => expect(saveStep).not.toHaveBeenCalled());
  });

  it('@spec ONB-014.S1 continuing without a photo shows that a portrait is required', async () => {
    await openPhotos();
    await fireEvent.press(continueButton());

    expect(await screen.findByText(PORTRAIT_REQUIRED)).toBeOnTheScreen();
    expect(saveStep).not.toHaveBeenCalledWith('rules');
    expect(screen.queryByTestId('stub-rules')).toBeNull();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(PORTRAIT_REQUIRED);
  });

  it('a photo from the library is resized to 2048 px, saved as JPEG and uploaded as the portrait', async () => {
    await openPhotos();
    await fireEvent.press(libraryButton()!);

    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///library.heic.converted.jpg'));
    expect(requestCamera).not.toHaveBeenCalled();
    expect(pickPhoto).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
    // Bounded to 2048 px on both edges, so the longer edge is at most 2048 px; never enlarged.
    expect(mockLoad).toHaveBeenCalledWith('file:///library.heic', { maxWidth: 2048, maxHeight: 2048 });
    expect(mockSave).toHaveBeenCalledWith('file:///library.heic', expect.objectContaining({ format: 'jpeg', compress: 0.85 }));
    expect(await screen.findByRole('button', { name: 'Foto 1 entfernen' })).toBeOnTheScreen();
  });

  it('the library opens the system photo picker on the tap without asking for any permission', async () => {
    await openPhotos();
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(pickPhoto).toHaveBeenCalledTimes(1));
    expect(requestLibrary).not.toHaveBeenCalled();
    expect(getLibrary).not.toHaveBeenCalled();
    expect(requestCamera).not.toHaveBeenCalled();
    expect(pickPhoto).toHaveBeenCalledWith(expect.objectContaining({ allowsEditing: false }));
    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///library.heic.converted.jpg'));
  });

  it('where the library needs a permission, it is asked on the tap and the picker opens when granted', async () => {
    (libraryNeedsPermission as jest.Mock).mockReturnValue(true);
    await openPhotos();
    expect(requestLibrary).not.toHaveBeenCalled();
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///library.heic.converted.jpg'));
    expect(requestLibrary).toHaveBeenCalledTimes(1);
    expect(pickPhoto).toHaveBeenCalledTimes(1);
  });

  it('asks for the camera only when the camera action is tapped', async () => {
    await openPhotos();
    expect(requestCamera).not.toHaveBeenCalled();
    expect(requestLibrary).not.toHaveBeenCalled();
    await fireEvent.press(cameraButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///camera.heic.converted.jpg'));
    expect(requestCamera).toHaveBeenCalledTimes(1);
    expect(requestLibrary).not.toHaveBeenCalled();
  });

  it('a cancelled pick changes nothing', async () => {
    await openPhotos();
    pickPhoto.mockResolvedValueOnce({ canceled: true, assets: null });
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(pickPhoto).toHaveBeenCalled());
    expect(upload).not.toHaveBeenCalled();
    expect(screen.getByText('Porträt')).toBeOnTheScreen();
  });

  it('with the portrait uploaded, continuing records the rules step and opens SCR-onb-rules', async () => {
    await openPhotos();
    await fireEvent.press(libraryButton()!);
    await screen.findByRole('button', { name: 'Foto 1 entfernen' });
    await fireEvent.press(continueButton());

    expect(await screen.findByTestId('stub-rules')).toBeOnTheScreen();
    expect(screen).toHavePathname('/rules');
    expect(saveStep).toHaveBeenCalledWith('rules');
  });

  it('when the server still misses the portrait, continuing shows that a portrait is required', async () => {
    await openPhotos(withPhotos(0));
    saveStep.mockResolvedValueOnce(failure('signup_incomplete', { missing: ['portrait'] }));
    await fireEvent.press(continueButton());
    expect(await screen.findByText(PORTRAIT_REQUIRED)).toBeOnTheScreen();
    expect(screen.queryByTestId('stub-rules')).toBeNull();
  });

  it('when recording the step fails offline, the offline message with a retry is shown', async () => {
    await openPhotos(withPhotos(0));
    saveStep.mockResolvedValueOnce(offline);
    await fireEvent.press(continueButton());
    expect(await screen.findByText('Keine Verbindung. Deine Eingaben bleiben erhalten. Nochmal?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    expect(await screen.findByTestId('stub-rules')).toBeOnTheScreen();
  });

  it('removing the portrait deletes its slot on the server and offers the placeholder again', async () => {
    await openPhotos(withPhotos(0));
    await fireEvent.press(screen.getByRole('button', { name: 'Foto 1 entfernen' }));
    await waitFor(() => expect(remove).toHaveBeenCalledWith(0));
    expect(await screen.findByText('Porträt')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'Foto 1 entfernen' })).toBeNull();

    // A new photo replaces the portrait in slot 0.
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///library.heic.converted.jpg'));
  });
});

describe('SCR-onb-photos: further photos', () => {
  it('@spec ONB-014.S2 with a portrait and three more photos, adding a fifth is no longer offered', async () => {
    await openPhotos(withPhotos(0, 1, 2));
    expect(libraryButton()).toBeOnTheScreen();
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(3, 'file:///library.heic.converted.jpg'));
    expect(await screen.findByRole('button', { name: 'Foto 4 entfernen' })).toBeOnTheScreen();

    expect(cameraButton()).toBeNull();
    expect(libraryButton()).toBeNull();
    expect(upload).toHaveBeenCalledTimes(1);
  });

  it('@spec ONB-014.S2 a resumed sign-up with four photos offers no add action', async () => {
    await openPhotos(withPhotos(0, 1, 2, 3));
    await waitFor(() => expect(photoSource).toHaveBeenCalledTimes(4));
    expect(cameraButton()).toBeNull();
    expect(libraryButton()).toBeNull();
    for (const position of [1, 2, 3, 4]) {
      expect(screen.getByRole('button', { name: `Foto ${position} entfernen` })).toBeOnTheScreen();
    }
  });

  it('a resumed sign-up shows the uploaded photos through the server with the session header', async () => {
    await openPhotos(withPhotos(0, 2));
    await waitFor(() => expect(photoSource).toHaveBeenCalledWith(0));
    expect(photoSource).toHaveBeenCalledWith(2);
    const images = await screen.findAllByTestId(/^onb-photo-image-/);
    expect(images.map((image) => image.props.source)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ uri: 'https://api.test/signup/photos/0', headers: { Authorization: 'Bearer tok-signup' } }),
      ]),
    );
    // A free slot between photos is filled first.
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(1, 'file:///library.heic.converted.jpg'));
  });
});

describe('SCR-onb-photos: uploading', () => {
  it('shows the upload in progress on that photo', async () => {
    let finish: (value: Awaited<ReturnType<typeof putSignUpPhoto>>) => void = () => {};
    upload.mockImplementationOnce(() => new Promise((resolve) => (finish = resolve)));
    await openPhotos();
    await fireEvent.press(libraryButton()!);

    expect(await screen.findByText('Wird hochgeladen …')).toBeOnTheScreen();
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Wird hochgeladen …');
    await act(async () => finish({ ok: true, data: { slot: 0, version: 'a' } }));
    await waitFor(() => expect(screen.queryByText('Wird hochgeladen …')).toBeNull());
  });

  it('a failed upload offers a retry on that photo', async () => {
    upload.mockResolvedValueOnce(offline);
    await openPhotos();
    await fireEvent.press(libraryButton()!);

    expect(await screen.findByText('Hochladen hat nicht geklappt. Nochmal?')).toBeOnTheScreen();
    await fireEvent.press(continueButton());
    expect(await screen.findByText(PORTRAIT_REQUIRED)).toBeOnTheScreen();

    await fireEvent.press(screen.getByRole('button', { name: 'Nochmal versuchen' }));
    await waitFor(() => expect(upload).toHaveBeenCalledTimes(2));
    expect(upload).toHaveBeenLastCalledWith(0, 'file:///library.heic.converted.jpg');
    await waitFor(() => expect(screen.queryByText('Hochladen hat nicht geklappt. Nochmal?')).toBeNull());
    expect(screen.queryByText(PORTRAIT_REQUIRED)).toBeNull();
  });

  it('an expired session during upload leads back to the phone number', async () => {
    upload.mockResolvedValueOnce(failure('unauthenticated'));
    await openPhotos();
    await fireEvent.press(libraryButton()!);
    expect(await screen.findByRole('header', { name: 'Deine Handynummer' })).toBeOnTheScreen();
  });
});

describe('SCR-onb-photos: permission denied', () => {
  it('@spec ONB-015.S1 with photo-library access denied, tapping add explains it with a settings button and keeps the camera', async () => {
    // Only where the library needs a permission can it be denied.
    (libraryNeedsPermission as jest.Mock).mockReturnValue(true);
    requestLibrary.mockResolvedValue(denied);
    getLibrary.mockResolvedValue(denied);
    const openSettings = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    await openPhotos();

    await fireEvent.press(libraryButton()!);

    expect(await screen.findByText(PERMISSION_DENIED)).toBeOnTheScreen();
    expect(pickPhoto).not.toHaveBeenCalled();
    expect(cameraButton()).toBeOnTheScreen();
    await fireEvent.press(screen.getByRole('button', { name: 'Einstellungen öffnen' }));
    expect(openSettings).toHaveBeenCalledTimes(1);

    // The camera is allowed and still works.
    await fireEvent.press(cameraButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///camera.heic.converted.jpg'));
  });

  it('with the camera denied, the library remains offered', async () => {
    requestCamera.mockResolvedValue(denied);
    await openPhotos();
    await fireEvent.press(cameraButton()!);
    expect(await screen.findByText(PERMISSION_DENIED)).toBeOnTheScreen();
    expect(takePhoto).not.toHaveBeenCalled();
    expect(libraryButton()).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Einstellungen öffnen' })).toBeOnTheScreen();

    // The library still works without any permission.
    await fireEvent.press(libraryButton()!);
    await waitFor(() => expect(upload).toHaveBeenCalledWith(0, 'file:///library.heic.converted.jpg'));
    expect(requestLibrary).not.toHaveBeenCalled();
  });

  it('when the camera refuses to open (storage denied on older Android), the explanation is shown', async () => {
    takePhoto.mockRejectedValueOnce(new Error('User rejected permissions'));
    await openPhotos();
    await fireEvent.press(cameraButton()!);
    expect(await screen.findByText(PERMISSION_DENIED)).toBeOnTheScreen();
    expect(upload).not.toHaveBeenCalled();
    expect(libraryButton()).toBeOnTheScreen();
  });
});

describe('SCR-onb-photos: going back', () => {
  it('the back button leads to SCR-onb-interests and the photos are kept when coming back', async () => {
    await openPhotos();
    await fireEvent.press(libraryButton()!);
    await screen.findByRole('button', { name: 'Foto 1 entfernen' });

    await fireEvent.press(screen.getByRole('button', { name: 'Zurück' }));
    expect(await screen.findByRole('header', { name: 'Was machst du gern?' })).toBeOnTheScreen();
    expect(screen).toHavePathname('/interests');

    await fireEvent.press(continueButton());
    expect(await screen.findByRole('header', { name: 'Deine Fotos' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Foto 1 entfernen' })).toBeOnTheScreen();
    await act(async () => {});
  });
});
