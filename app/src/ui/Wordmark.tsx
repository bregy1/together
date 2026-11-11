// PLACEHOLDER(design): the wordmark, built from text until the designer delivers the logo file.
// "yarun" in Fraunces 900 (tracking −2 %) and a filled dot for the final "o": diameter
// 0.56 × font size, gap 0.06 × font size, sitting on the baseline. The dot is Mint on dark
// and the text colour in daylight (never Mint on light). One image for screen readers,
// named by the caller. It does not scale with the system text size: it is a logo, and the
// dot's geometry depends on the font size.
// Known gap: React Native cannot set Fraunces' SOFT 100 and optical-size 144 axes.
// spec: design/direction.md → Logo; design/tokens.md → Logo sizes
import { Text, View } from 'react-native';

import { useTheme } from '../theme';

/** The logo's letters: part of the brand mark, not translatable text. */
const LETTERS = 'yarun';

type Props = {
  /** The screen-reader name ("Yaruno"), already translated. */
  accessibilityLabel: string;
  /** Font size of the letters; the dot follows it. Defaults to the h1 size. */
  fontSize?: number;
  testID?: string;
};

export function Wordmark({ accessibilityLabel, fontSize, testID }: Props) {
  const theme = useTheme();
  const size = fontSize ?? Number(theme.text.h1.fontSize);
  const dot = size * theme.logo.dotRatio;
  const color = theme.colors.text;

  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="image"
      accessibilityLabel={accessibilityLabel}
      style={{ flexDirection: 'row', alignItems: 'baseline', alignSelf: 'flex-start' }}>
      <Text
        testID="wordmark-letters"
        allowFontScaling={false}
        style={{
          fontFamily: theme.fonts.wordmark[0],
          fontWeight: theme.logo.fontWeight,
          fontSize: size,
          letterSpacing: size * theme.logo.letterSpacingEm,
          color,
        }}>
        {LETTERS}
      </Text>
      <View
        testID="wordmark-dot"
        style={{
          width: dot,
          height: dot,
          borderRadius: dot / 2,
          marginLeft: size * theme.logo.gapRatio,
          backgroundColor: theme.scheme === 'dark' ? theme.colors.accent : color,
        }}
      />
    </View>
  );
}
