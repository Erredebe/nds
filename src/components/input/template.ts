import type { DomMode } from '../../foundation/base-element.js';
import { booleanAttribute, enumAttribute, stringAttribute } from '../../utils/attributes.js';
import { escapeHtml } from '../../utils/dom.js';
import type { NDSInputElement } from './component.js';

const inputTypes = ['email', 'number', 'password', 'search', 'tel', 'text', 'url'] as const;

export const renderInputTemplate = (element: NDSInputElement, _mode: DomMode): string => {
  const disabled = booleanAttribute(element.getAttribute('disabled'));
  const label = escapeHtml(stringAttribute(element, 'label', 'Field'));
  const name = escapeHtml(stringAttribute(element, 'name'));
  const placeholder = escapeHtml(stringAttribute(element, 'placeholder'));
  const type = enumAttribute(element, 'type', inputTypes, 'text');
  const value = escapeHtml(element.value);

  return `
    <div class="nds-input__root">
      <label part="field" class="nds-input__field">
        <span part="label" class="nds-input__label">${label}</span>
        <input
          part="input"
          class="nds-input__control"
          type="${type}"
          value="${value}"
          placeholder="${placeholder}"
          name="${name}"
          ${disabled ? 'disabled' : ''}
        />
      </label>
    </div>
  `.trim();
};
