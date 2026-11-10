/**
 * Jest stand-in for Metro's `require.context`, which Jest does not provide.
 * It scans a real folder, so tests see the same locale files the bundle would.
 */
import fs from 'node:fs';
import path from 'node:path';

export type RequireContextLike = {
  (key: string): unknown;
  keys(): string[];
};

export function fsRequireContext(directory: string, filter: RegExp): RequireContextLike {
  const keys = fs
    .readdirSync(directory)
    .map((name) => `./${name}`)
    .filter((key) => filter.test(key));
  const context = (key: string) => JSON.parse(fs.readFileSync(path.join(directory, key), 'utf8'));
  return Object.assign(context, { keys: () => keys });
}
