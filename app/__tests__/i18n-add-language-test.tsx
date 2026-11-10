/**
 * @spec NFR-INTL-001.S2
 * Given French translations are added, when the device language is French,
 * then the app shows French without a code change.
 *
 * The locale folder is copied to a temporary folder and a fr.json is dropped in
 * next to de.json. Nothing in src/ changes; the real app routes are rendered.
 */
import { renderRouter, screen } from 'expo-router/testing-library';

jest.mock('expo-localization', () => ({
  getLocales: () => [
    { languageCode: 'fr', languageTag: 'fr-CH', regionCode: 'CH' },
    { languageCode: 'de', languageTag: 'de-CH', regionCode: 'CH' },
  ],
}));

jest.mock('../src/i18n/localeFiles', () => {
  const fs = jest.requireActual<typeof import('node:fs')>('node:fs');
  const os = jest.requireActual<typeof import('node:os')>('node:os');
  const path = jest.requireActual<typeof import('node:path')>('node:path');
  const { fsRequireContext } = jest.requireActual<typeof import('../test-support/fsRequireContext')>(
    '../test-support/fsRequireContext',
  );
  const sourceDir = path.join(__dirname, '..', 'src', 'i18n', 'locales');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'yaruno-locales-'));
  for (const name of fs.readdirSync(sourceDir)) fs.copyFileSync(path.join(sourceDir, name), path.join(dir, name));
  fs.copyFileSync(path.join(__dirname, 'fixtures', 'fr.json'), path.join(dir, 'fr.json'));
  return { localeFiles: fsRequireContext(dir, /\.json$/) };
});

describe('@spec NFR-INTL-001.S2 a new language ships by adding its file', () => {
  it('shows French when fr.json is present and the device language is French', async () => {
    await renderRouter('./src/app', { initialUrl: '/' });

    expect(screen.getByRole('header', { name: 'Découvrir' })).toBeOnTheScreen();
    expect(screen.getByLabelText('Mes plans')).toBeOnTheScreen();
    expect(screen.queryByText('Entdecken')).toBeNull();
  });
});
