import { describe, expect, it } from 'vitest';

import { NDSButtonElement } from '../dist/components/button/component.js';
import type { DomMode } from '../dist/foundation/base-element.js';
import {
  configureComponentClass,
  NDSComponentElement,
  type NDSComponentDefinition
} from '../dist/foundation/component.js';
import { createThemeCss, createTokenCss, defineComponent, setTheme } from '../dist/foundation/index.js';

let componentCounter = 0;

const createTestComponentClass = (defaultDomMode: DomMode): typeof NDSComponentElement => {
  const tagName = `nds-foundation-test-${componentCounter++}`;

  class NDSTestElement extends NDSComponentElement {
    static definition: NDSComponentDefinition<NDSTestElement> = {
      tagName,
      observedAttributes: [],
      shadowStyles: '',
      defaultDomMode,
      renderTemplate: () => '<div data-test="ok"></div>'
    };
  }

  return NDSTestElement;
};

describe('foundation css output', () => {
  it('serializes token and theme vars', () => {
    const tokenCss = createTokenCss();
    const themeCss = createThemeCss();

    expect(tokenCss).toContain('--nds-colors-blue-600: #2563eb;');
    expect(tokenCss).toContain('--nds-spacing-4: 1rem;');
    expect(themeCss).toContain(':root, [data-nds-theme="light"]');
    expect(themeCss).toContain('[data-nds-theme="dark"]');
    expect(themeCss).toContain('--nds-color-text: #0f172a;');
    expect(themeCss).toContain('--nds-component-button-solid-background: #2563eb;');
  });

  it('setTheme writes the theme attribute on the selected root', () => {
    const root = document.createElement('div');

    setTheme('dark', root);

    expect(root.getAttribute('data-nds-theme')).toBe('dark');
  });
});

describe('foundation component configuration', () => {
  it('normalizes decorator metadata into a component definition', () => {
    expect(NDSButtonElement.definition.tagName).toBe('nds-button');
    expect(NDSButtonElement.definition.observedAttributes).toEqual(['disabled', 'label', 'size', 'type', 'variant']);
    expect(NDSButtonElement.definition.shadowStyles).toContain(':host');
    expect(NDSButtonElement.definition.stylePath).toBe('./styles.css');
  });

  it('caches configured classes by base class and dom mode', () => {
    const lightClassA = configureComponentClass(NDSButtonElement, 'light');
    const lightClassB = configureComponentClass(NDSButtonElement, 'light');
    const shadowClass = configureComponentClass(NDSButtonElement, 'shadow');

    expect(lightClassA).toBe(lightClassB);
    expect(lightClassA).not.toBe(shadowClass);
  });

  it('uses definition.defaultDomMode when no override is provided', () => {
    const TestComponent = createTestComponentClass('light');
    const registered = defineComponent(TestComponent);

    expect((registered as typeof NDSComponentElement).domMode).toBe('light');
    expect(customElements.get(TestComponent.definition.tagName)).toBe(registered);
  });

  it('allows overriding dom mode through defineComponent options', () => {
    const TestComponent = createTestComponentClass('light');
    const registered = defineComponent(TestComponent, { dom: 'shadow' });

    expect((registered as typeof NDSComponentElement).domMode).toBe('shadow');
    expect(customElements.get(TestComponent.definition.tagName)).toBe(registered);
  });
});
