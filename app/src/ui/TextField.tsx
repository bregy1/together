// A text field: visible label above, 56 px high (a minimum), radius 16, input fill with a
// line border; optional hint and error text below and an optional leading slot (e.g. "+41").
// The error is shown as text with an icon, so it is not conveyed by colour alone, and it
// is announced when it appears. The label, hint and error reach screen readers through
// the input itself, so each is announced once.
// spec: NFR-ACC-001; design/direction.md → UI building blocks
import { useEffect, useState, type ReactNode } from 'react';
import { AccessibilityInfo, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useTheme } from '../theme';

type Props = Omit<TextInputProps, 'style' | 'accessibilityLabel' | 'accessibilityHint' | 'testID'> & {
  /** The visible label and the screen-reader name, already translated. */
  label: string;
  /** Help text below the field, already translated. */
  hint?: string;
  /** Error text below the field, already translated; its presence puts the field in the error state. */
  error?: string;
  /** Content before the input inside the field, e.g. the country code. */
  leading?: ReactNode;
  /** Base id; the field gets `<testID>-field`, the input `<testID>`, the error icon `<testID>-error-icon`. */
  testID?: string;
};

const hidden = { accessibilityElementsHidden: true, importantForAccessibility: 'no-hide-descendants' } as const;

export function TextField({ label, hint, error, leading, testID, onFocus, onBlur, ...inputProps }: Props) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const id = (suffix: string) => (testID ? `${testID}-${suffix}` : undefined);

  useEffect(() => {
    if (error) AccessibilityInfo.announceForAccessibility(error);
  }, [error]);

  // PLACEHOLDER(design): focus and error borders are not specified; the focused field gets
  // a border in the text colour, the error field one in the error colour, both thicker.
  const borderColor = error ? theme.colors.error : focused ? theme.colors.text : theme.colors.inputBorder;
  const borderWidth = error || focused ? theme.line.widthEmphasis : theme.line.width;
  const description = [error, hint].filter(Boolean).join(' ');

  return (
    <View style={{ gap: theme.space[2] }}>
      <Text {...hidden} style={[theme.text.label, { color: theme.colors.text }]}>
        {label}
      </Text>
      <View
        testID={id('field')}
        style={{
          minHeight: theme.size.input,
          flexDirection: 'row',
          alignItems: 'center',
          gap: theme.space[2],
          paddingHorizontal: theme.space[4],
          borderRadius: theme.radius.input,
          borderWidth,
          borderColor,
          backgroundColor: theme.colors.input,
        }}>
        {leading}
        <TextInput
          {...inputProps}
          testID={testID}
          accessibilityLabel={label}
          accessibilityHint={description || undefined}
          placeholderTextColor={theme.colors.textSecondary}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          style={[
            theme.text.body,
            { flex: 1, alignSelf: 'stretch', lineHeight: undefined, color: theme.colors.text, paddingVertical: theme.space[3] },
          ]}
        />
      </View>
      {error ? (
        <View {...hidden} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[2] }}>
          <View
            testID={id('error-icon')}
            style={{
              width: theme.size.iconMin,
              height: theme.size.iconMin,
              borderRadius: theme.size.iconMin / 2,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme.colors.error,
            }}>
            {/* A symbol, not text: it does not scale and is hidden from screen readers. */}
            <Text
              allowFontScaling={false}
              style={[theme.text.small, { color: theme.colors.onAccent, fontWeight: theme.text.button.fontWeight }]}>
              {'!'}
            </Text>
          </View>
          {/* PLACEHOLDER(design): the error text is in the text colour, because Koralle as text on
              the daylight background is below 4.5:1; the Koralle icon and border mark the error. */}
          <Text style={[theme.text.small, { flex: 1, color: theme.colors.text }]}>{error}</Text>
        </View>
      ) : null}
      {hint ? (
        <Text {...hidden} style={[theme.text.small, { color: theme.colors.textSecondary }]}>
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
