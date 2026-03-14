import { semanticTokens } from './semantic-tokens.js';
import { tokens } from './tokens.js';

export type ThemeName = 'light' | 'dark';

type TokenNode = Record<string, unknown>;
type ThemeLeaf = Record<ThemeName, string>;
type ResolvedThemeTree<T> = T extends ThemeLeaf
  ? string
  : T extends Record<string, unknown>
    ? { [K in keyof T]: ResolvedThemeTree<T[K]> }
    : never;

const isThemeLeaf = (value: unknown): value is ThemeLeaf =>
  typeof value === 'object' &&
  value !== null &&
  'light' in value &&
  'dark' in value &&
  typeof (value as ThemeLeaf).light === 'string' &&
  typeof (value as ThemeLeaf).dark === 'string';

const resolveTokenReference = (value: string): string => {
  if (!value.startsWith('{') || !value.endsWith('}')) {
    return value;
  }

  const path = value.slice(1, -1).split('.');
  let currentValue: unknown = tokens;

  for (const segment of path) {
    if (typeof currentValue !== 'object' || currentValue === null || !(segment in (currentValue as TokenNode))) {
      throw new Error(`Unable to resolve semantic token reference: ${value}`);
    }

    currentValue = (currentValue as TokenNode)[segment];
  }

  if (typeof currentValue !== 'string') {
    throw new Error(`Resolved token reference is not a string value: ${value}`);
  }

  return currentValue;
};

const resolveThemeTree = <T>(node: T, themeName: ThemeName): ResolvedThemeTree<T> => {
  if (isThemeLeaf(node)) {
    return resolveTokenReference(node[themeName]) as ResolvedThemeTree<T>;
  }

  if (typeof node !== 'object' || node === null) {
    throw new Error('Theme tree must be an object.');
  }

  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => [key, resolveThemeTree(value, themeName)])
  ) as ResolvedThemeTree<T>;
};

export const themes = {
  light: resolveThemeTree(semanticTokens, 'light'),
  dark: resolveThemeTree(semanticTokens, 'dark')
} as const;
