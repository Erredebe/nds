import { afterEach, describe, expect, it } from 'vitest';

import { NDSAlertElement } from '../dist/components/alert/component.js';
import { NDSBoxElement } from '../dist/components/box/component.js';
import { NDSButtonElement } from '../dist/components/button/component.js';
import { NDSCardElement } from '../dist/components/card/component.js';
import { NDSHeadingElement } from '../dist/components/heading/component.js';
import { NDSInputElement } from '../dist/components/input/component.js';
import { NDSStackElement } from '../dist/components/stack/component.js';
import { NDSTextElement } from '../dist/components/text/component.js';
import { configureComponentClass, type NDSComponentClass } from '../dist/foundation/component.js';

const registerTestElement = <T extends NDSComponentClass<any>>(
  baseClass: T,
  tagName: string,
  domMode: 'light' | 'shadow'
): void => {
  if (customElements.get(tagName)) {
    return;
  }

  customElements.define(tagName, configureComponentClass(baseClass, domMode));
};

const tags = {
  lightAlert: 'nds-test-alert-light',
  shadowAlert: 'nds-test-alert-shadow',
  lightBox: 'nds-test-box-light',
  shadowButton: 'nds-test-button-shadow',
  lightButton: 'nds-test-button-light',
  lightCard: 'nds-test-card-light',
  shadowHeading: 'nds-test-heading-shadow',
  lightInput: 'nds-test-input-light',
  shadowInput: 'nds-test-input-shadow',
  lightStack: 'nds-test-stack-light',
  shadowText: 'nds-test-text-shadow'
} as const;

registerTestElement(NDSAlertElement, tags.lightAlert, 'light');
registerTestElement(NDSAlertElement, tags.shadowAlert, 'shadow');
registerTestElement(NDSBoxElement, tags.lightBox, 'light');
registerTestElement(NDSButtonElement, tags.lightButton, 'light');
registerTestElement(NDSButtonElement, tags.shadowButton, 'shadow');
registerTestElement(NDSCardElement, tags.lightCard, 'light');
registerTestElement(NDSHeadingElement, tags.shadowHeading, 'shadow');
registerTestElement(NDSInputElement, tags.lightInput, 'light');
registerTestElement(NDSInputElement, tags.shadowInput, 'shadow');
registerTestElement(NDSStackElement, tags.lightStack, 'light');
registerTestElement(NDSTextElement, tags.shadowText, 'shadow');

afterEach(() => {
  document.body.replaceChildren();
});

describe('nds-button', () => {
  it('renders with shadow dom when configured', () => {
    const element = document.createElement(tags.shadowButton);
    element.setAttribute('label', 'Primary action');
    document.body.append(element);

    expect(element.shadowRoot).not.toBeNull();
    expect(element.shadowRoot?.querySelector('.nds-button__control')).not.toBeNull();
    expect(element.shadowRoot?.textContent).toContain('Primary action');
  });

  it('renders into the host when configured for light dom', () => {
    const element = document.createElement(tags.lightButton);
    element.setAttribute('label', 'Ghost action');
    document.body.append(element);

    expect(element.shadowRoot).toBeNull();
    expect(element.querySelector('.nds-button__control')).not.toBeNull();
    expect(element.textContent).toContain('Ghost action');
  });

  it('emits nds-click from the host and survives rerenders', () => {
    const element = document.createElement(tags.shadowButton);
    const receivedTargets: EventTarget[] = [];

    element.addEventListener('nds-click', (event) => {
      receivedTargets.push(event.target as EventTarget);
    });

    document.body.append(element);
    element.shadowRoot?.querySelector<HTMLButtonElement>('.nds-button__control')?.click();
    element.setAttribute('label', 'Updated');
    element.shadowRoot?.querySelector<HTMLButtonElement>('.nds-button__control')?.click();

    expect(receivedTargets).toHaveLength(2);
    expect(receivedTargets[0]).toBe(element);
    expect(receivedTargets[1]).toBe(element);
  });
});

describe('nds-input', () => {
  it('renders in shadow dom and reflects the attribute value', () => {
    const element = document.createElement(tags.shadowInput);
    element.setAttribute('label', 'Email');
    element.setAttribute('value', 'hello@example.com');
    document.body.append(element);

    const input = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-input__control');

    expect(input).not.toBeNull();
    expect(input?.value).toBe('hello@example.com');
  });

  it('renders in light dom and syncs user input back to the host attribute', () => {
    const element = document.createElement(tags.lightInput);
    element.setAttribute('label', 'Email');
    document.body.append(element);

    const input = element.querySelector<HTMLInputElement>('.nds-input__control');

    expect(input).not.toBeNull();

    if (!input) {
      return;
    }

    input.value = 'typed@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    expect(element.getAttribute('value')).toBe('typed@example.com');
  });

  it('keeps label and aria state wired to the internal control', () => {
    const element = document.createElement(tags.shadowInput);
    element.setAttribute('label', 'Work email');
    element.setAttribute('required', '');
    element.setAttribute('invalid', '');
    document.body.append(element);

    const label = element.shadowRoot?.querySelector<HTMLLabelElement>('.nds-input__label');
    const input = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-input__control');

    expect(label?.getAttribute('for')).toBe(input?.id);
    expect(input?.getAttribute('required')).toBe('');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
  });

  it('emits nds-input and nds-change with the host as target', () => {
    const element = document.createElement(tags.lightInput);
    const received = {
      change: [] as string[],
      input: [] as string[]
    };

    element.addEventListener('nds-input', (event) => {
      received.input.push((event as CustomEvent<{ value: string }>).detail.value);
      expect(event.target).toBe(element);
    });

    element.addEventListener('nds-change', (event) => {
      received.change.push((event as CustomEvent<{ value: string }>).detail.value);
      expect(event.target).toBe(element);
    });

    document.body.append(element);

    const input = element.querySelector<HTMLInputElement>('.nds-input__control');

    expect(input).not.toBeNull();

    if (!input) {
      return;
    }

    input.value = 'one@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    input.value = 'two@example.com';
    input.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(received.input).toEqual(['one@example.com']);
    expect(received.change).toEqual(['two@example.com']);
  });
});

describe('nds-alert', () => {
  it('renders trusted [innerHTML] content and trackBy keys in shadow dom', () => {
    const element = document.createElement(tags.shadowAlert);
    element.setAttribute('title', 'Deploy notice');
    element.setAttribute('message-html', '<p><strong>Heads up</strong> before release.</p>');
    element.setAttribute('features', 'Preview build|Smoke tests|Rollback plan');
    document.body.append(element);

    const root = element.shadowRoot;
    const features = Array.from(root?.querySelectorAll<HTMLLIElement>('.nds-alert__feature') ?? []);

    expect(root?.querySelector('.nds-alert__message strong')?.textContent).toBe('Heads up');
    expect(features.map((item) => item.getAttribute('data-nds-key'))).toEqual([
      '0-Preview build',
      '1-Smoke tests',
      '2-Rollback plan'
    ]);
  });

  it('reuses keyed list nodes when trackBy order changes', () => {
    const element = document.createElement(tags.shadowAlert);
    element.setAttribute('features', 'Alpha|Beta|Gamma');
    document.body.append(element);

    const before = Array.from(element.shadowRoot?.querySelectorAll<HTMLLIElement>('.nds-alert__feature') ?? []);
    const betaBefore = before.find((item) => item.textContent?.includes('Beta')) ?? null;

    element.setAttribute('features', 'Gamma|Beta|Alpha');

    const after = Array.from(element.shadowRoot?.querySelectorAll<HTMLLIElement>('.nds-alert__feature') ?? []);
    const betaAfter = after.find((item) => item.textContent?.includes('Beta')) ?? null;

    expect(betaBefore).not.toBeNull();
    expect(betaAfter).toBe(betaBefore);
    expect(after.map((item) => item.getAttribute('data-nds-key'))).toEqual(['0-Gamma', '1-Beta', '2-Alpha']);
  });

  it('emits nds-dismiss and hides the host content after dismiss', () => {
    const element = document.createElement(tags.lightAlert);
    const received: string[] = [];

    element.setAttribute('title', 'Watch the rollout');
    element.setAttribute('message', 'Keep an eye on errors.');
    element.setAttribute('dismissible', '');
    element.addEventListener('nds-dismiss', (event) => {
      received.push((event as CustomEvent<{ tone: string }>).detail.tone);
    });
    document.body.append(element);

    const dismissButton = element.querySelector<HTMLButtonElement>('.nds-alert__dismiss');

    expect(dismissButton).not.toBeNull();
    dismissButton?.click();

    expect(received).toEqual(['info']);
    expect(element.querySelector('[hidden]')).not.toBeNull();
  });
});

describe('layout and typography primitives', () => {
  it('renders semantic heading tags from the level attribute', () => {
    const element = document.createElement(tags.shadowHeading);
    element.setAttribute('level', '3');
    element.setAttribute('text', 'Release readiness');
    document.body.append(element);

    const heading = element.shadowRoot?.querySelector('h3');

    expect(heading).not.toBeNull();
    expect(heading?.textContent).toContain('Release readiness');
  });

  it('renders text with the requested semantic tag', () => {
    const element = document.createElement(tags.shadowText);
    element.setAttribute('tag', 'strong');
    element.setAttribute('text', 'Stable API');
    document.body.append(element);

    const text = element.shadowRoot?.querySelector('strong.nds-text__content');

    expect(text).not.toBeNull();
    expect(text?.textContent).toContain('Stable API');
  });

  it('applies box design tokens as CSS custom properties', () => {
    const element = document.createElement(tags.lightBox);
    element.setAttribute('padding', '4');
    element.setAttribute('radius', 'lg');
    element.setAttribute('surface', 'accent');
    document.body.append(element);

    expect(element.style.getPropertyValue('--nds-box-padding')).toBe('var(--nds-spacing-4)');
    expect(element.style.getPropertyValue('--nds-box-radius')).toBe('var(--nds-radius-lg)');
    expect(element.style.getPropertyValue('--nds-box-background')).toBe('var(--nds-component-box-accent-background)');
  });

  it('applies stack layout variables from attributes', () => {
    const element = document.createElement(tags.lightStack);
    element.setAttribute('direction', 'row');
    element.setAttribute('gap', '6');
    element.setAttribute('align', 'center');
    element.setAttribute('justify', 'space-between');
    document.body.append(element);

    expect(element.style.getPropertyValue('--nds-stack-direction')).toBe('row');
    expect(element.style.getPropertyValue('--nds-stack-gap')).toBe('var(--nds-spacing-6)');
    expect(element.style.getPropertyValue('--nds-stack-align')).toBe('center');
    expect(element.style.getPropertyValue('--nds-stack-justify')).toBe('space-between');
  });

  it('renders card with semantic tag selection and elevation state', () => {
    const element = document.createElement(tags.lightCard);
    element.setAttribute('tag', 'section');
    element.setAttribute('elevated', '');
    document.body.append(element);

    const surface = element.querySelector('section.nds-card__surface');

    expect(surface).not.toBeNull();
    expect(element.style.getPropertyValue('--nds-card-shadow')).toBe('var(--nds-shadows-md)');
  });
});
