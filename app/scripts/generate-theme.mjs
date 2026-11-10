// Generates src/theme/tokens.generated.ts from the designer's tokens in
// spec/design/brand/tokens.json (W3C design tokens format).
// Run after the tokens change: `npm run generate:theme`. The output is checked in,
// so the app builds without the spec folder; a test fails when it is out of date.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
export const TOKENS_PATH = path.resolve(here, '..', '..', 'spec', 'design', 'brand', 'tokens.json');
export const OUTPUT_PATH = path.resolve(here, '..', 'src', 'theme', 'tokens.generated.ts');

const isToken = (node) => node && typeof node === 'object' && '$value' in node;
const entries = (group) => Object.entries(group).filter(([key]) => !key.startsWith('$'));

function lookup(root, ref) {
  const keys = ref.replace(/^\{|\}$/g, '').split('.');
  let node = root;
  for (const key of keys) {
    node = node?.[key];
    if (node === undefined) throw new Error(`Unknown token reference ${ref}`);
  }
  return node.$value;
}

function resolve(root, value) {
  if (typeof value === 'string' && /^\{.+\}$/.test(value)) return resolve(root, lookup(root, value));
  return value;
}

function px(value) {
  const match = /^(-?\d+(?:\.\d+)?)px$/.exec(value);
  if (!match) throw new Error(`Expected a px dimension, got ${value}`);
  return Number(match[1]);
}

function em(value) {
  const match = /^(-?\d+(?:\.\d+)?)em$/.exec(value);
  if (!match) throw new Error(`Expected an em value, got ${value}`);
  return Number(match[1]);
}

export function buildTokens(root) {
  const palette = Object.fromEntries(entries(root.color).map(([name, token]) => [name, token.$value]));

  const themes = Object.fromEntries(
    entries(root.theme).map(([look, group]) => [
      look,
      Object.fromEntries(entries(group).filter(([, t]) => isToken(t)).map(([role, t]) => [role, resolve(root, t.$value)])),
    ]),
  );

  const fonts = Object.fromEntries(entries(root.font).map(([name, token]) => [name, token.$value]));

  const text = Object.fromEntries(
    entries(root.text).map(([name, token]) => {
      const v = token.$value;
      const fontFamily = resolve(root, v.fontFamily);
      const style = {
        fontFamily: Array.isArray(fontFamily) ? fontFamily[0] : fontFamily,
        fontSize: px(v.fontSize),
        fontWeight: v.fontWeight,
      };
      if (v.lineHeight !== undefined) style.lineHeightRatio = v.lineHeight;
      if (v.letterSpacing !== undefined) style.letterSpacingEm = em(v.letterSpacing);
      if (v.textTransform !== undefined) style.textTransform = v.textTransform;
      return [name, style];
    }),
  );

  const dimensions = (group) => Object.fromEntries(entries(group).map(([name, token]) => [name, px(token.$value)]));

  return {
    palette,
    themes,
    fonts,
    text,
    space: dimensions(root.space),
    radius: dimensions(root.radius),
    size: dimensions(root.size),
  };
}

export function render(tokens) {
  const block = (name, value) => `export const ${name} = ${JSON.stringify(value, null, 2)} as const;\n`;
  return [
    '// GENERATED FILE: do not edit by hand.',
    '// Source: spec/design/brand/tokens.json. Regenerate with `npm run generate:theme`.',
    '// spec: design/tokens.md',
    '',
    block('palette', tokens.palette),
    block('themeColors', tokens.themes),
    block('fontStacks', tokens.fonts),
    block('textStyles', tokens.text),
    block('space', tokens.space),
    block('radius', tokens.radius),
    block('size', tokens.size),
  ].join('\n');
}

export function generate() {
  const root = JSON.parse(fs.readFileSync(TOKENS_PATH, 'utf8'));
  return render(buildTokens(root));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.includes('--check')) {
    const current = fs.existsSync(OUTPUT_PATH) ? fs.readFileSync(OUTPUT_PATH, 'utf8') : '';
    if (current.replace(/\r\n/g, '\n') !== generate()) {
      console.error('src/theme/tokens.generated.ts is out of date: run `npm run generate:theme`.');
      process.exit(1);
    }
    console.log('Theme tokens are up to date.');
    process.exit(0);
  }
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, generate());
  console.log(`Wrote ${path.relative(process.cwd(), OUTPUT_PATH)}`);
}
