/**
 * @spec NFR-INTL-001.S1
 * Given the code base, when it is checked for hard-coded user-facing strings,
 * then none are found.
 *
 * The check parses every source file under src/ with the TypeScript compiler
 * and reports:
 *   1. JSX text with letters (e.g. <Text>Hallo</Text>),
 *   2. string literals with letters in JSX attributes that users see or hear
 *      (title, placeholder, accessibilityLabel, accessibilityHint, aria-label …),
 *   3. string literals with letters in navigation options that users see
 *      (title, tabBarLabel, tabBarAccessibilityLabel, headerTitle …).
 * Text must come from a translation key (t('…')).
 */
import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const SRC_DIR = path.join(__dirname, '..', 'src');

/** Attributes and option keys whose value is shown to or read out to a user. */
const USER_FACING_KEYS = new Set([
  'title',
  'label',
  'placeholder',
  'accessibilityLabel',
  'accessibilityHint',
  'aria-label',
  'tabBarLabel',
  'tabBarAccessibilityLabel',
  'headerTitle',
  'headerBackTitle',
  'alt',
]);

const HAS_LETTER = /\p{L}/u;

type Finding = { file: string; line: number; text: string };

function listSourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return listSourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

function nameOf(node: ts.Node): string | undefined {
  if (ts.isIdentifier(node) || ts.isStringLiteral(node)) return node.text;
  if (ts.isJsxNamespacedName(node)) return `${node.namespace.text}:${node.name.text}`;
  return undefined;
}

function isTextLiteral(node: ts.Node | undefined): node is ts.StringLiteral | ts.NoSubstitutionTemplateLiteral {
  return !!node && (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node));
}

export function findHardCodedText(fileName: string, source: string): Finding[] {
  const sf = ts.createSourceFile(fileName, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const findings: Finding[] = [];
  const report = (node: ts.Node, text: string) =>
    findings.push({
      file: path.relative(SRC_DIR, fileName),
      line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1,
      text: text.trim(),
    });

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && HAS_LETTER.test(node.text)) {
      report(node, node.text);
    }
    if (ts.isJsxAttribute(node)) {
      const key = nameOf(node.name);
      const init = node.initializer;
      if (key && USER_FACING_KEYS.has(key)) {
        if (isTextLiteral(init) && HAS_LETTER.test(init.text)) report(init, init.text);
        if (init && ts.isJsxExpression(init) && isTextLiteral(init.expression) && HAS_LETTER.test(init.expression.text)) {
          report(init.expression, init.expression.text);
        }
      }
    }
    if (ts.isPropertyAssignment(node)) {
      const key = nameOf(node.name);
      if (key && USER_FACING_KEYS.has(key) && isTextLiteral(node.initializer) && HAS_LETTER.test(node.initializer.text)) {
        report(node.initializer, node.initializer.text);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return findings;
}

describe('@spec NFR-INTL-001.S1 no hard-coded user-facing text', () => {
  it('the checker catches hard-coded text (self-test)', () => {
    const sample = [
      "const a = <Text>Hallo</Text>;",
      "const b = <View accessibilityLabel=\"Profil\" />;",
      "const c = <Tabs.Screen options={{ title: 'Entdecken' }} />;",
      "const d = <Text>{t('tabs.discover')}</Text>;",
      "const e = <View testID=\"shell\" />;",
    ].join('\n');
    const found = findHardCodedText(path.join(SRC_DIR, 'sample.tsx'), sample).map((f) => f.text);
    expect(found).toEqual(['Hallo', 'Profil', 'Entdecken']);
  });

  it('finds no hard-coded user-facing text in src/', () => {
    const files = listSourceFiles(SRC_DIR);
    expect(files.length).toBeGreaterThan(0);
    const findings = files.flatMap((file) => findHardCodedText(file, fs.readFileSync(file, 'utf8')));
    expect(findings).toEqual([]);
  });
});
