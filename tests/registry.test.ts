import { describe, expect, it } from 'vitest';

import { defineAlert } from '../dist/components/alert/index.js';
import { defineButton } from '../dist/components/button/index.js';
import { defineDialog } from '../dist/components/dialog/index.js';
import { defineField } from '../dist/components/field/index.js';
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

  it('defines nds-alert once', () => {
    const firstDefinition = defineAlert({ dom: 'shadow' });
    const secondDefinition = defineAlert({ dom: 'light' });

    expect(firstDefinition).toBe(secondDefinition);
    expect(customElements.get('nds-alert')).toBe(firstDefinition);
  });

  it('defines nds-field once', () => {
    const firstDefinition = defineField({ dom: 'light' });
    const secondDefinition = defineField({ dom: 'shadow' });

    expect(firstDefinition).toBe(secondDefinition);
    expect(customElements.get('nds-field')).toBe(firstDefinition);
  });

  it('defines nds-dialog once', () => {
    const firstDefinition = defineDialog({ dom: 'shadow' });
    const secondDefinition = defineDialog({ dom: 'light' });

    expect(firstDefinition).toBe(secondDefinition);
    expect(customElements.get('nds-dialog')).toBe(firstDefinition);
  });
});
