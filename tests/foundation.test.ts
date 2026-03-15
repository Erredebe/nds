import { describe, expect, it } from 'vitest';

import { NDSButtonElement } from '../dist/components/button/component.js';
import type { DomMode } from '../dist/foundation/base-element.js';
import {
  configureComponentClass,
  NDSComponentElement,
  type NDSComponentDefinition
} from '../dist/foundation/component.js';
import { createThemeCss, createTokenCss, defineComponent, setTheme } from '../dist/foundation/index.js';
import { validateExpressionSource, validateStatementSource } from '../src/foundation/expression.ts';
import type { CompiledTemplateDefinition } from '../dist/foundation/template.js';
import { renderTemplate } from '../dist/foundation/template.js';

let componentCounter = 0;

const createTestComponentClass = (defaultDomMode: DomMode): typeof NDSComponentElement => {
  const tagName = `nds-foundation-test-${componentCounter++}`;

  class NDSTestElement extends NDSComponentElement {
    static definition: NDSComponentDefinition<NDSTestElement> = {
      tagName,
      observedAttributes: [],
      shadowStyles: '',
      defaultDomMode,
      template: {
        sourcePath: 'inline',
        tagName,
        nodes: [
          {
            attributeBindings: [],
            children: [],
            classBindings: [],
            eventBindings: [],
            kind: 'element',
            propertyBindings: [],
            staticAttributes: [['data-test', 'ok']],
            styleBindings: [],
            tagName: 'div'
          }
        ]
      }
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
    expect(NDSButtonElement.definition.defaultDomMode).toBe('light');
    expect(NDSButtonElement.definition.observedAttributes).toEqual([
      'aria-describedby',
      'aria-label',
      'aria-labelledby',
      'disabled',
      'label',
      'name',
      'size',
      'type',
      'value',
      'variant'
    ]);
    expect(NDSButtonElement.definition.shadowStyles).toContain(':host');
    expect(NDSButtonElement.definition.stylePath).toBe('./styles.css');
    expect(NDSButtonElement.definition.templatePath).toBe('./template.html');
    expect(NDSButtonElement.definition.template.sourcePath).toBe('src/components/button/template.html');
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

  it('renders Angular-like bindings, *if and *for from compiled templates', () => {
    const host = Object.assign(document.createElement('div'), {
      count: 0,
      items: ['one', 'two'],
      refs: {} as Record<string, Element>,
      visible: true
    });

    const { fragment, refs } = renderTemplate(
      host as unknown as HTMLElement & Record<string, unknown> & { refs: Record<string, Element> },
      {
        sourcePath: 'inline',
        tagName: 'nds-inline-test',
        nodes: [
          {
            attributeBindings: [],
            children: [{ kind: 'text', parts: [{ kind: 'expr', value: 'item' }] }],
            classBindings: [],
            eventBindings: [['click', 'count = count + 1']],
            forBinding: { expression: 'items', itemName: 'item', trackByExpression: 'item' },
            kind: 'element',
            propertyBindings: [],
            staticAttributes: [['class', 'item']],
            styleBindings: [],
            tagName: 'button'
          },
          {
            attributeBindings: [],
            children: [{ kind: 'text', parts: [{ kind: 'static', value: 'Visible' }] }],
            classBindings: [],
            eventBindings: [],
            ifExpression: 'visible',
            kind: 'element',
            propertyBindings: [],
            ref: 'message',
            staticAttributes: [],
            styleBindings: [],
            tagName: 'span'
          }
        ]
      } as CompiledTemplateDefinition,
      'light'
    );

    document.body.append(fragment);

    const buttons = Array.from(document.body.querySelectorAll<HTMLButtonElement>('button.item'));

    expect(buttons).toHaveLength(2);
    expect(buttons[0]?.getAttribute('data-nds-key')).toBe('one');
    expect(buttons[1]?.getAttribute('data-nds-key')).toBe('two');
    expect(document.body.textContent).toContain('one');
    expect(document.body.textContent).toContain('two');
    expect(refs.message?.textContent).toBe('Visible');

    buttons[0]?.click();

    expect(host.count).toBe(1);

    document.body.replaceChildren();
  });

  it('sanitizes explicit [innerHTML] bindings before rendering', () => {
    const host = Object.assign(document.createElement('div'), {
      htmlSnippet: '<strong>Trusted</strong><img src="x" onerror="alert(1)"><a href="javascript:alert(1)">Bad</a>',
      refs: {} as Record<string, Element>
    });

    const { fragment } = renderTemplate(
      host as unknown as HTMLElement & Record<string, unknown> & { refs: Record<string, Element> },
      {
        sourcePath: 'inline',
        tagName: 'nds-inline-html',
        nodes: [
          {
            attributeBindings: [],
            children: [{ kind: 'text', parts: [{ kind: 'static', value: 'Ignored' }] }],
            classBindings: [],
            eventBindings: [],
            innerHtmlExpression: 'htmlSnippet',
            kind: 'element',
            propertyBindings: [],
            staticAttributes: [],
            styleBindings: [],
            tagName: 'div'
          }
        ]
      } as CompiledTemplateDefinition,
      'light'
    );

    document.body.append(fragment);

    expect(document.body.querySelector('strong')?.textContent).toBe('Trusted');
    expect(document.body.querySelector('img')).toBeNull();
    expect(document.body.querySelector('a')?.hasAttribute('href')).toBe(false);
    expect(document.body.textContent).not.toContain('Ignored');

    document.body.replaceChildren();
  });

  it('rejects unsafe property bindings at render time', () => {
    const host = Object.assign(document.createElement('div'), {
      htmlSnippet: '<strong>Unsafe</strong>',
      refs: {} as Record<string, Element>
    });

    expect(() =>
      renderTemplate(
        host as unknown as HTMLElement & Record<string, unknown> & { refs: Record<string, Element> },
        {
          sourcePath: 'inline',
          tagName: 'nds-inline-unsafe-prop',
          nodes: [
            {
              attributeBindings: [],
              children: [],
              classBindings: [],
              eventBindings: [],
              kind: 'element',
              propertyBindings: [['innerHTML', 'htmlSnippet']],
              staticAttributes: [],
              styleBindings: [],
              tagName: 'div'
            }
          ]
        } as CompiledTemplateDefinition,
        'light'
      )
    ).toThrow('Unsafe property binding is not allowed: innerHTML');
  });
});

describe('foundation expression security', () => {
  it('rejects assignments in non-event expressions', () => {
    expect(() => validateExpressionSource('count = count + 1')).toThrow('Assignments are only allowed in event statements.');
  });

  it('allows assignments in event statements', () => {
    expect(() => validateStatementSource('count = count + 1')).not.toThrow();
  });

  it('rejects dangerous member names', () => {
    expect(() => validateExpressionSource('item.constructor')).toThrow('Access to constructor is not allowed.');
    expect(() => validateStatementSource('item.__proto__ = value')).toThrow('Access to __proto__ is not allowed.');
  });
});
