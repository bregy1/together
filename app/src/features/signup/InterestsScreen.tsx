// SCR-onb-interests ("Schritt 3 von 5"): 0 to 5 general activities from the curated list.
// States: default (the interests, search, the chosen ones first with a counter), no match,
// limit reached, and offline or failed call with a retry (the choice kept). The list is
// loaded once and searched on the phone, so typing never creates an interest. The choice
// is saved on "continue"; it lives in the shared sign-up state until then (ONB-020).
// spec: ONB-013, ONB-020
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AccessibilityInfo, ActivityIndicator, Text, View } from 'react-native';

import {
  listInterests,
  setSignUpInterests,
  setSignUpStep,
  type ApiFailure,
  type Interest,
} from '../../api/signUpApi';
import { useTheme } from '../../theme';
import { Button, Chip, Screen, TextField } from '../../ui';
import { useSession } from '../login/session';
import { Notice } from '../login/Notice';
import { noticeFor, type NoticeKey } from './errors';
import { SignUpHeader } from './SignUpHeader';
import { useSignUp } from './signUpState';

const INTERESTS_STEP = 3;
export const MAX_INTERESTS = 5;

/** Lower case without accents, so "kultur" finds "Kultur" and "cafe" finds "Café". */
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

type PendingNotice = { key: NoticeKey; retry: () => void };

export function InterestsScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { endSession } = useSession();
  const { draft, update, interestList, setInterestList } = useSignUp();
  const [query, setQuery] = useState('');
  const [limitReached, setLimitReached] = useState(false);
  const [notice, setNotice] = useState<PendingNotice | null>(null);
  const [busy, setBusy] = useState(false);
  const busyNow = useRef(false);

  const nameOf = useCallback(
    (interest: Interest) => (interest.names as Record<string, string | undefined>)[i18n.language] ?? interest.names.de,
    [i18n.language],
  );

  // --- The list, loaded once per app run.
  const load = useCallback(async () => {
    setNotice(null);
    const result = await listInterests();
    if (result.ok) setInterestList(result.data);
    else setNotice({ key: noticeFor(result), retry: () => void load() });
  }, [setInterestList]);

  useEffect(() => {
    // Only when the screen opens; a retry calls load again.
    if (!interestList) void load();
  }, []);

  // --- The recorded step: coming back to this step records it again (ONB-008, ONB-020).
  const stepRef = useRef(draft.step);
  stepRef.current = draft.step;
  useFocusEffect(
    useCallback(() => {
      if (stepRef.current === 'interests') return;
      void setSignUpStep('interests').then((result) => {
        if (result.ok) update({ step: result.data.step });
      });
    }, [update]),
  );

  // --- Choosing.
  const chosen = draft.interests;
  const chosenIds = new Set(chosen.map((interest) => interest.id));
  const needle = fold(query.trim());
  const matches = (interestList ?? []).filter((interest) => fold(nameOf(interest)).includes(needle));
  const offered = matches.filter((interest) => !chosenIds.has(interest.id));
  const noMatch = interestList !== null && needle !== '' && matches.length === 0;

  useEffect(() => {
    if (limitReached) AccessibilityInfo.announceForAccessibility(t('onb.interests.limit', { max: MAX_INTERESTS }));
  }, [limitReached, t]);
  useEffect(() => {
    if (noMatch) AccessibilityInfo.announceForAccessibility(t('onb.interests.noMatch'));
  }, [noMatch, t]);

  const toggle = (interest: Interest) => {
    if (chosenIds.has(interest.id)) {
      update({ interests: chosen.filter((c) => c.id !== interest.id) });
      setLimitReached(false);
      return;
    }
    if (chosen.length >= MAX_INTERESTS) {
      setLimitReached(true);
      return;
    }
    update({ interests: [...chosen, interest] });
  };

  // --- Saving and moving on.
  const failed = async (result: ApiFailure, retry: () => void) => {
    if (result.kind === 'error' && result.code === 'unauthenticated') {
      await endSession();
      router.replace('/phone');
      return;
    }
    setNotice({ key: noticeFor(result), retry });
  };

  const saveAndGoOn = async () => {
    if (busyNow.current) return;
    busyNow.current = true;
    setBusy(true);
    setNotice(null);
    const retry = () => void saveAndGoOn();
    try {
      const saved = await setSignUpInterests(chosen.map((interest) => interest.id));
      if (!saved.ok) return await failed(saved, retry);
      const stepped = await setSignUpStep('photos');
      if (!stepped.ok) return await failed(stepped, retry);
      update({ step: stepped.data.step });
      router.push('/photos');
    } finally {
      busyNow.current = false;
      setBusy(false);
    }
  };

  // Back to SCR-onb-about, also when the sign-up was resumed here (then it is not below this screen).
  const goBack = () => router.dismissTo('/about');

  return (
    <Screen
      testID="screen-onb-interests"
      footer={<Button label={t('onb.action.continue')} onPress={() => void saveAndGoOn()} busy={busy} />}>
      <View style={{ gap: theme.space[6] }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Button variant="text" size="small" label={t('onb.action.back')} onPress={goBack} disabled={busy} />
        </View>
        <SignUpHeader step={INTERESTS_STEP} title={t('onb.interests.title')} />
        <Text style={[theme.text.body, { color: theme.colors.text }]}>
          {t('onb.interests.hint', { max: MAX_INTERESTS })}
        </Text>

        <View style={{ gap: theme.space[3] }}>
          <Text accessibilityLiveRegion="polite" style={[theme.text.label, { color: theme.colors.text }]}>
            {t('onb.interests.counter', { chosen: chosen.length, max: MAX_INTERESTS })}
          </Text>
          {chosen.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
              {chosen.map((interest) => (
                <Chip key={interest.id} label={nameOf(interest)} selected onPress={() => toggle(interest)} />
              ))}
            </View>
          ) : null}
          {limitReached ? <Notice message={t('onb.interests.limit', { max: MAX_INTERESTS })} /> : null}
        </View>

        <View style={{ gap: theme.space[3] }}>
          <TextField
            testID="onb-interests-search"
            label={t('onb.interests.search')}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            autoComplete="off"
            returnKeyType="search"
          />
          {interestList === null && !notice ? <ActivityIndicator color={theme.colors.text} /> : null}
          {offered.length > 0 ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: theme.space[2] }}>
              {offered.map((interest) => (
                <Chip key={interest.id} label={nameOf(interest)} selected={false} onPress={() => toggle(interest)} />
              ))}
            </View>
          ) : null}
          {noMatch ? (
            <Text style={[theme.text.small, { color: theme.colors.text }]}>{t('onb.interests.noMatch')}</Text>
          ) : null}
        </View>

        {notice ? <Notice message={t(notice.key)} retryLabel={t('onb.action.retry')} onRetry={notice.retry} /> : null}
      </View>
    </Screen>
  );
}
