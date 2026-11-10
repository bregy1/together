/**
 * The theme is generated from spec/design/brand/tokens.json and follows the
 * roles in spec/design/tokens.md.
 */
import { execFileSync } from 'node:child_process';
import path from 'node:path';

import { themes } from '../src/theme';
import { palette } from '../src/theme/tokens.generated';

describe('theme', () => {
  it('the generated token file matches spec/design/brand/tokens.json', () => {
    const script = path.join(__dirname, '..', 'scripts', 'generate-theme.mjs');
    expect(() => execFileSync(process.execPath, [script, '--check'], { stdio: 'pipe' })).not.toThrow();
  });

  it('maps the dark look to the roles in tokens.md', () => {
    expect(themes.dark.colors).toEqual(
      expect.objectContaining({
        background: palette.nacht,
        card: palette.schiefer,
        text: palette.eis,
        textSecondary: palette.nebel,
        accent: palette.mint,
        onAccent: palette.nacht,
        divider: palette.linie,
        inputBorder: palette.linie,
      }),
    );
  });

  it('maps the daylight look to the roles in tokens.md, with the placeholder line colour', () => {
    expect(themes.light.colors).toEqual(
      expect.objectContaining({
        background: palette.eis,
        card: palette.weiss,
        text: palette.nacht,
        textSecondary: palette['nebel-hell'],
        divider: palette['nebel-hell'],
        inputBorder: palette['nebel-hell'],
      }),
    );
  });

  it('turns the type scale into React Native text styles', () => {
    expect(themes.dark.text.h1).toEqual({
      fontFamily: 'Archivo',
      fontSize: 40,
      fontWeight: '700',
      lineHeight: 40.8,
      letterSpacing: -1.2,
    });
    expect(themes.dark.text.label).toEqual(
      expect.objectContaining({ fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.88 }),
    );
  });
});
