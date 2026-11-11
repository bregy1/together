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
 *      (title, tabBarLabel, tabBarAccessibilityLabel, headerTitle …),
 *   4. string literals with letters in JSX expressions placed as children
 *      (<Text>{'Hallo'}</Text>),
 *   5. the screen-reader value text (accessibilityValue={{ text }}, aria-valuetext).
 * In 2 to 5 a literal also counts when it sits in a ternary branch, a `+`
 * concatenation, `??` or `||`, or is a template string (its fixed parts).
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

/** Whether the node sits inside the value of the JSX attribute with this name. */
function isInsideAttribute(node: ts.Node, attribute: string): boolean {
  for (let current: ts.Node | undefined = node.parent; current; current = current.parent) {
    if (ts.isJsxAttribute(current)) return nameOf(current.name) === attribute;
  }
  return false;
}

/**
 * The literal texts an expression can show: a string or template literal itself, or
 * the literals in the branches of a ternary, a `+` concatenation, `??` or `||`.
 * A template with placeholders is reported with `${…}` in their place.
 * Function calls (such as t('…')) and identifiers are not followed.
 */
function literalTexts(node: ts.Node | undefined): { node: ts.Node; text: string }[] {
  if (!node) return [];
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) return [{ node, text: node.text }];
  if (ts.isTemplateExpression(node)) {
    const text = node.head.text + node.templateSpans.map((span) => '${…}' + span.literal.text).join('');
    return [{ node, text }];
  }
  if (ts.isParenthesizedExpression(node) || ts.isJsxExpression(node)) return literalTexts(node.expression);
  if (ts.isConditionalExpression(node)) return [...literalTexts(node.whenTrue), ...literalTexts(node.whenFalse)];
  if (ts.isBinaryExpression(node)) {
    const op = node.operatorToken.kind;
    if (op === ts.SyntaxKind.PlusToken || op === ts.SyntaxKind.QuestionQuestionToken || op === ts.SyntaxKind.BarBarToken) {
      return [...literalTexts(node.left), ...literalTexts(node.right)];
    }
  }
  return [];
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
  const reportLiterals = (node: ts.Node | undefined) => {
    for (const found of literalTexts(node)) {
      if (HAS_LETTER.test(found.text)) report(found.node, found.text);
    }
  };

  const visit = (node: ts.Node) => {
    if (ts.isJsxText(node) && HAS_LETTER.test(node.text)) {
      report(node, node.text);
    }
    // Expressions placed as JSX children: <Text>{'Hallo'}</Text>, <Text>{a ? 'Ja' : 'Nein'}</Text>.
    if (ts.isJsxExpression(node) && node.parent && (ts.isJsxElement(node.parent) || ts.isJsxFragment(node.parent))) {
      reportLiterals(node.expression);
    }
    if (ts.isJsxAttribute(node)) {
      const key = nameOf(node.name);
      if (key && (USER_FACING_KEYS.has(key) || key === 'aria-valuetext')) reportLiterals(node.initializer);
    }
    if (ts.isPropertyAssignment(node)) {
      const key = nameOf(node.name);
      if (key && USER_FACING_KEYS.has(key)) reportLiterals(node.initializer);
      // accessibilityValue={{ text: '…' }} is read out to screen-reader users.
      if (key === 'text' && isInsideAttribute(node, 'accessibilityValue')) reportLiterals(node.initializer);
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
      "const f = <Text>{'Willkommen'}</Text>;",
      "const g = <Text>{busy ? 'Lädt' : t('ok')}</Text>;",
      "const h = <Button label={done ? t('a') : 'Fertig'} />;",
      "const i = <Text>{`Hallo ${name}`}</Text>;",
      "const j = <View accessibilityHint={`Noch ${n} Sekunden`} />;",
      "const k = <View accessibilityValue={{ now: 2, text: 'zwei von fünf' }} />;",
      "const l = <View aria-valuetext=\"halb voll\" />;",
      "const m = <Text>{'+41'}</Text>;",
      "const n = <View testID={`${id}-field`} />;",
      "const o = <Text>{t('x', { name: 'id' })}</Text>;",
      "const p = <Text>{'Guten ' + 'Tag'}</Text>;",
    ].join('\n');
    const found = findHardCodedText(path.join(SRC_DIR, 'sample.tsx'), sample).map((f) => f.text);
    expect(found).toEqual([
      'Hallo',
      'Profil',
      'Entdecken',
      'Willkommen',
      'Lädt',
      'Fertig',
      'Hallo ${…}',
      'Noch ${…} Sekunden',
      'zwei von fünf',
      'halb voll',
      'Guten',
      'Tag',
    ]);
  });

  it('finds no hard-coded user-facing text in src/', () => {
    const files = listSourceFiles(SRC_DIR);
    expect(files.length).toBeGreaterThan(0);
    const findings = files.flatMap((file) => findHardCodedText(file, fs.readFileSync(file, 'utf8')));
    expect(findings).toEqual([]);
  });
});
