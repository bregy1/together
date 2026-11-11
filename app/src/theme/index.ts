// The brand theme in the dark (default) and daylight looks.
// Values come from tokens.generated.ts (generated from spec/design/brand/tokens.json);
// components read from here and never type in a colour, size or font by hand.
// spec: design/tokens.md, design/direction.md
import { useColorScheme, type TextStyle } from 'react-native';

import { fontStacks, palette, radius, size, space, textStyles, themeColors } from './tokens.generated';

export type ColorSchemeName = 'dark' | 'light';
export type TextVariant = keyof typeof textStyles;

const COLOR_ROLES = [
  'background',
  'card',
  'text',
  'textSecondary',
  'surfaceSecondary',
  'accent',
  'onAccent',
  'success',
  'warning',
  'error',
  'hint',
] as const;

export type ThemeColors = Record<(typeof COLOR_ROLES)[number] | 'input' | 'inputBorder' | 'divider', string>;

const round = (value: number) => Math.round(value * 100) / 100;

function toTextStyle(style: (typeof textStyles)[TextVariant]): TextStyle {
  return {
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    fontWeight: String(style.fontWeight) as TextStyle['fontWeight'],
    ...('lineHeightRatio' in style && { lineHeight: round(style.fontSize * style.lineHeightRatio) }),
    ...('letterSpacingEm' in style && { letterSpacing: round(style.fontSize * style.letterSpacingEm) }),
    ...('textTransform' in style && { textTransform: style.textTransform }),
  };
}

const generatedText = Object.fromEntries(
  Object.entries(textStyles).map(([name, style]) => [name, toTextStyle(style)]),
) as Record<TextVariant, TextStyle>;

// tokens.md → Typography names `text.chip` (Archivo 500) but gives it no size.
// PLACEHOLDER(design): chip text size; the small text size (14 px) is used for now.
const text = {
  ...generatedText,
  chip: { ...generatedText.small, fontWeight: '500' },
} satisfies Record<TextVariant | 'chip', TextStyle>;

const pickRoles = (look: Record<string, string>) =>
  Object.fromEntries(COLOR_ROLES.map((role) => [role, look[role]])) as Pick<ThemeColors, (typeof COLOR_ROLES)[number]>;

const darkColors: ThemeColors = {
  ...pickRoles(themeColors.dark),
  input: themeColors.dark.input,
  inputBorder: themeColors.dark.inputBorder,
  divider: themeColors.dark.divider,
};

const lightColors: ThemeColors = {
  ...pickRoles(themeColors.light),
  // PLACEHOLDER(design): the daylight input-field fill is not defined by the designer yet
  // (tokens.md → Roles, NEEDS DECISION); the owner chose weiss as a stand-in.
  input: palette.weiss,
  // PLACEHOLDER(design): the daylight border and line colour is not defined by the designer yet
  // (tokens.md → Roles, NEEDS DECISION); the owner chose nebel-hell as a stand-in.
  inputBorder: palette['nebel-hell'],
  divider: palette['nebel-hell'],
};

// PLACEHOLDER(design): shadows and elevation are not specified; the owner chose no shadows for now.
const elevation = { none: {} } as const;

// PLACEHOLDER(design): animation timing is not specified; the owner chose a standard 200 ms ease-out for now.
const motion = { durationMs: 200, easing: 'ease-out' } as const;

// PLACEHOLDER(design): border and outline widths are not specified; 1 px for lines, and the
// 2 px icon stroke where a line marks a state (focus, error).
const line = { width: 1, widthEmphasis: size.iconStroke } as const;

// PLACEHOLDER(design): the look of disabled controls is not specified; 40 % opacity for now.
const opacity = { disabled: 0.4 } as const;

// The wordmark's construction (direction.md → Logo, tokens.md → Logo sizes): Fraunces 900,
// tracking −2 %, dot diameter 0.56 × font size, gap to the "n" 0.06 × font size.
// These values are in the spec but not yet in spec/design/brand/tokens.json.
const logo = { fontWeight: '900', letterSpacingEm: -0.02, dotRatio: 0.56, gapRatio: 0.06 } as const;

function buildTheme(scheme: ColorSchemeName, colors: ThemeColors) {
  return { scheme, colors, text, space, radius, size, fonts: fontStacks, elevation, motion, line, opacity, logo };
}

export type Theme = ReturnType<typeof buildTheme>;

export const themes: Record<ColorSchemeName, Theme> = {
  dark: buildTheme('dark', darkColors),
  light: buildTheme('light', lightColors),
};

/** The look follows the phone's light or dark setting; dark is the brand default. */
export function useTheme(): Theme {
  return useColorScheme() === 'light' ? themes.light : themes.dark;
}
