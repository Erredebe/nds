import { tokens } from '../foundation/tokens.js';

const spacingKeys = new Set(Object.keys(tokens.spacing));
const radiusKeys = new Set(Object.keys(tokens.radius));
const shadowKeys = new Set(Object.keys(tokens.shadows));

const hasUnit = (value: string): boolean =>
  /^(?:-?\d+(?:\.\d+)?(?:px|rem|em|%|vh|vw)|0)$/.test(value);

export const resolveSpaceValue = (value: string | null, fallback = '0'): string => {
  if (!value) {
    return fallback;
  }

  return spacingKeys.has(value) ? `var(--nds-spacing-${value})` : hasUnit(value) ? value : fallback;
};

export const resolveRadiusValue = (value: string | null, fallback = 'var(--nds-radius-md)'): string => {
  if (!value) {
    return fallback;
  }

  return radiusKeys.has(value) ? `var(--nds-radius-${value})` : hasUnit(value) ? value : fallback;
};

export const resolveShadowValue = (value: string | null, fallback = 'var(--nds-shadows-sm)'): string => {
  if (!value) {
    return fallback;
  }

  return shadowKeys.has(value) ? `var(--nds-shadows-${value})` : value;
};
