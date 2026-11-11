/**
 * Camera and library access on SCR-onb-photos: the camera is asked on the phone; the
 * library opens the system photo picker, which needs no permission, so nothing is asked
 * unless a platform requires it; on the web nothing is asked (a file chooser opens).
 * spec: ONB-014, ONB-015, ADR-0009
 */
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { libraryNeedsPermission } from '../src/features/photos/libraryPermission';
import { choosePhoto, hasAccess, requestAccess } from '../src/features/photos/photoAccess';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: false })),
  getCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: false })),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'blob:photo', width: 10, height: 10 }] })),
}));

jest.mock('../src/features/photos/libraryPermission', () => ({ libraryNeedsPermission: jest.fn(() => false) }));

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  (libraryNeedsPermission as jest.Mock).mockReturnValue(false);
});

it('the library needs no permission on any supported platform', () => {
  const actual = jest.requireActual<typeof import('../src/features/photos/libraryPermission')>(
    '../src/features/photos/libraryPermission',
  );
  expect(actual.libraryNeedsPermission()).toBe(false);
});

it('on the phone, the camera is asked and the library is not', async () => {
  expect(await requestAccess('camera')).toBe(false);
  expect(await requestAccess('library')).toBe(true);
  expect(await hasAccess('library')).toBe(true);
  expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  expect(ImagePicker.getMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
});

it('where the library needs a permission, it is asked and a denial is reported', async () => {
  (libraryNeedsPermission as jest.Mock).mockReturnValue(true);
  expect(await requestAccess('library')).toBe(false);
  expect(await hasAccess('library')).toBe(false);
  expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
});

it('on the web, no permission is asked and the file chooser opens', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  (libraryNeedsPermission as jest.Mock).mockReturnValue(true);
  expect(await requestAccess('camera')).toBe(true);
  expect(await requestAccess('library')).toBe(true);
  expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
  expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  expect(await choosePhoto('library')).toBe('blob:photo');
  expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
});
