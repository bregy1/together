// The segmented sign-up progress: five segments, those up to the current step filled in
// the text colour, the rest outlined (so done and open differ by shape, not only colour).
// Announced to screen readers as one element with the caller's label ("Schritt 2 von 5").
// spec: NFR-ACC-001; design/direction.md → UI building blocks (Onboarding)
import { View } from 'react-native';

import { useTheme } from '../theme';

type Props = {
  /** The current step, starting at 1. */
  step: number;
  /** The screen-reader text, already translated, e.g. t('…', { step, total }). */
  label: string;
  total?: number;
  testID?: string;
};

export function StepProgress({ step, label, total = 5, testID }: Props) {
  const theme = useTheme();
  return (
    <View
      testID={testID}
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityValue={{ min: 1, max: total, now: step }}
      style={{ flexDirection: 'row', gap: theme.space[1] }}>
      {Array.from({ length: total }, (_, index) => {
        const done = index < step;
        return (
          <View
            key={index}
            testID={`step-segment-${index + 1}`}
            // PLACEHOLDER(design): segment height (4 px) and the outlined open segment are not specified.
            style={{
              flex: 1,
              height: theme.space[1],
              borderRadius: theme.radius.chip,
              backgroundColor: done ? theme.colors.text : 'transparent',
              ...(!done && { borderWidth: theme.line.width, borderColor: theme.colors.textSecondary }),
            }}
          />
        );
      })}
    </View>
  );
}
