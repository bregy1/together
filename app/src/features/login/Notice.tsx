// A message about the whole step (not one field), e.g. "Keine Verbindung", with an
// optional retry. Announced once when it appears; an icon and the text carry the
// meaning, not the colour.
// spec: ONB-003, NFR-ACC-001
import { useEffect } from 'react';
import { AccessibilityInfo, Text, View } from 'react-native';

import { useTheme } from '../../theme';
import { Button } from '../../ui';

type Props = {
  /** The message, already translated. */
  message: string;
  /** The retry label, already translated; no retry action without it. */
  retryLabel?: string;
  onRetry?: () => void;
  testID?: string;
};

export function Notice({ message, retryLabel, onRetry, testID }: Props) {
  const theme = useTheme();

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(message);
  }, [message]);

  return (
    <View testID={testID} style={{ gap: theme.space[2], alignItems: 'flex-start' }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: theme.space[2] }}>
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={{
            width: theme.size.iconMin,
            height: theme.size.iconMin,
            borderRadius: theme.size.iconMin / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.colors.error,
          }}>
          <Text
            allowFontScaling={false}
            style={[theme.text.small, { color: theme.colors.onAccent, fontWeight: theme.text.button.fontWeight }]}>
            {'!'}
          </Text>
        </View>
        <Text style={[theme.text.body, { flex: 1, color: theme.colors.text }]}>{message}</Text>
      </View>
      {retryLabel && onRetry ? <Button label={retryLabel} variant="secondary" size="small" onPress={onRetry} /> : null}
    </View>
  );
}
