/**
 * The shell renders the three tabs in both looks (dark and daylight), with
 * German labels from translation keys and colours from the theme.
 * @spec NFR-INTL-001.S1 (labels come from keys)
 */
import { fireEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';
import { StyleSheet } from 'react-native';

import { palette } from '../src/theme/tokens.generated';

const mockColorScheme = jest.fn<'light' | 'dark' | null, []>();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockColorScheme(),
}));

// The tabs are for signed-in members; without a session the app opens sign-up (ONB-001).
jest.mock('../src/session/sessionStore', () => ({
  sessionStore: { getToken: async () => 'member-token', setToken: async () => {}, clear: async () => {} },
}));

const tabs = [
  { id: 'discover', name: 'Entdecken' },
  { id: 'my-plans', name: 'Meine Pläne' },
  { id: 'profile', name: 'Profil' },
];

const looks = [
  { scheme: 'dark' as const, background: palette.nacht, text: palette.eis },
  { scheme: 'light' as const, background: palette.eis, text: palette.nacht },
];

describe.each(looks)('shell in the $scheme look', ({ scheme, background, text }) => {
  beforeEach(() => mockColorScheme.mockReturnValue(scheme));

  it('shows the three tabs with accessible German labels', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });

    for (const { name } of tabs) {
      expect(screen.getByLabelText(name)).toBeOnTheScreen();
    }
  });

  it('opens each tab and shows its title in the theme colours', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });

    for (const { id, name } of tabs) {
      await fireEvent.press(screen.getByLabelText(name));
      const heading = await screen.findByRole('header', { name });
      expect(StyleSheet.flatten(heading.props.style)).toEqual(expect.objectContaining({ color: text }));
      expect(StyleSheet.flatten(screen.getByTestId(`screen-${id}`).props.style)).toEqual(
        expect.objectContaining({ backgroundColor: background }),
      );
    }
  });
});
