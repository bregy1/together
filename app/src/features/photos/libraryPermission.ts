// Whether picking from the photo library needs a permission first. On every platform the
// app supports, it does not: the app opens the system photo picker, which hands over only
// the photo the person chooses.
// - iOS (15.1 and later): `launchImageLibraryAsync` without editing opens PHPickerViewController
//   and checks no permission (node_modules/expo-image-picker/ios/ImagePickerModule.swift).
// - Android (API 24 and later): it opens the system photo picker (PickVisualMedia; on older
//   devices the Google Play backport, or ACTION_OPEN_DOCUMENT) and checks no permission
//   (node_modules/expo-image-picker/android/.../ImagePickerModule.kt, contracts/ImageLibraryContract.kt).
// - Web: a file chooser; there are no permissions.
// Expo SDK 58 docs: "No permissions request is necessary for launching the image library."
// The denied-library path (ONB-015) stays in place behind this check, for a platform or
// option that would need it.
// spec: ONB-014, ONB-015
export function libraryNeedsPermission(): boolean {
  return false;
}
