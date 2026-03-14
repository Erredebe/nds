import { afterEach, describe, expect, it } from 'vitest';

import { NDSAlertElement } from '../dist/components/alert/component.js';
import { NDSBadgeElement } from '../dist/components/badge/component.js';
import { NDSBoxElement } from '../dist/components/box/component.js';
import { NDSButtonElement } from '../dist/components/button/component.js';
import { NDSCardElement } from '../dist/components/card/component.js';
import { NDSCheckboxElement } from '../dist/components/checkbox/component.js';
import { NDSDialogElement } from '../dist/components/dialog/component.js';
import { NDSFieldElement } from '../dist/components/field/component.js';
import { NDSHeadingElement } from '../dist/components/heading/component.js';
import { NDSInputElement } from '../dist/components/input/component.js';
import { NDSRadioGroupElement } from '../dist/components/radio-group/component.js';
import { NDSSelectElement } from '../dist/components/select/component.js';
import { NDSStackElement } from '../dist/components/stack/component.js';
import { NDSTextareaElement } from '../dist/components/textarea/component.js';
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
  shadowBadge: 'nds-test-badge-shadow',
  shadowAlert: 'nds-test-alert-shadow',
  lightBox: 'nds-test-box-light',
  shadowButton: 'nds-test-button-shadow',
  lightButton: 'nds-test-button-light',
  lightCard: 'nds-test-card-light',
  lightCheckbox: 'nds-test-checkbox-light',
  shadowCheckbox: 'nds-test-checkbox-shadow',
  shadowDialog: 'nds-test-dialog-shadow',
  lightField: 'nds-test-field-light',
  shadowHeading: 'nds-test-heading-shadow',
  lightInput: 'nds-test-input-light',
  lightRadioGroup: 'nds-test-radio-group-light',
  shadowSelect: 'nds-test-select-shadow',
  shadowInput: 'nds-test-input-shadow',
  lightStack: 'nds-test-stack-light',
  shadowTextarea: 'nds-test-textarea-shadow',
  shadowText: 'nds-test-text-shadow'
} as const;

registerTestElement(NDSAlertElement, tags.lightAlert, 'light');
registerTestElement(NDSAlertElement, tags.shadowAlert, 'shadow');
registerTestElement(NDSBadgeElement, tags.shadowBadge, 'shadow');
registerTestElement(NDSBoxElement, tags.lightBox, 'light');
registerTestElement(NDSButtonElement, tags.lightButton, 'light');
registerTestElement(NDSButtonElement, tags.shadowButton, 'shadow');
registerTestElement(NDSCardElement, tags.lightCard, 'light');
registerTestElement(NDSCheckboxElement, tags.lightCheckbox, 'light');
registerTestElement(NDSCheckboxElement, tags.shadowCheckbox, 'shadow');
registerTestElement(NDSDialogElement, tags.shadowDialog, 'shadow');
registerTestElement(NDSFieldElement, tags.lightField, 'light');
registerTestElement(NDSHeadingElement, tags.shadowHeading, 'shadow');
registerTestElement(NDSInputElement, tags.lightInput, 'light');
registerTestElement(NDSRadioGroupElement, tags.lightRadioGroup, 'light');
registerTestElement(NDSSelectElement, tags.shadowSelect, 'shadow');
registerTestElement(NDSInputElement, tags.shadowInput, 'shadow');
registerTestElement(NDSStackElement, tags.lightStack, 'light');
registerTestElement(NDSTextareaElement, tags.shadowTextarea, 'shadow');
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
    element.setAttribute('name', 'email');
    document.body.append(element);

    const input = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-input__control');
    const fallback = element.querySelector<HTMLInputElement>('input[data-nds-input-fallback="true"]');

    expect(input).not.toBeNull();
    expect(input?.value).toBe('hello@example.com');
    expect(fallback?.value).toBe('hello@example.com');
    expect(fallback?.name).toBe('email');
  });

  it('renders in light dom and syncs user input back to the host property only', () => {
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

    expect((element as NDSInputElement).value).toBe('typed@example.com');
    expect(element.getAttribute('value')).toBeNull();
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

  it('does not reflect or emit password values through host-facing APIs', () => {
    const element = document.createElement(tags.lightInput);
    const received: Array<string | undefined> = [];

    element.setAttribute('type', 'password');
    element.addEventListener('nds-input', (event) => {
      received.push((event as CustomEvent<{ value?: string }>).detail?.value);
    });
    document.body.append(element);

    const input = element.querySelector<HTMLInputElement>('.nds-input__control');

    expect(input).not.toBeNull();

    if (!input) {
      return;
    }

    input.value = 'super-secret';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    expect((element as NDSInputElement).value).toBe('super-secret');
    expect(element.getAttribute('value')).toBeNull();
    expect(received).toEqual([undefined]);
  });

  it('syncs a shadow-dom fallback control for form submit and reset', () => {
    const form = document.createElement('form');
    const element = document.createElement(tags.shadowInput);
    element.setAttribute('label', 'Email');
    element.setAttribute('name', 'email');
    element.setAttribute('value', 'initial@example.com');
    form.append(element);
    document.body.append(form);

    const input = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-input__control');
    const fallback = element.querySelector<HTMLInputElement>('input[data-nds-input-fallback="true"]');

    expect(input).not.toBeNull();
    expect(fallback).not.toBeNull();
    expect(new FormData(form).get('email')).toBe('initial@example.com');

    if (!input || !fallback) {
      return;
    }

    input.value = 'updated@example.com';
    input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    expect(fallback.value).toBe('updated@example.com');
    expect(new FormData(form).get('email')).toBe('updated@example.com');

    form.reset();

    const resetInput = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-input__control');
    const resetFallback = element.querySelector<HTMLInputElement>('input[data-nds-input-fallback="true"]');

    expect(element.getAttribute('value')).toBe('initial@example.com');
    expect(resetInput?.value).toBe('initial@example.com');
    expect(resetFallback?.value).toBe('initial@example.com');
  });
});

describe('accessible form additions', () => {
  it('wires field descriptions to the first slotted control', () => {
    const element = document.createElement(tags.lightField);
    const input = document.createElement('input');

    element.setAttribute('label', 'Project name');
    element.setAttribute('description', 'Visible to your team.');
    input.setAttribute('name', 'projectName');
    element.append(input);
    document.body.append(element);

    const label = element.querySelector<HTMLLabelElement>('.nds-field__label');
    const description = element.querySelector<HTMLElement>('.nds-field__description');

    expect(label?.htmlFor).toBe(input.id);
    expect(input.getAttribute('aria-describedby')).toContain(description?.id ?? '');
  });

  it('syncs textarea value and fallback form control in shadow dom', () => {
    const form = document.createElement('form');
    const element = document.createElement(tags.shadowTextarea);
    element.setAttribute('name', 'notes');
    element.setAttribute('label', 'Notes');
    element.setAttribute('value', 'Initial note');
    form.append(element);
    document.body.append(form);

    const textarea = element.shadowRoot?.querySelector<HTMLTextAreaElement>('.nds-textarea__control');
    const fallback = element.querySelector<HTMLTextAreaElement>('textarea[data-nds-textarea-fallback="true"]');

    expect(textarea?.value).toBe('Initial note');
    expect(fallback?.value).toBe('Initial note');

    textarea!.value = 'Updated note';
    textarea!.dispatchEvent(new Event('input', { bubbles: true, composed: true }));

    expect(new FormData(form).get('notes')).toBe('Updated note');
  });

  it('renders select options and emits host-facing change events', () => {
    const element = document.createElement(tags.shadowSelect);
    let received = 0;

    element.setAttribute('label', 'Status');
    element.setAttribute('options', 'draft:Draft|live:Live');
    element.addEventListener('nds-change', (event) => {
      received += 1;
      expect(event.target).toBe(element);
    });
    document.body.append(element);

    const select = element.shadowRoot?.querySelector<HTMLSelectElement>('.nds-select__control');

    expect(Array.from(select?.options ?? []).map((option) => option.value)).toEqual(['draft', 'live']);

    element.setAttribute('value', 'live');

    const rerenderedSelect = element.shadowRoot?.querySelector<HTMLSelectElement>('.nds-select__control');

    rerenderedSelect!.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(rerenderedSelect?.value).toBe('live');
    expect(received).toBe(1);
  });

  it('syncs checkbox state with host events and form value', () => {
    const form = document.createElement('form');
    const element = document.createElement(tags.shadowCheckbox);
    const received: boolean[] = [];

    element.setAttribute('name', 'terms');
    element.setAttribute('label', 'Accept terms');
    element.addEventListener('nds-change', (event) => {
      received.push((event as CustomEvent<{ checked: boolean }>).detail.checked);
    });
    form.append(element);
    document.body.append(form);

    const input = element.shadowRoot?.querySelector<HTMLInputElement>('.nds-checkbox__control');

    input!.checked = true;
    input!.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(received).toEqual([true]);
    expect(new FormData(form).get('terms')).toBe('on');
  });

  it('submits radio-group selected value through the form', () => {
    const form = document.createElement('form');
    const element = document.createElement(tags.lightRadioGroup);

    element.setAttribute('label', 'Plan');
    element.setAttribute('name', 'plan');
    element.setAttribute('options', 'starter:Starter|pro:Pro');
    form.append(element);
    document.body.append(form);

    const radios = Array.from(element.querySelectorAll<HTMLInputElement>('.nds-radio-group__control'));

    radios[1]!.checked = true;
    radios[1]!.dispatchEvent(new Event('change', { bubbles: true, composed: true }));

    expect(new FormData(form).get('plan')).toBe('pro');
  });
});

describe('status and overlay additions', () => {
  it('renders badge content in shadow dom', () => {
    const element = document.createElement(tags.shadowBadge);
    element.setAttribute('tone', 'success');
    element.setAttribute('text', 'Shipped');
    document.body.append(element);

    expect(element.shadowRoot?.querySelector('.nds-badge__root')?.textContent).toContain('Shipped');
  });

  it('opens and closes dialog through host state', () => {
    const element = document.createElement(tags.shadowDialog);
    const events: string[] = [];

    element.setAttribute('title', 'Delete project');
    element.setAttribute('description', 'This action cannot be undone.');
    element.addEventListener('nds-open', () => events.push('open'));
    element.addEventListener('nds-close', () => events.push('close'));
    document.body.append(element);

    element.setAttribute('open', '');

    const dialog = element.shadowRoot?.querySelector<HTMLDialogElement>('.nds-dialog__root');
    const dismiss = element.shadowRoot?.querySelector<HTMLButtonElement>('.nds-dialog__dismiss');

    expect(dialog?.getAttribute('aria-labelledby')).toBeTruthy();
    expect(dialog?.open || dialog?.hasAttribute('open')).toBe(true);

    dismiss?.click();

    expect(events).toContain('open');
    expect(events).toContain('close');
    expect(element.hasAttribute('open')).toBe(false);
  });
});

describe('nds-alert', () => {
  it('renders message text and trackBy keys in shadow dom', () => {
    const element = document.createElement(tags.shadowAlert);
    element.setAttribute('title', 'Deploy notice');
    element.setAttribute('message', 'Heads up before release.');
    element.setAttribute('features', 'Preview build|Smoke tests|Rollback plan');
    document.body.append(element);

    const root = element.shadowRoot;
    const features = Array.from(root?.querySelectorAll<HTMLLIElement>('.nds-alert__feature') ?? []);

    expect(root?.querySelector('.nds-alert__message')?.textContent).toContain('Heads up before release.');
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
