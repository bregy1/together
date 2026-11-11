// One photo slot on SCR-onb-photos: the empty portrait placeholder, or a photo with its
// upload state (uploading, failed with a retry) and the remove action. A photo added in
// this app run is shown from the prepared file; an uploaded one from the server.
// spec: ONB-014, ONB-008, ONB-020
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Pressable, Text, View, type ViewStyle } from 'react-native';

import { signUpPhotoSource, type PhotoSource } from '../../api/photosApi';
import { useTheme } from '../../theme';
import { Button } from '../../ui';
import type { SignUpPhoto } from '../signup/signUpState';

// PLACEHOLDER(design): the photo tile's shape (portrait format 3:4, two per row) is not specified.
const TILE_ASPECT_RATIO = 3 / 4;
const TILE_BASIS = '40%';

function useTileFrame(): ViewStyle {
  const theme = useTheme();
  return {
    flexGrow: 1,
    flexBasis: TILE_BASIS,
    gap: theme.space[2],
  };
}

/** The empty portrait slot: a placeholder area with one line of text, never a grey icon. */
export function PortraitPlaceholder() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={useTileFrame()}>
      <View
        testID="onb-photo-placeholder"
        style={{
          aspectRatio: TILE_ASPECT_RATIO,
          borderRadius: theme.radius.card,
          backgroundColor: theme.colors.surfaceSecondary,
          alignItems: 'center',
          justifyContent: 'center',
          padding: theme.space[4],
        }}>
        <Text style={[theme.text.label, { color: theme.colors.text, textAlign: 'center' }]}>{t('onb.photos.portrait')}</Text>
      </View>
    </View>
  );
}

/** The server copy of an uploaded photo, read with the session; null until known. */
function useServerSource(photo: SignUpPhoto): PhotoSource | null {
  const [source, setSource] = useState<PhotoSource | null>(null);
  const needsServer = !photo.localUri && photo.status === 'uploaded';
  useEffect(() => {
    if (!needsServer) return;
    let active = true;
    void signUpPhotoSource(photo.slot).then((next) => {
      if (active) setSource(next);
    });
    return () => {
      active = false;
    };
  }, [needsServer, photo.slot, photo.version]);
  return needsServer ? source : null;
}

type Props = {
  photo: SignUpPhoto;
  /** The photo's place for people, starting at 1 (1 is the portrait). */
  position: number;
  onRemove(): void;
  onRetry(): void;
  /** True while a removal of this photo is running. */
  removing: boolean;
};

export function PhotoTile({ photo, position, onRemove, onRetry, removing }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const frame = useTileFrame();
  const serverSource = useServerSource(photo);
  const source: PhotoSource | null = photo.localUri ? { uri: photo.localUri } : serverSource;
  const portrait = photo.slot === 0;

  return (
    <View style={frame}>
      <View
        style={{
          aspectRatio: TILE_ASPECT_RATIO,
          borderRadius: theme.radius.card,
          overflow: 'hidden',
          backgroundColor: theme.colors.surfaceSecondary,
        }}>
        {source ? (
          <Image
            testID={`onb-photo-image-${photo.slot}`}
            source={source}
            resizeMode="cover"
            style={{ width: '100%', height: '100%' }}
            // The portrait is named for screen readers; further photos are named by their remove action.
            accessible={portrait}
            accessibilityRole={portrait ? 'image' : undefined}
            accessibilityLabel={portrait ? t('onb.photos.portrait') : undefined}
            accessibilityElementsHidden={!portrait}
            importantForAccessibility={portrait ? 'yes' : 'no-hide-descendants'}
          />
        ) : null}
      </View>

      {photo.status === 'uploading' ? (
        <View accessibilityLiveRegion="polite" style={{ flexDirection: 'row', alignItems: 'center', gap: theme.space[2] }}>
          <ActivityIndicator color={theme.colors.text} />
          <Text style={[theme.text.small, { flex: 1, color: theme.colors.text }]}>{t('onb.photos.uploading')}</Text>
        </View>
      ) : null}

      {photo.status === 'failed' ? (
        <View style={{ gap: theme.space[2], alignItems: 'flex-start' }}>
          <Text accessibilityLiveRegion="polite" style={[theme.text.small, { color: theme.colors.text }]}>
            {t('onb.photos.error.uploadFailed')}
          </Text>
          <Button label={t('onb.action.retry')} variant="secondary" size="small" onPress={onRetry} />
        </View>
      ) : null}

      {photo.status !== 'uploading' ? (
        <RemoveAction
          label={t('onb.photos.remove')}
          accessibilityLabel={t('onb.photos.a11y.remove', { position })}
          onPress={onRemove}
          busy={removing}
        />
      ) : null}
    </View>
  );
}

/**
 * "Entfernen" under a photo. The shared Button has no separate screen-reader name, and
 * four buttons all called "Entfernen" could not be told apart, so this one names the photo.
 * Styled like the shared text button.
 */
function RemoveAction({
  label,
  accessibilityLabel,
  onPress,
  busy,
}: {
  label: string;
  accessibilityLabel: string;
  onPress(): void;
  busy: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ busy }}
      disabled={busy}
      onPress={onPress}
      style={{
        alignSelf: 'flex-start',
        minHeight: theme.size.touchMin,
        minWidth: theme.size.touchMin,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[2],
        paddingHorizontal: theme.space[1],
        ...(busy && { opacity: theme.opacity.disabled }),
      }}>
      {busy ? <ActivityIndicator color={theme.colors.text} /> : null}
      <Text style={[theme.text.button, { color: theme.colors.text, textDecorationLine: 'underline' }]}>{label}</Text>
    </Pressable>
  );
}
