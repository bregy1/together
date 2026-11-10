// A bare tab screen that shows only its title. Each tab's area replaces it in
// a later round.
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

type Props = {
  /** Stable id for tests, e.g. `discover`. */
  id: string;
  /** The tab title, already translated. */
  title: string;
};

export function TabPlaceholder({ id, title }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      testID={`screen-${id}`}
      style={{
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: insets.top + theme.space[7],
        paddingHorizontal: theme.space.page,
      }}>
      <Text accessibilityRole="header" style={[theme.text.h1, { color: theme.colors.text }]}>
        {title}
      </Text>
    </View>
  );
}
