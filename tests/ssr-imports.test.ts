// @vitest-environment node

import { describe, expect, it } from 'vitest';

describe('SSR-safe imports', () => {
  it('allows importing the root entrypoint to read tokens and themes', async () => {
    const module = await import('../dist/index.js');

    expect(module.tokens.spacing[4]).toBe('1rem');
    expect(module.themes.light.color.text).toBe('#0f172a');
    expect(typeof module.defineAllComponents).toBe('function');
  });

  it('throws a readable error when defining components outside the browser runtime', async () => {
    const module = await import('../dist/components/button/index.js');

    expect(() => module.defineButton()).toThrowError(
      "Cannot define 'nds-button' outside a browser custom elements runtime."
    );
  });
});
