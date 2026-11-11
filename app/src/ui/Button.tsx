// Buttons: primary (Mint surface, Nacht text), secondary (outline in the text colour)
// and text (underlined). Archivo 700, fully rounded, 60 px high or 44 px small.
// The height is a minimum, so the label can grow with the system text size.
// spec: NFR-ACC-001; design/direction.md → UI building blocks
import { ActivityIndicator, Pressable, Text, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'text';
export type ButtonSize = 'regular' | 'small';

type Props = {
  /** The visible text and the screen-reader name, already translated. */
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  /** Shows a progress indicator, announces "busy" and ignores presses. */
  busy?: boolean;
  /** Extra screen-reader hint, already translated. */
  accessibilityHint?: string;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'regular',
  disabled = false,
  busy = false,
  accessibilityHint,
  testID,
}: Props) {
  const theme = useTheme();
  const textColor = variant === 'primary' ? theme.colors.onAccent : theme.colors.text;

  const container: ViewStyle = {
    minHeight: size === 'small' ? theme.size.buttonSmall : theme.size.button,
    minWidth: theme.size.touchMin,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.space[2],
    paddingVertical: theme.space[2],
    paddingHorizontal: variant === 'text' ? theme.space[1] : size === 'small' ? theme.space[4] : theme.space[6],
    borderRadius: theme.radius.button,
    ...(variant === 'primary' && { backgroundColor: theme.colors.accent }),
    ...(variant === 'secondary' && {
      backgroundColor: 'transparent',
      borderWidth: theme.line.width,
      borderColor: theme.colors.text,
    }),
    ...(disabled && { opacity: theme.opacity.disabled }),
  };

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ busy }}
      disabled={disabled || busy}
      onPress={onPress}
      style={container}>
      {busy && <ActivityIndicator testID="button-busy-indicator" color={textColor} />}
      <Text
        style={[
          theme.text.button,
          { color: textColor, textAlign: 'center' },
          variant === 'text' && { textDecorationLine: 'underline' },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}
