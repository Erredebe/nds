export interface NDSOptionItem {
  label: string;
  value: string;
}

export const parseOptionItems = (raw: string): NDSOptionItem[] => {
  if (!raw.trim()) {
    return [];
  }

  return raw
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const separatorIndex = item.indexOf(':');

      if (separatorIndex === -1) {
        return {
          label: item,
          value: item
        };
      }

      const value = item.slice(0, separatorIndex).trim();
      const label = item.slice(separatorIndex + 1).trim();

      return {
        label: label || value,
        value
      };
    })
    .filter((item) => item.label.length > 0);
};

export const mergeIdRefs = (...values: Array<string | null | undefined>): string => {
  const tokens = values.flatMap((value) => `${value ?? ''}`.split(/\s+/)).filter(Boolean);
  return Array.from(new Set(tokens)).join(' ');
};
