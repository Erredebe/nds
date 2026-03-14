import { afterEach, describe, expect, it } from 'vitest';

import { NDSButtonElement } from '../dist/components/button/component.js';
import { NDSInputElement } from '../dist/components/input/component.js';
import { configureComponentClass } from '../dist/foundation/component.js';

const lightButtonTag = 'nds-test-button-light';
const shadowButtonTag = 'nds-test-button-shadow';
const lightInputTag = 'nds-test-input-light';
const shadowInputTag = 'nds-test-input-shadow';

if (!customElements.get(lightButtonTag)) {
  class LightButtonTestElement extends configureComponentClass(NDSButtonElement, 'light') {}
  customElements.define(lightButtonTag, LightButtonTestElement);
}

if (!customElements.get(shadowButtonTag)) {
  class ShadowButtonTestElement extends configureComponentClass(NDSButtonElement, 'shadow') {}
  customElements.define(shadowButtonTag, ShadowButtonTestElement);
}

if (!customElements.get(lightInputTag)) {
  class LightInputTestElement extends configureComponentClass(NDSInputElement, 'light') {}
  customElements.define(lightInputTag, LightInputTestElement);
}

if (!customElements.get(shadowInputTag)) {
  class ShadowInputTestElement extends configureComponentClass(NDSInputElement, 'shadow') {}
  customElements.define(shadowInputTag, ShadowInputTestElement);
}

afterEach(() => {
  document.body.replaceChildren();
});

describe('nds-button', () => {
  it('renders with shadow dom when configured', () => {
    const element = document.createElement(shadowButtonTag);
    element.setAttribute('label', 'Primary action');
    document.body.append(element);

    expect(element.shadowRoot).not.toBeNull();
    expect(element.shadowRoot?.querySelector('.nds-button__control')).not.toBeNull();
    expect(element.shadowRoot?.textContent).toContain('Primary action');
  });

  it('renders into the host when configured for light dom', () => {
    const element = document.createElement(lightButtonTag);
    element.setAttribute('label', 'Ghost action');
    document.body.append(element);

    expect(element.shadowRoot).toBeNull();
    expect(element.querySelector('.nds-button__control')).not.toBeNull();
    expect(element.textContent).toContain('Ghost action');
  });

  it('emits nds-click from the host and survives rerenders', () => {
    const element = document.createElement(shadowButtonTag);
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
    const element = document.createElement(shadowInputTag);
    element.setAttribute('label', 'Email');
    element.setAttribute('value', 'hello@example.com');
    document.body.append(element);

    const input = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-input__control');

    expect(input).not.toBeNull();
    expect(input?.value).toBe('hello@example.com');
  });

  it('renders in light dom and syncs user input back to the host attribute', () => {
    const element = document.createElement(lightInputTag);
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

  it('emits nds-input and nds-change with the host as target', () => {
    const element = document.createElement(lightInputTag);
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
