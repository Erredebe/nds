import { afterEach, describe, expect, it } from 'vitest';

import { NDSAlertElement } from '../dist/components/alert/component.js';
import { NDSButtonElement } from '../dist/components/button/component.js';
import { NDSCardElement } from '../dist/components/card/component.js';
import { NDSInputElement } from '../dist/components/input/component.js';
import { NDSTextElement } from '../dist/components/text/component.js';
import { configureComponentClass } from '../dist/foundation/component.js';

const lightAlertTag = 'nds-test-alert-light';
const shadowAlertTag = 'nds-test-alert-shadow';
const lightButtonTag = 'nds-test-button-light';
const shadowButtonTag = 'nds-test-button-shadow';
const lightCardTag = 'nds-test-card-light';
const lightInputTag = 'nds-test-input-light';
const shadowInputTag = 'nds-test-input-shadow';
const shadowTextTag = 'nds-test-text-shadow';

if (!customElements.get(lightAlertTag)) {
  class LightAlertTestElement extends configureComponentClass(NDSAlertElement, 'light') {}
  customElements.define(lightAlertTag, LightAlertTestElement);
}

if (!customElements.get(shadowAlertTag)) {
  class ShadowAlertTestElement extends configureComponentClass(NDSAlertElement, 'shadow') {}
  customElements.define(shadowAlertTag, ShadowAlertTestElement);
}

if (!customElements.get(lightButtonTag)) {
  class LightButtonTestElement extends configureComponentClass(NDSButtonElement, 'light') {}
  customElements.define(lightButtonTag, LightButtonTestElement);
}

if (!customElements.get(shadowButtonTag)) {
  class ShadowButtonTestElement extends configureComponentClass(NDSButtonElement, 'shadow') {}
  customElements.define(shadowButtonTag, ShadowButtonTestElement);
}

if (!customElements.get(lightCardTag)) {
  class LightCardTestElement extends configureComponentClass(NDSCardElement, 'light') {}
  customElements.define(lightCardTag, LightCardTestElement);
}

if (!customElements.get(lightInputTag)) {
  class LightInputTestElement extends configureComponentClass(NDSInputElement, 'light') {}
  customElements.define(lightInputTag, LightInputTestElement);
}

if (!customElements.get(shadowInputTag)) {
  class ShadowInputTestElement extends configureComponentClass(NDSInputElement, 'shadow') {}
  customElements.define(shadowInputTag, ShadowInputTestElement);
}

if (!customElements.get(shadowTextTag)) {
  class ShadowTextTestElement extends configureComponentClass(NDSTextElement, 'shadow') {}
  customElements.define(shadowTextTag, ShadowTextTestElement);
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

  it('forwards aria and form attributes to the native button', () => {
    const element = document.createElement(lightButtonTag);
    element.setAttribute('aria-label', 'Close dialog');
    element.setAttribute('name', 'intent');
    element.setAttribute('value', 'close');
    document.body.append(element);

    const button = element.querySelector<HTMLButtonElement>('.nds-button__control');

    expect(button?.getAttribute('aria-label')).toBe('Close dialog');
    expect(button?.name).toBe('intent');
    expect(button?.value).toBe('close');
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

  it('proxies submit actions when rendered in shadow dom', () => {
    const form = document.createElement('form');
    const element = document.createElement(shadowButtonTag);
    let submitCalls = 0;

    element.setAttribute('type', 'submit');
    form.requestSubmit = () => {
      submitCalls += 1;
    };

    form.append(element);
    document.body.append(form);
    element.shadowRoot?.querySelector<HTMLButtonElement>('.nds-button__control')?.click();

    expect(submitCalls).toBe(1);
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

  it('associates an explicit label with the native input', () => {
    const element = document.createElement(lightInputTag);
    element.setAttribute('label', 'Email');
    document.body.append(element);

    const label = element.querySelector<HTMLLabelElement>('.nds-input__label');
    const input = element.querySelector<HTMLInputElement>('.nds-input__control');

    expect(label).not.toBeNull();
    expect(input).not.toBeNull();
    expect(label?.getAttribute('for')).toBe(input?.id ?? null);
  });

  it('forwards native and aria state to the input control', () => {
    const element = document.createElement(lightInputTag);
    element.setAttribute('aria-describedby', 'email-help');
    element.setAttribute('aria-errormessage', 'email-error');
    element.setAttribute('aria-label', 'Email address');
    element.setAttribute('invalid', '');
    element.setAttribute('readonly', '');
    element.setAttribute('required', '');
    document.body.append(element);

    const input = element.querySelector<HTMLInputElement>('.nds-input__control');

    expect(input?.getAttribute('aria-describedby')).toBe('email-help');
    expect(input?.getAttribute('aria-errormessage')).toBe('email-error');
    expect(input?.getAttribute('aria-label')).toBe('Email address');
    expect(input?.getAttribute('aria-invalid')).toBe('true');
    expect(input?.readOnly).toBe(true);
    expect(input?.required).toBe(true);
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

describe('nds-text', () => {
  it('renders a neutral span by default', () => {
    const element = document.createElement(shadowTextTag);
    element.setAttribute('text', 'Helper copy');
    document.body.append(element);

    const content = element.shadowRoot?.querySelector('.nds-text__content');

    expect(content?.tagName).toBe('SPAN');
    expect(content?.textContent).toContain('Helper copy');
  });

  it('renders the requested semantic tag', () => {
    const element = document.createElement(shadowTextTag);
    element.setAttribute('tag', 'p');
    element.setAttribute('text', 'Paragraph copy');
    document.body.append(element);

    expect(element.shadowRoot?.querySelector('.nds-text__content')?.tagName).toBe('P');
  });
});

describe('nds-card', () => {
  it('renders a neutral div by default', () => {
    const element = document.createElement(lightCardTag);
    document.body.append(element);

    expect(element.querySelector('.nds-card__surface')?.tagName).toBe('DIV');
  });

  it('renders an article only when requested', () => {
    const element = document.createElement(lightCardTag);
    element.setAttribute('tag', 'article');
    document.body.append(element);

    expect(element.querySelector('.nds-card__surface')?.tagName).toBe('ARTICLE');
  });
});

describe('nds-alert', () => {
  it('renders trusted [innerHTML] content and trackBy keys in shadow dom', () => {
    const element = document.createElement(shadowAlertTag);
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
    const element = document.createElement(shadowAlertTag);
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
    const element = document.createElement(lightAlertTag);
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
