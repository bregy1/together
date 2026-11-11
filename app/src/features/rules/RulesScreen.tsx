// SCR-onb-rules ("Schritt 5 von 5"): the Spielregeln, the "not a dating app" line, the
// links to the terms of use and the privacy policy, the one acceptance and "finish".
// States: default (finish disabled until accepted) and finishing (progress; offline or
// failure → a notice with a retry, the acceptance kept). The "not a dating app" line sits
// right under the headline, before the rules, so it is on screen before any scrolling.
// On success the server answers with the member; the session becomes a member's and the
// root layout shows the tabs on Entdecken. A refused finish (`signup_incomplete`) opens the
// first missing step.
// spec: ONB-016, ONB-017, ONB-018, MOD-008
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { finishSignUp, setSignUpStep, type ApiFailure, type SignUpPart } from '../../api/signUpApi';
import { sessionStore } from '../../session/sessionStore';
import { useTheme } from '../../theme';
import { Button, Screen } from '../../ui';
import { Notice } from '../login/Notice';
import { useSession } from '../login/session';
import { noticeFor, type NoticeKey } from '../signup/errors';
import { SignUpHeader } from '../signup/SignUpHeader';
import { useSignUp } from '../signup/signUpState';
import { AcceptanceCheckbox } from './AcceptanceCheckbox';
import type { LegalDoc } from './legalTexts';

const RULES_STEP = 5;
const RULE_NUMBERS = ['1', '2', '3', '4', '5', '6'] as const;

/** The step that holds the first missing part: the about step before the photos step. */
function stepForMissing(missing: SignUpPart[] | undefined): '/about' | '/photos' | null {
  if (!missing || missing.length === 0) return null;
  if (missing.some((part) => part !== 'portrait')) return '/about';
  return '/photos';
}

export function RulesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { startSession, endSession } = useSession();
  const { draft, update } = useSignUp();
  const [accepted, setAccepted] = useState(false);
  const [notice, setNotice] = useState<NoticeKey | null>(null);
  const [busy, setBusy] = useState(false);
  const busyNow = useRef(false);

  // --- The recorded step: coming back to this step records it again (ONB-008, ONB-020).
  const stepRef = useRef(draft.step);
  stepRef.current = draft.step;
  useFocusEffect(
    useCallback(() => {
      if (stepRef.current === 'rules') return;
      void setSignUpStep('rules').then((result) => {
        if (result.ok) update({ step: result.data.step });
      });
    }, [update]),
  );

  // --- Finishing.
  const failed = async (result: ApiFailure) => {
    if (result.kind === 'error' && result.code === 'unauthenticated') {
      await endSession();
      router.replace('/phone');
      return;
    }
    if (result.kind === 'error' && result.code === 'signup_incomplete') {
      const target = stepForMissing(result.details?.missing);
      if (target) {
        router.replace(target);
        return;
      }
    }
    setNotice(noticeFor(result));
  };

  const finish = async () => {
    if (busyNow.current || !accepted) return;
    busyNow.current = true;
    setBusy(true);
    setNotice(null);
    try {
      const result = await finishSignUp();
      if (!result.ok) return await failed(result);
      // The same device session now belongs to a member: the root layout switches to the tabs.
      const token = await sessionStore.getToken();
      if (!token) {
        setNotice('onb.error.generic');
        return;
      }
      await startSession(token, { status: 'member', member: result.data });
    } catch {
      setNotice('onb.error.generic');
    } finally {
      busyNow.current = false;
      setBusy(false);
    }
  };
  const onFinish = () => void finish();

  // Back to SCR-onb-photos, also when the sign-up was resumed here (then it is not below this screen).
  const goBack = () => router.dismissTo('/photos');
  const openLegal = (doc: LegalDoc) => router.push({ pathname: '/legal', params: { doc } });

  const linkStyle = { minHeight: theme.size.touchMin, minWidth: theme.size.touchMin, justifyContent: 'center' } as const;
  const linkText = [theme.text.body, { color: theme.colors.text, textDecorationLine: 'underline' }] as const;

  return (
    <Screen
      testID="screen-onb-rules"
      footer={<Button label={t('onb.rules.finish')} onPress={onFinish} busy={busy} disabled={!accepted} />}>
      <View style={{ gap: theme.space[6] }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Button variant="text" size="small" label={t('onb.action.back')} onPress={goBack} disabled={busy} />
        </View>
        <SignUpHeader step={RULES_STEP} title={t('onb.rules.title')} />
        <Text style={[theme.text.h3, { color: theme.colors.text }]}>{t('onb.rules.notDating')}</Text>

        <View testID="onb-rules-list" accessibilityRole="list" style={{ gap: theme.space[4] }}>
          {RULE_NUMBERS.map((n) => (
            <View key={n} accessible style={{ gap: theme.space[1] }}>
              <Text style={[theme.text.label, { color: theme.colors.text }]}>{t(`mod.rules.${n}.title`)}</Text>
              <Text style={[theme.text.body, { color: theme.colors.text }]}>{t(`mod.rules.${n}.text`)}</Text>
            </View>
          ))}
        </View>
        <Text style={[theme.text.body, { color: theme.colors.text }]}>{t('mod.rules.adultsOnly')}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: theme.space[4] }}>
          <Pressable accessibilityRole="link" accessibilityLabel={t('onb.rules.termsLink')} onPress={() => openLegal('terms')} style={linkStyle}>
            <Text style={linkText}>{t('onb.rules.termsLink')}</Text>
          </Pressable>
          <Pressable accessibilityRole="link" accessibilityLabel={t('onb.rules.privacyLink')} onPress={() => openLegal('privacy')} style={linkStyle}>
            <Text style={linkText}>{t('onb.rules.privacyLink')}</Text>
          </Pressable>
        </View>

        <AcceptanceCheckbox
          testID="onb-rules-accept"
          label={t('onb.rules.accept')}
          checked={accepted}
          onChange={setAccepted}
          disabled={busy}
        />

        {notice ? <Notice message={t(notice)} retryLabel={t('onb.action.retry')} onRetry={onFinish} /> : null}
      </View>
    </Screen>
  );
}
