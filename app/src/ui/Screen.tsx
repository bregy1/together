// The frame of every sign-up screen: safe areas, the 20 px side margin, scrollable content
// and a bottom area for the one primary button, kept above the keyboard on iOS
// (Android resizes the window for the keyboard).
// spec: NFR-ACC-001; design/direction.md → UI building blocks (Layout)
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

type Props = {
  children: ReactNode;
  /** The bottom area, usually the screen's one primary button. */
  footer?: ReactNode;
  /** Base id; the scroll view gets `<testID>-scroll`, the bottom area `<testID>-footer`. */
  testID?: string;
};

export function Screen({ children, footer, testID }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const id = (suffix: string) => (testID ? `${testID}-${suffix}` : undefined);
  const bottom = insets.bottom + theme.space[4];

  return (
    <View
      testID={testID}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          testID={id('scroll')}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.space.page,
            paddingTop: theme.space[6],
            paddingBottom: footer ? theme.space[6] : bottom,
          }}>
          {children}
        </ScrollView>
        {footer ? (
          <View
            testID={id('footer')}
            style={{ paddingHorizontal: theme.space.page, paddingTop: theme.space[3], paddingBottom: bottom }}>
            {footer}
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </View>
  );
}
