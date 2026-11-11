// Camera and photo-library access, asked only when the person taps that action, and the
// system picker itself. On the web there is no permission: the picker is a file chooser
// opened by the tap.
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

export type PhotoOrigin = 'camera' | 'library';

/** Asks for access (the system asks only once); true when granted, also for limited library access. */
export async function requestAccess(origin: PhotoOrigin): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const response = origin === 'camera' ? await requestCameraPermissionsAsync() : await requestMediaLibraryPermissionsAsync();
  return response.granted;
}

/** Whether access is granted now, without asking (e.g. after a visit to the settings). */
export async function hasAccess(origin: PhotoOrigin): Promise<boolean> {
  if (Platform.OS === 'web') return true;
  const response = origin === 'camera' ? await getCameraPermissionsAsync() : await getMediaLibraryPermissionsAsync();
  return response.granted;
}

// Full quality from the picker: the photo is resized and compressed once, in preparePhoto.
const PICKER_OPTIONS: ImagePickerOptions = { mediaTypes: ['images'], allowsEditing: false, quality: 1, exif: false };

/** Opens the camera or the library; the uri of the chosen photo, or null when cancelled. */
export async function choosePhoto(origin: PhotoOrigin): Promise<string | null> {
  const result = origin === 'camera' ? await launchCameraAsync(PICKER_OPTIONS) : await launchImageLibraryAsync(PICKER_OPTIONS);
  if (result.canceled || !result.assets || result.assets.length === 0) return null;
  return result.assets[0].uri;
}
