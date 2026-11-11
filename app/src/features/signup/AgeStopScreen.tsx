// SCR-onb-age-stop: a friendly explanation that Yaruno is for adults only. The server has
// already deleted the sign-up and the session; there is no way forward.
// spec: ONB-010
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Screen } from '../../ui';

export function AgeStopScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  return (
    <Screen testID="screen-onb-age-stop">
      <View style={{ gap: theme.space[6] }}>
        <Text accessibilityRole="header" style={[theme.text.h1, { color: theme.colors.text }]}>
          {t('onb.age.title')}
        </Text>
        <Text style={[theme.text.body, { color: theme.colors.text }]}>{t('onb.age.stop')}</Text>
      </View>
    </Screen>
  );
}
