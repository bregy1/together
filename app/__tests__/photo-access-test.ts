/**
 * Camera and library access on SCR-onb-photos: asked on the phone, never on the web
 * (the browser preview opens a file chooser and has no permission to ask).
 * spec: ONB-014, ONB-015, ADR-0009
 */
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

import { choosePhoto, requestAccess } from '../src/features/photos/photoAccess';

jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: false })),
  requestMediaLibraryPermissionsAsync: jest.fn(async () => ({ granted: true })),
  getCameraPermissionsAsync: jest.fn(),
  getMediaLibraryPermissionsAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(async () => ({ canceled: false, assets: [{ uri: 'blob:photo', width: 10, height: 10 }] })),
}));

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

it('on the phone, access is asked for the tapped action', async () => {
  expect(await requestAccess('camera')).toBe(false);
  expect(await requestAccess('library')).toBe(true);
  expect(ImagePicker.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1);
  expect(ImagePicker.requestMediaLibraryPermissionsAsync).toHaveBeenCalledTimes(1);
});

it('on the web, no permission is asked and the file chooser opens', async () => {
  jest.replaceProperty(Platform, 'OS', 'web');
  expect(await requestAccess('camera')).toBe(true);
  expect(await requestAccess('library')).toBe(true);
  expect(ImagePicker.requestCameraPermissionsAsync).not.toHaveBeenCalled();
  expect(ImagePicker.requestMediaLibraryPermissionsAsync).not.toHaveBeenCalled();
  expect(await choosePhoto('library')).toBe('blob:photo');
  expect(ImagePicker.launchImageLibraryAsync).toHaveBeenCalledWith(expect.objectContaining({ mediaTypes: ['images'] }));
});
