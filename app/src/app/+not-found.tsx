// Shown for an unknown address (e.g. a mistyped link). Replaces Expo Router's
// built-in English page so this text, too, comes from translation keys.
// spec: NFR-INTL-001
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { useTheme } from '../theme';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        gap: theme.space[4],
        padding: theme.space.page,
        backgroundColor: theme.colors.background,
      }}>
      <Text accessibilityRole="header" style={[theme.text.h3, { color: theme.colors.text }]}>
        {t('shell.notFound.title')}
      </Text>
      <Link
        href="/"
        style={[
          theme.text.body,
          { color: theme.colors.text, textDecorationLine: 'underline', minHeight: theme.size.touchMin },
        ]}>
        {t('shell.notFound.backToDiscover')}
      </Link>
    </View>
  );
}
