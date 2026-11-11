// The top of both login screens: the step progress ("Schritt 1 von 5") and the headline.
// spec: ONB-001, ONB-004
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { StepProgress } from '../../ui';

export const LOGIN_STEP = 1;
export const SIGN_UP_STEPS = 5;

export function LoginHeader({ title }: { title: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[6] }}>
      <StepProgress
        step={LOGIN_STEP}
        total={SIGN_UP_STEPS}
        label={t('onb.step', { current: LOGIN_STEP, total: SIGN_UP_STEPS })}
      />
      <Text accessibilityRole="header" style={[theme.text.h1, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>
  );
}
