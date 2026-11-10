// Root layout: brand fonts, i18n, theme (follows the phone's light or dark setting).
// spec: ADR-0003, ADR-0007, NFR-INTL-001
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Theme as NavigationTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider } from 'react-i18next';

import { i18n } from '../i18n';
import { useTheme } from '../theme';
import { brandFonts } from '../theme/fonts';

export default function RootLayout() {
  // If the fonts fail to load, the app still starts with the system font.
  const [fontsLoaded, fontError] = useFonts(brandFonts);
  const theme = useTheme();

  if (!fontsLoaded && !fontError) return null;

  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme: NavigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: theme.colors.text,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.divider,
    },
  };

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={navigationTheme}>
        <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
          <Stack.Screen name="(tabs)" />
        </Stack>
      </ThemeProvider>
    </I18nextProvider>
  );
}
