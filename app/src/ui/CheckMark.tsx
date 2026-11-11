// A small check mark drawn with a rotated corner (no icon set, no SVG): 2 px stroke,
// in a 20 px box. Decorative only; the state it shows is announced by its parent.
// spec: design/direction.md → UI building blocks (icons)
import { View } from 'react-native';

import { useTheme } from '../theme';

type Props = { color: string; testID?: string };

export function CheckMark({ color, testID }: Props) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: theme.size.iconMin, height: theme.size.iconMin, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: theme.space[2],
          height: theme.space[3],
          marginBottom: theme.size.iconStroke,
          borderColor: color,
          borderRightWidth: theme.size.iconStroke,
          borderBottomWidth: theme.size.iconStroke,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}
