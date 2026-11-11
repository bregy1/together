// Prepares a chosen or taken photo on the phone before upload: decoded so its longer edge
// is at most 2048 px (never enlarged) and saved as JPEG, so iPhone HEIC photos are
// accepted and uploads stay small. The server still re-encodes it and strips all
// metadata (NFR-PRIV-003); this step only saves data and battery.
// spec: ONB-014; tech/architecture.md → Client and server split, Storage
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export const MAX_EDGE_PX = 2048;
export const JPEG_QUALITY = 0.85;

/** Returns the uri of the prepared JPEG. */
export async function preparePhoto(uri: string): Promise<string> {
  // Bounding both edges keeps the aspect ratio and downsamples while decoding,
  // so a large camera photo is never held in memory at full size.
  const context = ImageManipulator.manipulate(uri, { maxWidth: MAX_EDGE_PX, maxHeight: MAX_EDGE_PX });
  try {
    const image = await context.renderAsync();
    try {
      const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
      return saved.uri;
    } finally {
      // Native shared objects: free the decoded image right away.
      image.release?.();
    }
  } finally {
    context.release?.();
  }
}
