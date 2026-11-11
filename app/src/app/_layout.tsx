// Root layout: brand fonts, i18n, theme (follows the phone's light or dark setting),
// the session that decides between sign-up and the tabs, and the sign-up state shared by
// the sign-up steps.
// spec: ADR-0003, ADR-0007, NFR-INTL-001, ONB-001, ONB-007, ONB-008, ONB-020
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type Href, type Theme as NavigationTheme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { I18nextProvider, useTranslation } from 'react-i18next';

import { SessionProvider, useSession } from '../features/login';
import { Notice } from '../features/login/Notice';
import { SignUpProvider } from '../features/signup';
import { i18n } from '../i18n';
import { useTheme } from '../theme';
import { brandFonts } from '../theme/fonts';
import { Screen } from '../ui';

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
        <SessionProvider>
          <SignUpProvider>
            <RootStack background={theme.colors.background} />
          </SignUpProvider>
        </SessionProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

/**
 * Members see the tabs; everyone else (no session, or a sign-up in progress) sees the
 * sign-up steps, starting with the phone number. When a member signs in, the sign-up
 * screens close and the tabs open on Entdecken (ONB-007). An unfinished sign-up found
 * at start-up continues at its recorded step (ONB-008).
 */
function RootStack({ background }: { background: string }) {
  const { t } = useTranslation();
  const { status, signUp, startProblem, retry } = useSession();
  // Wait for the stored session before choosing where to start.
  if (status === 'loading') return null;
  // The session could not be checked: offer a retry instead of guessing.
  if (status === 'unreachable') {
    return (
      <Screen testID="screen-start-unreachable">
        <Notice message={t(startProblem ?? 'onb.error.generic')} retryLabel={t('onb.action.retry')} onRetry={retry} />
      </Screen>
    );
  }
  const member = status === 'member';
  const start: Href = status === 'signingUp' && signUp ? `/${signUp.step}` : '/phone';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: background } }}>
      <Stack.Protected guard={member} redirectTo={start}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>
      <Stack.Protected guard={!member} redirectTo="/">
        <Stack.Screen name="(onboarding)" />
      </Stack.Protected>
    </Stack>
  );
}
