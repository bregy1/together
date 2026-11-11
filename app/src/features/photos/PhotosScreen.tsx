// SCR-onb-photos ("Schritt 4 von 5"): one portrait required, up to three more photos, taken
// with the camera or picked from the photo library. States: empty (the portrait placeholder
// with both actions), uploading (per photo; a failed upload offers a retry on that photo),
// permission denied (the explanation with a button to the settings; the other action stays),
// full (four photos, no add action), and a failed call with a retry (input kept).
// Each photo is prepared on the phone (at most 2048 px, JPEG) before upload; the server
// enforces every limit and strips the metadata. The photos live in the shared sign-up
// state, so going back and forward keeps them (ONB-020).
// spec: ONB-014, ONB-015, ONB-008, ONB-020
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, AppState, Linking, Platform, Text, View } from 'react-native';

import { deleteSignUpPhoto, putSignUpPhoto, type PhotoSlot } from '../../api/photosApi';
import { setSignUpStep, type ApiFailure } from '../../api/signUpApi';
import { useTheme } from '../../theme';
import { Button, Screen } from '../../ui';
import { useSession } from '../login/session';
import { Notice } from '../login/Notice';
import { noticeFor, type NoticeKey } from '../signup/errors';
import { SignUpHeader } from '../signup/SignUpHeader';
import { useSignUp, type SignUpPhoto } from '../signup/signUpState';
import { choosePhoto, hasAccess, requestAccess, type PhotoOrigin } from './photoAccess';
import { PhotoTile, PortraitPlaceholder } from './PhotoTile';
import { preparePhoto } from './preparePhoto';

const PHOTOS_STEP = 4;
const SLOTS: PhotoSlot[] = [0, 1, 2, 3];
/** Further photos besides the portrait. */
export const MAX_MORE_PHOTOS = SLOTS.length - 1;

type PendingNotice = { key: NoticeKey; retry?: () => void };

/** The first free slot: the portrait first, then the further photos. */
function nextFreeSlot(photos: SignUpPhoto[]): PhotoSlot | null {
  return SLOTS.find((slot) => !photos.some((photo) => photo.slot === slot)) ?? null;
}

export function PhotosScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { endSession } = useSession();
  const { draft, update, setPhoto } = useSignUp();
  const photos = draft.photos;
  const [denied, setDenied] = useState<Record<PhotoOrigin, boolean>>({ camera: false, library: false });
  // The portrait (or none) for which "portrait required" was shown; any change to it hides the message.
  const [portraitMissingFor, setPortraitMissingFor] = useState<SignUpPhoto | null | undefined>(undefined);
  const [notice, setNotice] = useState<PendingNotice | null>(null);
  const [removing, setRemoving] = useState<PhotoSlot | null>(null);
  const [busy, setBusy] = useState(false);
  const busyNow = useRef(false);
  const picking = useRef(false);

  // --- The recorded step: coming back to this step records it again (ONB-008, ONB-020).
  const stepRef = useRef(draft.step);
  stepRef.current = draft.step;
  useFocusEffect(
    useCallback(() => {
      if (stepRef.current === 'photos') return;
      void setSignUpStep('photos').then((result) => {
        if (result.ok) update({ step: result.data.step });
      });
    }, [update]),
  );

  // --- Back from the system settings: an access granted there lifts the explanation.
  const deniedRef = useRef(denied);
  deniedRef.current = denied;
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      for (const origin of ['camera', 'library'] as const) {
        if (!deniedRef.current[origin]) continue;
        void hasAccess(origin).then((granted) => {
          if (granted) setDenied((prev) => ({ ...prev, [origin]: false }));
        });
      }
    });
    return () => subscription.remove();
  }, []);

  const sessionEnded = async () => {
    await endSession();
    router.replace('/phone');
  };

  const failed = async (result: ApiFailure, retry: () => void) => {
    if (result.kind === 'error' && result.code === 'unauthenticated') return sessionEnded();
    setNotice({ key: noticeFor(result), retry });
  };

  // --- Uploading one photo into its slot; a failure stays on that photo with a retry.
  const upload = async (slot: PhotoSlot, localUri: string) => {
    setPhoto(slot, { slot, localUri, status: 'uploading' });
    AccessibilityInfo.announceForAccessibility(t('onb.photos.uploading'));
    const result = await putSignUpPhoto(slot, localUri);
    if (result.ok) {
      setPhoto(slot, { slot, localUri, status: 'uploaded', version: result.data.version });
      return;
    }
    if (result.kind === 'error' && result.code === 'unauthenticated') return sessionEnded();
    setPhoto(slot, { slot, localUri, status: 'failed' });
    AccessibilityInfo.announceForAccessibility(t('onb.photos.error.uploadFailed'));
  };

  // --- Adding: access asked only on the tap, then the picker, the preparation and the upload.
  const add = async (origin: PhotoOrigin) => {
    if (picking.current) return;
    const slot = nextFreeSlot(photos);
    if (slot === null) return;
    picking.current = true;
    setNotice(null);
    try {
      if (!(await requestAccess(origin))) {
        setDenied((prev) => ({ ...prev, [origin]: true }));
        return;
      }
      setDenied((prev) => ({ ...prev, [origin]: false }));
      const chosen = await choosePhoto(origin);
      if (!chosen) return;
      let prepared: string;
      try {
        prepared = await preparePhoto(chosen);
      } catch {
        setNotice({ key: 'onb.error.generic' });
        return;
      }
      void upload(slot, prepared);
    } finally {
      picking.current = false;
    }
  };

  // --- Removing empties the slot on the server; the portrait can then be added again.
  const remove = async (slot: PhotoSlot) => {
    setRemoving(slot);
    setNotice(null);
    try {
      const result = await deleteSignUpPhoto(slot);
      if (result.ok) setPhoto(slot, null);
      else await failed(result, () => void remove(slot));
    } finally {
      setRemoving(null);
    }
  };

  // --- Moving on: needs the uploaded portrait.
  const portrait = photos.find((photo) => photo.slot === 0);
  const portraitReady = portrait?.status === 'uploaded';
  const uploading = photos.some((photo) => photo.status === 'uploading');

  const goOn = async () => {
    if (busyNow.current) return;
    setNotice(null);
    if (!portraitReady) {
      setPortraitMissingFor(portrait ?? null);
      return;
    }
    busyNow.current = true;
    setBusy(true);
    try {
      const stepped = await setSignUpStep('rules');
      if (!stepped.ok) {
        if (stepped.kind === 'error' && stepped.code === 'signup_incomplete' && stepped.details?.missing?.includes('portrait')) {
          setPortraitMissingFor(portrait ?? null);
          return;
        }
        return await failed(stepped, () => void goOn());
      }
      update({ step: stepped.data.step });
      router.push('/rules');
    } finally {
      busyNow.current = false;
      setBusy(false);
    }
  };

  // Back to SCR-onb-interests, also when the sign-up was resumed here (then it is not below this screen).
  const goBack = () => router.dismissTo('/interests');

  const full = nextFreeSlot(photos) === null;
  const showPortraitError = portraitMissingFor !== undefined && portraitMissingFor === (portrait ?? null);

  return (
    <Screen
      testID="screen-onb-photos"
      footer={<Button label={t('onb.action.continue')} onPress={() => void goOn()} busy={busy || uploading} />}>
      <View style={{ gap: theme.space[6] }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Button variant="text" size="small" label={t('onb.action.back')} onPress={goBack} disabled={busy} />
        </View>
        <SignUpHeader step={PHOTOS_STEP} title={t('onb.photos.title')} />
        <Text style={[theme.text.body, { color: theme.colors.text }]}>
          {t('onb.photos.hint', { more: MAX_MORE_PHOTOS })}
        </Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[3] }}>
          {portrait ? null : <PortraitPlaceholder />}
          {photos.map((photo) => (
            <PhotoTile
              key={photo.slot}
              photo={photo}
              position={photo.slot + 1}
              removing={removing === photo.slot}
              onRemove={() => void remove(photo.slot)}
              onRetry={() => photo.localUri && void upload(photo.slot, photo.localUri)}
            />
          ))}
        </View>

        {showPortraitError ? <Notice message={t('onb.photos.error.portraitRequired')} /> : null}

        {full ? null : (
          <View style={{ gap: theme.space[3] }}>
            <Button
              variant="secondary"
              label={t('onb.photos.camera')}
              accessibilityHint={t('onb.photos.a11y.camera')}
              onPress={() => void add('camera')}
            />
            <Button
              variant="secondary"
              label={t('onb.photos.library')}
              accessibilityHint={t('onb.photos.a11y.library')}
              onPress={() => void add('library')}
            />
          </View>
        )}

        {denied.camera || denied.library ? (
          <Notice
            testID="onb-photos-permission-denied"
            message={t('onb.photos.permissionDenied')}
            retryLabel={t('onb.photos.openSettings')}
            onRetry={() => void Linking.openSettings()}
          />
        ) : null}

        {notice ? (
          <Notice
            message={t(notice.key)}
            retryLabel={notice.retry ? t('onb.action.retry') : undefined}
            onRetry={notice.retry}
          />
        ) : null}
      </View>
    </Screen>
  );
}
