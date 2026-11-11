// SCR-onb-phone: the Swiss phone number for sign-up or sign-in. States: default,
// invalid (at the field), sending, send failed with retry, limits reached, offline.
// spec: ONB-001, ONB-002, ONB-003, NFR-SEC-002
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Button, Screen, TextField } from '../../ui';
import { problemFromCodeRequest, type FieldProblem, type NoticeKey } from './errors';
import { LoginHeader } from './LoginHeader';
import { requestLoginCode } from './loginApi';
import { useLoginFlow } from './loginFlow';
import { Notice } from './Notice';
import { checkPhoneNumber, formatSwissNumber, sanitizePhoneInput, SWISS_COUNTRY_CODE } from './phoneNumber';

export function PhoneScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { phoneInput, setPhoneInput, setSentCode } = useLoginFlow();
  const [fieldProblem, setFieldProblem] = useState<FieldProblem | null>(null);
  const [notice, setNotice] = useState<{ key: NoticeKey; retry: boolean } | null>(null);
  const [sending, setSending] = useState(false);
  // Guards against a second tap before the busy state has rendered.
  const sendingNow = useRef(false);

  const send = async () => {
    if (sendingNow.current) return;
    setNotice(null);
    const check = checkPhoneNumber(phoneInput);
    if (check.kind !== 'ok') {
      setFieldProblem({ key: check.kind === 'notSwiss' ? 'onb.phone.error.notSwiss' : 'onb.phone.error.invalid' });
      return;
    }
    setFieldProblem(null);
    sendingNow.current = true;
    setSending(true);
    const result = await requestLoginCode(check.e164);
    sendingNow.current = false;
    setSending(false);

    if (result.ok) {
      setPhoneInput(formatSwissNumber(check.e164).national);
      setSentCode({ phoneNumber: check.e164, sentAt: Date.now(), resendAfterSeconds: result.data.resendAfterSeconds });
      router.push('/code');
      return;
    }
    const problem = problemFromCodeRequest(result);
    if (problem.at === 'field') setFieldProblem(problem.field);
    else setNotice({ key: problem.key, retry: problem.retry });
  };

  // Event handlers start the request and return at once (the screen shows its progress).
  const onSend = () => void send();

  const onChangeText = (text: string) => {
    setPhoneInput(sanitizePhoneInput(text));
    setFieldProblem(null);
  };

  // Shows the Swiss grouping once the number is complete.
  const onBlur = () => {
    const check = checkPhoneNumber(phoneInput);
    if (check.kind === 'ok') setPhoneInput(formatSwissNumber(check.e164).national);
  };

  const openPrivacyPolicy = () => router.push({ pathname: '/legal', params: { doc: 'privacy' } });

  return (
    <Screen
      testID="screen-onb-phone"
      footer={
        <View style={{ gap: theme.space[2], alignItems: 'center' }}>
          <View style={{ alignSelf: 'stretch' }}>
            <Button label={t('onb.phone.send')} onPress={onSend} busy={sending} />
          </View>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={t('onb.phone.privacy')}
            onPress={openPrivacyPolicy}
            style={{ minHeight: theme.size.touchMin, minWidth: theme.size.touchMin, justifyContent: 'center' }}>
            <Text style={[theme.text.small, { color: theme.colors.text, textDecorationLine: 'underline' }]}>
              {t('onb.phone.privacy')}
            </Text>
          </Pressable>
        </View>
      }>
      <View style={{ gap: theme.space[6] }}>
        <LoginHeader title={t('onb.phone.title')} />
        <TextField
          testID="onb-phone-number"
          label={t('onb.phone.label')}
          placeholder={t('onb.phone.placeholder')}
          hint={t('onb.phone.hint')}
          error={fieldProblem ? t(fieldProblem.key) : undefined}
          leading={
            <Text
              accessibilityLabel={t('onb.phone.countryCodeA11y')}
              style={[theme.text.body, { color: theme.colors.text }]}>
              {SWISS_COUNTRY_CODE}
            </Text>
          }
          value={phoneInput}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onSubmitEditing={onSend}
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
          returnKeyType="send"
        />
        {notice ? (
          <Notice
            message={t(notice.key)}
            retryLabel={notice.retry ? t('onb.action.retry') : undefined}
            onRetry={onSend}
          />
        ) : null}
      </View>
    </Screen>
  );
}
