// The sign-up and sign-in steps, starting with the phone number. The login state
// (the number, the running code request) is shared by the phone and code screens.
// spec: ONB-001, ONB-006
import { Stack } from 'expo-router';

import { LoginFlowProvider } from '../../features/login';
import { useTheme } from '../../theme';

export const unstable_settings = { anchor: 'phone' };

export default function OnboardingLayout() {
  const theme = useTheme();
  return (
    <LoginFlowProvider>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.background } }}>
        <Stack.Screen name="phone" />
        <Stack.Screen name="code" />
      </Stack>
    </LoginFlowProvider>
  );
}
