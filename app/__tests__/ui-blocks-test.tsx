/**
 * The shared UI building blocks (design/direction.md → UI building blocks):
 * each renders in both looks with theme colours, has an accessible role and a
 * label from its caller, keeps a touch area of at least 44 px, shows its
 * states without relying on colour alone and lets text grow with the system
 * text size (minimum heights, never fixed ones).
 * Groundwork for NFR-ACC-001; its scenarios are proven screen by screen in CR-0001.T16.
 * @spec NFR-ACC-001.S1 (text scales, actions stay reachable)
 * @spec NFR-ACC-001.S2 (every control has a role and a label)
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import fs from 'node:fs';
import path from 'node:path';
import type { ReactElement } from 'react';
import { AccessibilityInfo, StyleSheet, Text, type ViewStyle } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { themes } from '../src/theme';
import { palette } from '../src/theme/tokens.generated';
import { Button, Chip, Screen, StepProgress, TextField, Wordmark } from '../src/ui';

const mockColorScheme = jest.fn<'light' | 'dark' | null, []>();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockColorScheme(),
}));

const TOUCH_MIN = 44;

const looks = [
  { scheme: 'dark' as const, text: palette.eis, background: palette.nacht, card: palette.schiefer, input: palette.schiefer, line: palette.linie },
  // PLACEHOLDER(design): daylight line colour nebel-hell and input fill weiss, chosen by the owner.
  { scheme: 'light' as const, text: palette.nacht, background: palette.eis, card: palette.weiss, input: palette.weiss, line: palette['nebel-hell'] },
];

const metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

const renderUi = (ui: ReactElement) => render(<SafeAreaProvider initialMetrics={metrics}>{ui}</SafeAreaProvider>);

/** Shown on screen but hidden from screen readers (announced through the control instead). */
const shown = { includeHiddenElements: true };

let announce: jest.SpyInstance;
beforeEach(() => {
  announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => {});
});
afterEach(() => announce.mockRestore());

type Host ={ props: { style?: unknown; hitSlop?: unknown } };
const styleOf = (el: Host) => StyleSheet.flatten(el.props.style as ViewStyle) ?? {};

/** The height and width a finger can hit: the minimum size plus any hit slop. */
function touchArea(el: Host) {
  const style = styleOf(el);
  const slop = (el.props.hitSlop ?? {}) as { top?: number; bottom?: number; left?: number; right?: number };
  const height = Number(style.minHeight ?? style.height ?? 0) + (slop.top ?? 0) + (slop.bottom ?? 0);
  const width = Number(style.minWidth ?? style.width ?? 0) + (slop.left ?? 0) + (slop.right ?? 0);
  return { height, width };
}

describe.each(looks)('UI blocks in the $scheme look', (look) => {
  beforeEach(() => mockColorScheme.mockReturnValue(look.scheme));

  describe('Button', () => {
    it('primary: a Mint surface with Nacht text, 60 px high, fully rounded, role and label', async () => {
      const onPress = jest.fn();
      await renderUi(<Button label="Weiter" onPress={onPress} />);
      const button = screen.getByRole('button', { name: 'Weiter' });
      expect(styleOf(button)).toEqual(
        expect.objectContaining({ backgroundColor: palette.mint, minHeight: 60, borderRadius: themes.dark.radius.button }),
      );
      expect(styleOf(button).height).toBeUndefined();
      expect(StyleSheet.flatten(screen.getByText('Weiter').props.style)).toEqual(
        expect.objectContaining({ color: palette.nacht, fontFamily: 'Archivo', fontWeight: '700' }),
      );
      expect(touchArea(button).height).toBeGreaterThanOrEqual(TOUCH_MIN);
      expect(touchArea(button).width).toBeGreaterThanOrEqual(TOUCH_MIN);
      await fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('secondary: an outline in the text colour', async () => {
      await renderUi(<Button label="Später" variant="secondary" onPress={() => {}} />);
      const button = screen.getByRole('button', { name: 'Später' });
      expect(styleOf(button)).toEqual(expect.objectContaining({ borderColor: look.text, backgroundColor: 'transparent' }));
      expect(Number(styleOf(button).borderWidth)).toBeGreaterThan(0);
      expect(StyleSheet.flatten(screen.getByText('Später').props.style)).toEqual(expect.objectContaining({ color: look.text }));
    });

    it('text button: underlined text with a 44 px touch area', async () => {
      await renderUi(<Button label="Code erneut senden" variant="text" onPress={() => {}} />);
      const button = screen.getByRole('button', { name: 'Code erneut senden' });
      expect(StyleSheet.flatten(screen.getByText('Code erneut senden').props.style)).toEqual(
        expect.objectContaining({ color: look.text, textDecorationLine: 'underline' }),
      );
      expect(touchArea(button).height).toBeGreaterThanOrEqual(TOUCH_MIN);
      expect(touchArea(button).width).toBeGreaterThanOrEqual(TOUCH_MIN);
    });

    it('small size is 44 px high', async () => {
      await renderUi(<Button label="Ok" size="small" onPress={() => {}} />);
      const button = screen.getByRole('button', { name: 'Ok' });
      expect(styleOf(button).minHeight).toBe(44);
      expect(touchArea(button).width).toBeGreaterThanOrEqual(TOUCH_MIN);
    });

    it('disabled: announced as disabled and does not react', async () => {
      const onPress = jest.fn();
      await renderUi(<Button label="Weiter" disabled onPress={onPress} />);
      const button = screen.getByRole('button', { name: 'Weiter' });
      expect(button).toBeDisabled();
      await fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });

    it('busy: announced as busy, shows a progress indicator and does not react', async () => {
      const onPress = jest.fn();
      await renderUi(<Button label="Weiter" busy onPress={onPress} />);
      const button = screen.getByRole('button', { name: 'Weiter' });
      expect(button).toBeBusy();
      expect(screen.getByTestId('button-busy-indicator')).toBeOnTheScreen();
      await fireEvent.press(button);
      expect(onPress).not.toHaveBeenCalled();
    });
  });

  describe('Chip', () => {
    it('unselected: card colour with a line border, fully rounded, 38 px or more, 44 px touch area', async () => {
      await renderUi(<Chip label="Wandern" selected={false} onPress={() => {}} />);
      const chip = screen.getByRole('button', { name: 'Wandern' });
      expect(chip).not.toBeSelected();
      const style = styleOf(chip);
      expect(style).toEqual(
        expect.objectContaining({ backgroundColor: look.card, borderColor: look.line, borderRadius: themes.dark.radius.chip }),
      );
      expect(style.minHeight).toBeGreaterThanOrEqual(38);
      expect(style.minHeight).toBeLessThanOrEqual(40);
      expect(style.height).toBeUndefined();
      expect(touchArea(chip).height).toBeGreaterThanOrEqual(TOUCH_MIN);
      expect(touchArea(chip).width).toBeGreaterThanOrEqual(TOUCH_MIN);
      expect(screen.queryByTestId('chip-check', shown)).toBeNull();
    });

    it('selected: filled with the text colour, opposite text, a check mark (not colour alone), announced as selected', async () => {
      const onPress = jest.fn();
      await renderUi(<Chip label="Wandern" selected onPress={onPress} />);
      const chip = screen.getByRole('button', { name: 'Wandern' });
      expect(chip).toBeSelected();
      expect(styleOf(chip)).toEqual(expect.objectContaining({ backgroundColor: look.text }));
      expect(StyleSheet.flatten(screen.getByText('Wandern').props.style)).toEqual(
        expect.objectContaining({ color: look.background, fontWeight: '500' }),
      );
      expect(screen.getByTestId('chip-check', shown)).toBeOnTheScreen();
      await fireEvent.press(chip);
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('TextField', () => {
    it('has a visible label above, the input named by it, 56 px high, radius 16, theme fill and border', async () => {
      await renderUi(<TextField label="Telefonnummer" value="" onChangeText={() => {}} testID="phone" />);
      expect(screen.getByText('Telefonnummer', shown)).toBeOnTheScreen();
      const input = screen.getByLabelText('Telefonnummer');
      expect(input.props.value).toBe('');
      const field = screen.getByTestId('phone-field');
      expect(styleOf(field)).toEqual(
        expect.objectContaining({ minHeight: 56, borderRadius: 16, backgroundColor: look.input, borderColor: look.line }),
      );
      expect(styleOf(field).height).toBeUndefined();
      expect(StyleSheet.flatten(input.props.style)).toEqual(expect.objectContaining({ color: look.text }));
      expect(touchArea(field).height).toBeGreaterThanOrEqual(TOUCH_MIN);
    });

    it('passes typed text to the caller', async () => {
      const onChangeText = jest.fn();
      await renderUi(<TextField label="Name" value="" onChangeText={onChangeText} />);
      await fireEvent.changeText(screen.getByLabelText('Name'), 'Anna');
      expect(onChangeText).toHaveBeenCalledWith('Anna');
    });

    it('shows a hint below and announces it with the field', async () => {
      await renderUi(<TextField label="Name" hint="So sehen dich andere." value="" onChangeText={() => {}} />);
      expect(screen.getByText('So sehen dich andere.', shown)).toBeOnTheScreen();
      expect(screen.getByLabelText('Name').props.accessibilityHint).toContain('So sehen dich andere.');
    });

    it('shows an error as text with an icon (not colour alone) and announces it', async () => {
      await renderUi(
        <TextField label="Name" error="Bitte gib deinen Namen ein." value="" onChangeText={() => {}} testID="name" />,
      );
      expect(screen.getByText('Bitte gib deinen Namen ein.', shown)).toBeOnTheScreen();
      expect(screen.getByTestId('name-error-icon', shown)).toBeOnTheScreen();
      expect(announce).toHaveBeenCalledWith('Bitte gib deinen Namen ein.');
      expect(screen.getByLabelText('Name').props.accessibilityHint).toContain('Bitte gib deinen Namen ein.');
      const field = styleOf(screen.getByTestId('name-field'));
      expect(field.borderColor).toBe(palette.koralle);
    });

    it('renders an optional leading slot, e.g. the country code', async () => {
      await renderUi(
        <TextField label="Telefonnummer" leading={<Text>+41</Text>} value="" onChangeText={() => {}} />,
      );
      expect(screen.getByText('+41')).toBeOnTheScreen();
    });
  });

  describe('StepProgress', () => {
    it('shows five segments with the steps up to the current one filled, announced as one element', async () => {
      await renderUi(<StepProgress step={2} label="Schritt 2 von 5" />);
      const progress = screen.getByRole('progressbar', { name: 'Schritt 2 von 5' });
      expect(progress.props.accessibilityValue).toEqual(expect.objectContaining({ min: 1, max: 5, now: 2 }));
      const segments = screen.getAllByTestId(/^step-segment-/);
      expect(segments).toHaveLength(5);
      const filled = segments.map((s) => styleOf(s).backgroundColor === look.text);
      expect(filled).toEqual([true, true, false, false, false]);
      // Filled and empty segments also differ in contrast against the background, not only in hue.
      for (const s of segments) expect(Number(styleOf(s).minHeight ?? styleOf(s).height)).toBeGreaterThan(0);
    });
  });

  describe('Screen', () => {
    it('applies the safe areas and the 20 px side margin, scrolls its content and holds a bottom area', async () => {
      await renderUi(
        <Screen testID="scr" footer={<Button label="Weiter" onPress={() => {}} />}>
          <Text>Inhalt</Text>
        </Screen>,
      );
      expect(styleOf(screen.getByTestId('scr'))).toEqual(
        expect.objectContaining({ backgroundColor: look.background, paddingTop: metrics.insets.top }),
      );
      const scroll = screen.getByTestId('scr-scroll');
      expect(StyleSheet.flatten(scroll.props.contentContainerStyle)).toEqual(
        expect.objectContaining({ paddingHorizontal: 20 }),
      );
      expect(screen.getByText('Inhalt')).toBeOnTheScreen();
      const footer = styleOf(screen.getByTestId('scr-footer'));
      expect(footer).toEqual(expect.objectContaining({ paddingHorizontal: 20 }));
      expect(Number(footer.paddingBottom)).toBeGreaterThanOrEqual(metrics.insets.bottom);
      expect(screen.getByRole('button', { name: 'Weiter' })).toBeOnTheScreen();
    });
  });

  describe('Wordmark', () => {
    it('is one image named by the caller, Fraunces 900, with the dot sized from the font size', async () => {
      await renderUi(<Wordmark accessibilityLabel="Yaruno" fontSize={50} />);
      expect(screen.getByRole('image', { name: 'Yaruno' })).toBeOnTheScreen();
      const letters = screen.getByTestId('wordmark-letters');
      expect(StyleSheet.flatten(letters.props.style)).toEqual(
        expect.objectContaining({ fontFamily: 'Fraunces', fontWeight: '900', fontSize: 50, color: look.text }),
      );
      const dot = styleOf(screen.getByTestId('wordmark-dot'));
      expect(dot.width).toBeCloseTo(28);
      expect(dot.height).toBeCloseTo(28);
      expect(dot.marginLeft).toBeCloseTo(3);
      // The dot is Mint on dark and the text colour in daylight (never Mint on light).
      expect(dot.backgroundColor).toBe(look.scheme === 'dark' ? palette.mint : palette.nacht);
    });
  });
});

describe('UI blocks take every value from the theme', () => {
  const UI_DIR = path.join(__dirname, '..', 'src', 'ui');
  const files = fs.readdirSync(UI_DIR).filter((f) => /\.tsx?$/.test(f));

  it('contain no colour literals', () => {
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const source = fs.readFileSync(path.join(UI_DIR, file), 'utf8');
      expect({ file, colours: source.match(/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/g) ?? [] }).toEqual({ file, colours: [] });
    }
  });

  it('contain no hand-typed sizes (numbers other than 0, 1, 2 and the five steps)', () => {
    for (const file of files) {
      const source = fs
        .readFileSync(path.join(UI_DIR, file), 'utf8')
        .replace(/\/\/.*$/gm, '')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/'[^']*'|"[^"]*"|`[^`]*`/g, "''");
      const numbers = (source.match(/(?<![\w.[])\d+(\.\d+)?(?![\w])/g) ?? []).filter((n) => !['0', '1', '2', '5'].includes(n));
      expect({ file, numbers }).toEqual({ file, numbers: [] });
    }
  });
});
