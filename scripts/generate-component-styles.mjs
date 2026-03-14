import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const projectRoot = process.cwd();
const componentsDirectory = resolve(projectRoot, 'src/components');
const generatedDirectory = resolve(projectRoot, 'src/generated');
const generatedComponentsDirectory = resolve(generatedDirectory, 'components');
const generatedManifestPath = resolve(generatedDirectory, 'component-styles.generated.ts');

const stripComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').trim();

const splitSelectors = (value) => {
  const selectors = [];
  let current = '';
  let bracketDepth = 0;
  let parenthesisDepth = 0;

  for (const character of value) {
    if (character === '[') {
      bracketDepth += 1;
    } else if (character === ']') {
      bracketDepth -= 1;
    } else if (character === '(') {
      parenthesisDepth += 1;
    } else if (character === ')') {
      parenthesisDepth -= 1;
    } else if (character === ',' && bracketDepth === 0 && parenthesisDepth === 0) {
      selectors.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  if (current.trim()) {
    selectors.push(current.trim());
  }

  return selectors;
};

const parseBlocks = (css) => {
  const blocks = [];
  let index = 0;

  while (index < css.length) {
    while (index < css.length && /\s/.test(css[index])) {
      index += 1;
    }

    if (index >= css.length) {
      break;
    }

    const headerStart = index;

    while (index < css.length && css[index] !== '{') {
      index += 1;
    }

    const header = css.slice(headerStart, index).trim();
    index += 1;

    let depth = 1;
    const bodyStart = index;

    while (index < css.length && depth > 0) {
      if (css[index] === '{') {
        depth += 1;
      } else if (css[index] === '}') {
        depth -= 1;
      }

      index += 1;
    }

    const body = css.slice(bodyStart, index - 1).trim();

    if (header) {
      blocks.push({ body, header });
    }
  }

  return blocks;
};

const indent = (value) =>
  value
    .split('\n')
    .map((line) => (line ? `  ${line}` : line))
    .join('\n');

const transformSelector = (selector, tagName) => {
  const trimmedSelector = selector.trim();

  if (!trimmedSelector) {
    return trimmedSelector;
  }

  if (trimmedSelector.includes(':host')) {
    return trimmedSelector.replace(/:host(\(([^)]*)\))?/g, (_, _fullMatch, hostSelector) =>
      hostSelector ? `${tagName}${hostSelector}` : tagName
    );
  }

  return `${tagName} ${trimmedSelector}`;
};

const transformRule = ({ body, header }, tagName) => {
  if (header.startsWith('@media') || header.startsWith('@supports')) {
    return `${header} {\n${indent(transformCss(body, tagName))}\n}`;
  }

  if (header.startsWith('@keyframes') || header.startsWith('@font-face')) {
    return `${header} {\n${body}\n}`;
  }

  const selectors = splitSelectors(header).map((selector) => transformSelector(selector, tagName)).join(',\n');

  return `${selectors} {\n${body}\n}`;
};

const transformCss = (css, tagName) =>
  parseBlocks(stripComments(css))
    .map((block) => transformRule(block, tagName))
    .join('\n\n')
    .trim();

const escapeTemplateLiteral = (value) =>
  value.replaceAll('\\', '\\\\').replaceAll('`', '\\`').replaceAll('${', '\\${');

const componentDirectories = (await readdir(componentsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

await rm(generatedComponentsDirectory, { force: true, recursive: true });
await mkdir(generatedComponentsDirectory, { recursive: true });

const entries = [];

for (const directoryName of componentDirectories) {
  const styleSourcePath = resolve(componentsDirectory, directoryName, 'styles.css');

  try {
    await access(styleSourcePath);
  } catch {
    continue;
  }

  const sourceCss = stripComments(await readFile(styleSourcePath, 'utf8'));
  const tagName = `nds-${directoryName}`;
  const shadowStyles = sourceCss;
  const lightStyles = transformCss(sourceCss, tagName);
  const outputPath = resolve(generatedComponentsDirectory, directoryName, 'styles.generated.ts');

  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(
    outputPath,
    [
      `export const shadowStyles = \`${escapeTemplateLiteral(shadowStyles)}\`;`,
      `export const lightStyles = \`${escapeTemplateLiteral(lightStyles)}\`;`,
      ''
    ].join('\n'),
    'utf8'
  );

  entries.push({
    directoryName,
    stylePath: `src/components/${directoryName}/styles.css`,
    tagName
  });
}

const importLines = entries.map(
  ({ directoryName }) => `import * as ${directoryName.replace(/-([a-z])/g, (_, part) => part.toUpperCase())}Styles from './components/${directoryName}/styles.generated.js';`
);

const entryLines = entries.map(({ directoryName, stylePath, tagName }) => {
  const identifier = `${directoryName.replace(/-([a-z])/g, (_, part) => part.toUpperCase())}Styles`;

  return `  '${tagName}': { lightStyles: ${identifier}.lightStyles, shadowStyles: ${identifier}.shadowStyles, stylePath: '${stylePath}', tagName: '${tagName}' }`;
});

const lightStyleLines = entries.map(({ directoryName }) => {
  const identifier = `${directoryName.replace(/-([a-z])/g, (_, part) => part.toUpperCase())}Styles`;

  return `  ${identifier}.lightStyles`;
});

await writeFile(
  generatedManifestPath,
  [
    ...importLines,
    '',
    'export interface GeneratedComponentStyleEntry {',
    '  tagName: string;',
    '  stylePath: string;',
    '  shadowStyles: string;',
    '  lightStyles: string;',
    '}',
    '',
    'export const generatedComponentStyles: Record<string, GeneratedComponentStyleEntry> = {',
    entryLines.join(',\n'),
    '};',
    '',
    'export const generatedLightStyles = [',
    lightStyleLines.join(',\n'),
    '] as const;',
    ''
  ].join('\n'),
  'utf8'
);
