// Metro bundles the locale folder through `require.context`; Jest has no such
// function, so the tests read the same folder from disk instead.
jest.mock('./src/i18n/localeFiles', () => {
  const path = jest.requireActual<typeof import('node:path')>('node:path');
  const { fsRequireContext } = jest.requireActual<typeof import('./test-support/fsRequireContext')>(
    './test-support/fsRequireContext',
  );
  return { localeFiles: fsRequireContext(path.join(__dirname, 'src', 'i18n', 'locales'), /\.json$/) };
});
