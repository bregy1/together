// The one acceptance control on SCR-onb-rules: a box with the sentence beside it. No UI
// block fits, so it is built here from theme values. Checked = filled box with a check
// mark (the state is not shown by colour alone); role `checkbox` with its checked state;
// the whole row is the touch target, at least 44 px high.
// spec: ONB-016, NFR-ACC-001
import { Pressable, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { CheckMark } from '../../ui/CheckMark';

type Props = {
  /** The visible sentence and the screen-reader name, already translated. */
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  testID?: string;
};

export function AcceptanceCheckbox({ label, checked, onChange, disabled = false, testID }: Props) {
  const theme = useTheme();
  const box = theme.size.iconMax;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={{
        minHeight: theme.size.touchMin,
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.space[3],
        paddingVertical: theme.space[2],
        ...(disabled && { opacity: theme.opacity.disabled }),
      }}>
      <View
        style={{
          width: box,
          height: box,
          borderRadius: theme.space[1],
          borderWidth: theme.line.widthEmphasis,
          borderColor: theme.colors.text,
          backgroundColor: checked ? theme.colors.text : 'transparent',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {checked ? <CheckMark testID="acceptance-check" color={theme.colors.background} /> : null}
      </View>
      <Text style={[theme.text.body, { flex: 1, color: theme.colors.text }]}>{label}</Text>
    </Pressable>
  );
}
