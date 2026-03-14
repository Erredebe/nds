import { describe, expect, it } from 'vitest';

import { defineButton } from '../dist/components/button/index.js';
import { defineInput } from '../dist/components/input/index.js';

describe('component registration', () => {
  it('defines nds-button once', () => {
    const firstDefinition = defineButton({ dom: 'shadow' });
    const secondDefinition = defineButton({ dom: 'light' });

    expect(firstDefinition).toBe(secondDefinition);
    expect(customElements.get('nds-button')).toBe(firstDefinition);
  });

  it('defines nds-input once', () => {
    const firstDefinition = defineInput({ dom: 'light' });
    const secondDefinition = defineInput({ dom: 'shadow' });

    expect(firstDefinition).toBe(secondDefinition);
    expect(customElements.get('nds-input')).toBe(firstDefinition);
  });
});
