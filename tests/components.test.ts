import { afterEach, describe, expect, it } from 'vitest';

import { NDSButtonElement } from '../src/components/button/component.js';
import { NDSInputElement } from '../src/components/input/component.js';
import { configureComponentClass } from '../src/foundation/component.js';

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
});
