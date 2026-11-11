// The terms of use or the privacy policy (`/legal?doc=terms|privacy`), opened from the
// phone screen and from SCR-onb-rules. The texts are placeholders and say so at the top.
// "Back" returns to where the person came from; that screen stays as it was (step,
// typed number, acceptance), because this one is only laid on top of it.
// spec: ONB-001, ONB-016
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Button, Screen } from '../../ui';
import { legalDocFrom, legalText } from './legalTexts';

export function LegalScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const { doc } = useLocalSearchParams<{ doc?: string }>();
  const text = legalText(legalDocFrom(doc), i18n.language);

  // Opened by a link from outside the app, there is nothing below: start where the session says.
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen testID="screen-legal">
      <View style={{ gap: theme.space[6] }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Button variant="text" size="small" label={t('onb.action.back')} onPress={goBack} />
        </View>
        <Text accessibilityRole="header" style={[theme.text.h1, { color: theme.colors.text }]}>
          {text.title}
        </Text>
        <View
          testID="legal-placeholder-notice"
          style={{
            padding: theme.space[4],
            borderRadius: theme.radius.input,
            borderWidth: theme.line.widthEmphasis,
            borderColor: theme.colors.warning,
          }}>
          <Text style={[theme.text.label, { color: theme.colors.text }]}>{text.placeholderNotice}</Text>
        </View>
        {text.sections.map((section) => (
          <View key={section.heading} style={{ gap: theme.space[2] }}>
            <Text accessibilityRole="header" style={[theme.text.h3, { color: theme.colors.text }]}>
              {section.heading}
            </Text>
            <Text style={[theme.text.body, { color: theme.colors.text }]}>{section.body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
