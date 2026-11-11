// The top of a sign-up step: the step progress ("Schritt 2 von 5") and the headline.
// spec: ONB-009, ONB-013
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { StepProgress } from '../../ui';

export const SIGN_UP_STEPS = 5;

export function SignUpHeader({ step, title }: { step: number; title: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <View style={{ gap: theme.space[6] }}>
      <StepProgress step={step} total={SIGN_UP_STEPS} label={t('onb.step', { current: step, total: SIGN_UP_STEPS })} />
      <Text accessibilityRole="header" style={[theme.text.h1, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>
  );
}
