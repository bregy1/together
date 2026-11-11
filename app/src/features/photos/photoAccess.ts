// Camera and photo-library access, asked only when the person taps that action and only
// where the platform requires it, and the system picker itself. The camera always needs
// the person's permission on a phone. The photo library opens the system photo picker,
// which needs none (see libraryPermission.ts). On the web nothing is asked: the picker is
// a file chooser opened by the tap.
// spec: ONB-014, ONB-015; product/app.md → Permissions
import {
  getCameraPermissionsAsync,
  getMediaLibraryPermissionsAsync,
  launchCameraAsync,
  launchImageLibraryAsync,
  requestCameraPermissionsAsync,
  requestMediaLibraryPermissionsAsync,
  type ImagePickerOptions,
} from 'expo-image-picker';
import { Platform } from 'react-native';

import { libraryNeedsPermission } from './libraryPermission';

export type PhotoOrigin = 'camera' | 'library';

/** Whether this action needs a permission on this platform before it can open. */
function needsPermission(origin: PhotoOrigin): boolean {
  if (Platform.OS === 'web') return false;
  return origin === 'camera' || libraryNeedsPermission();
}

/** Asks for access where required (the system asks only once); true when granted, also for limited library access. */
export async function requestAccess(origin: PhotoOrigin): Promise<boolean> {
  if (!needsPermission(origin)) return true;
  const response = origin === 'camera' ? await requestCameraPermissionsAsync() : await requestMediaLibraryPermissionsAsync();
  return response.granted;
}

/** Whether access is granted now, without asking (e.g. after a visit to the settings). */
export async function hasAccess(origin: PhotoOrigin): Promise<boolean> {
  if (!needsPermission(origin)) return true;
  const response = origin === 'camera' ? await getCameraPermissionsAsync() : await getMediaLibraryPermissionsAsync();
  return response.granted;
}

// Full quality from the picker: the photo is resized and compressed once, in preparePhoto.
// Without editing, the library opens the system photo picker (PHPicker on iOS, the photo
// picker on Android), which needs no permission.
const PICKER_OPTIONS: ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, quality: 1, exif: false };

/** Opens the camera or the library; the uri of the chosen photo, or null when cancelled. */
export async function choosePhoto(origin: PhotoOrigin): Promise<string | null> {
  const result = origin === 'camera' ? await launchCameraAsync(PICKER_OPTIONS) : await launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
