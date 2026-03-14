import { themes, type ThemeName } from './themes.js';
import { tokens } from './tokens.js';

type Primitive = string | number | boolean;

interface NestedRecord {
  [key: string]: Primitive | NestedRecord;
}

const toKebabCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .toLowerCase();

const flattenObject = (
  objectValue: NestedRecord,
  prefix: string[] = []
): Array<{ name: string; value: Primitive }> => {
  const entries: Array<{ name: string; value: Primitive }> = [];

  for (const [key, value] of Object.entries(objectValue)) {
    const nextPrefix = [...prefix, toKebabCase(key)];

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      entries.push({
        name: `--nds-${nextPrefix.join('-')}`,
        value
      });
      continue;
    }

    entries.push(...flattenObject(value, nextPrefix));
  }

  return entries;
};

const createDeclarationBlock = (selector: string, values: NestedRecord): string => {
  const declarations = flattenObject(values)
    .map(({ name, value }) => `  ${name}: ${String(value)};`)
    .join('\n');

  return `${selector} {\n${declarations}\n}`;
};

export const createTokenCss = (): string => createDeclarationBlock(':root', tokens as NestedRecord);

export const createThemeCss = (): string => {
  const lightCss = createDeclarationBlock(':root, [data-nds-theme="light"]', themes.light as NestedRecord);
  const darkCss = createDeclarationBlock('[data-nds-theme="dark"]', themes.dark as NestedRecord);

  return `${lightCss}\n\n${darkCss}`;
};

export const setTheme = (
  theme: ThemeName,
  root: HTMLElement = document.documentElement
): HTMLElement => {
  root.setAttribute('data-nds-theme', theme);
  return root;
};
