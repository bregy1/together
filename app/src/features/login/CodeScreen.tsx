// SCR-onb-code: the code from the SMS. States: default (number, code field, resend
// countdown, change number), wrong code with attempts left, expired with "send new
// code", offline with retry. A new person continues to the about step, an existing
// member lands on Entdecken. The "banned" state (ONB-022) is not part of this round.
// spec: ONB-004, ONB-005, ONB-006, ONB-007
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Button, Screen, TextField } from '../../ui';
import { problemFromCodeCheck, problemFromCodeRequest, type FieldProblem, type NoticeKey } from './errors';
import { LoginHeader } from './LoginHeader';
import { requestLoginCode, verifyLoginCode } from './loginApi';
import { useLoginFlow, type SentCode } from './loginFlow';
import { Notice } from './Notice';
import { formatSwissNumber } from './phoneNumber';
import { useSession } from './session';

const CODE_LENGTH = 6;

/** Whole seconds until a new code may be requested; ticks once a second until 0. */
function useSecondsUntilResend(sentCode: SentCode | null): number {
  const [seconds, setSeconds] = useState(() => secondsUntilResend(sentCode));

  useEffect(() => {
    setSeconds(secondsUntilResend(sentCode));
    if (!sentCode) return;
    const timer = setInterval(() => {
      const left = secondsUntilResend(sentCode);
      setSeconds(left);
      if (left === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [sentCode]);

  return seconds;
}

function secondsUntilResend(sentCode: SentCode | null): number {
  if (!sentCode) return 0;
  return Math.max(0, Math.ceil((sentCode.sentAt + sentCode.resendAfterSeconds * 1000 - Date.now()) / 1000));
}

type Pending = 'verify' | 'resend' | null;

export function CodeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { sentCode, setSentCode } = useLoginFlow();
  const { startSession } = useSession();
  const [code, setCode] = useState('');
  const [fieldProblem, setFieldProblem] = useState<FieldProblem | null>(null);
  const [notice, setNotice] = useState<{ key: NoticeKey; retry: boolean; action: 'verify' | 'resend' } | null>(null);
  const [pending, setPending] = useState<Pending>(null);
  const busy = useRef(false);
  const secondsLeft = useSecondsUntilResend(sentCode);

  // Reached without a code request (e.g. an old link): start with the number.
  if (!sentCode) return <Redirect href="/phone" />;

  const run = async (kind: 'verify' | 'resend', work: () => Promise<void>) => {
    if (busy.current) return;
    busy.current = true;
    setPending(kind);
    setNotice(null);
    try {
      await work();
    } finally {
      busy.current = false;
      setPending(null);
    }
  };

  const verify = () =>
    run('verify', async () => {
      const result = await verifyLoginCode(sentCode.phoneNumber, code);
      if (result.ok) {
        try {
          await startSession(result.data.sessionToken, result.data.me);
        } catch {
          setNotice({ key: 'onb.error.generic', retry: true, action: 'verify' });
          return;
        }
        // A member is taken to the tabs by the root layout once the session says "member" (ONB-007).
        if (result.data.me.status !== 'member') router.replace('/about');
        return;
      }
      const problem = problemFromCodeCheck(result);
      if (problem.at === 'field') setFieldProblem(problem.field);
      else setNotice({ key: problem.key, retry: problem.retry, action: 'verify' });
    });

  const resend = () =>
    run('resend', async () => {
      const result = await requestLoginCode(sentCode.phoneNumber);
      if (result.ok) {
        setSentCode({ ...sentCode, sentAt: Date.now(), resendAfterSeconds: result.data.resendAfterSeconds });
        setCode('');
        setFieldProblem(null);
        return;
      }
      const problem = problemFromCodeRequest(result);
      // A refused number cannot happen here (it was accepted moments ago); show it as a notice.
      if (problem.at === 'field') setNotice({ key: 'onb.error.generic', retry: true, action: 'resend' });
      else setNotice({ key: problem.key, retry: problem.retry, action: 'resend' });
    });

  // Event handlers start the request and return at once (the screen shows its progress).
  const onVerify = () => void verify();
  const onResend = () => void resend();

  // The phone screen keeps the number as entered, ready to edit (ONB-006).
  const changeNumber = () => (router.canGoBack() ? router.back() : router.replace('/phone'));

  const onChangeText = (text: string) => {
    setCode(text.replace(/\D/g, '').slice(0, CODE_LENGTH));
    setFieldProblem(null);
  };

  const fieldError = fieldProblem
    ? fieldProblem.key === 'onb.code.error.wrong'
      ? t(fieldProblem.key, { count: fieldProblem.count })
      : t(fieldProblem.key)
    : undefined;
  const canResend = secondsLeft === 0;

  return (
    <Screen
      testID="screen-onb-code"
      footer={
        <Button
          label={t('onb.action.continue')}
          onPress={onVerify}
          busy={pending === 'verify'}
          disabled={code.length !== CODE_LENGTH || pending === 'resend'}
        />
      }>
      <View style={{ gap: theme.space[6] }}>
        <LoginHeader title={t('onb.code.title')} />
        <Text style={[theme.text.body, { color: theme.colors.text }]}>
          {t('onb.code.sentTo', { phone: formatSwissNumber(sentCode.phoneNumber).international })}
        </Text>
        <TextField
          testID="onb-code"
          label={t('onb.code.label')}
          placeholder={t('onb.code.placeholder')}
          error={fieldError}
          value={code}
          onChangeText={onChangeText}
          onSubmitEditing={() => code.length === CODE_LENGTH && onVerify()}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={CODE_LENGTH}
          returnKeyType="done"
        />
        {notice ? (
          <Notice
            message={t(notice.key)}
            retryLabel={notice.retry ? t('onb.action.retry') : undefined}
            onRetry={notice.action === 'verify' ? onVerify : onResend}
          />
        ) : null}
        <View style={{ alignItems: 'flex-start', gap: theme.space[2] }}>
          <Button
            variant="text"
            label={canResend ? t('onb.code.resend') : t('onb.code.resendIn', { count: secondsLeft })}
            onPress={onResend}
            disabled={!canResend || pending === 'verify'}
            busy={pending === 'resend'}
          />
          <Button variant="text" label={t('onb.code.changeNumber')} onPress={changeNumber} />
        </View>
      </View>
    </Screen>
  );
}
