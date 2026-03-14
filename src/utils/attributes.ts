export const booleanAttribute = (value: string | null): boolean =>
  value !== null && value !== 'false';

export const stringAttribute = (element: Element, name: string, fallback = ''): string =>
  element.getAttribute(name) ?? fallback;

export const enumAttribute = <T extends readonly string[]>(
  element: Element,
  name: string,
  values: T,
  fallback: T[number]
): T[number] => {
  const value = element.getAttribute(name);

  return values.includes(value as T[number]) ? (value as T[number]) : fallback;
};
