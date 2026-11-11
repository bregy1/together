// A filter chip: 38–40 px high, fully rounded. Selected = filled with the text colour,
// the opposite text and a check mark (so the state is not shown by colour alone);
// unselected = card colour with a line border. Hit slop brings the touch area to 44 px.
// spec: NFR-ACC-001; design/direction.md → UI building blocks
import { Pressable, Text } from 'react-native';

import { useTheme } from '../theme';
import { CheckMark } from './CheckMark';

type Props = {
  /** The visible text and the screen-reader name, already translated. */
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
};

export function Chip({ label, selected, onPress, disabled = false, testID }: Props) {
  const theme = useTheme();
  const slop = (theme.size.touchMin - theme.size.chipMin) / 2;
  const fill = selected ? theme.colors.text : theme.colors.card;
  const textColor = selected ? theme.colors.background : theme.colors.text;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={{ top: slop, bottom: slop }}
      style={{
        minHeight: theme.size.chipMin,
        minWidth: theme.size.touchMin,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.space[1],
        paddingVertical: theme.space[1],
        paddingHorizontal: theme.space[4],
        borderRadius: theme.radius.chip,
        borderWidth: theme.line.width,
        borderColor: selected ? theme.colors.text : theme.colors.divider,
        backgroundColor: fill,
        ...(disabled && { opacity: theme.opacity.disabled }),
      }}>
      {selected && <CheckMark testID="chip-check" color={textColor} />}
      <Text style={[theme.text.chip, { color: textColor }]}>{label}</Text>
    </Pressable>
  );
}
