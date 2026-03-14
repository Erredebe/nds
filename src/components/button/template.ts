import type { DomMode } from '../../foundation/base-element.js';
import { booleanAttribute, enumAttribute, stringAttribute } from '../../utils/attributes.js';
import { escapeHtml } from '../../utils/dom.js';
import type { NDSButtonElement } from './component.js';

const buttonTypes = ['button', 'submit', 'reset'] as const;

export const renderButtonTemplate = (element: NDSButtonElement, mode: DomMode): string => {
  const disabled = booleanAttribute(element.getAttribute('disabled'));
  const type = enumAttribute(element, 'type', buttonTypes, 'button');
  const fallbackLabel = escapeHtml(stringAttribute(element, 'label', 'Button'));
  const content =
    mode === 'shadow'
      ? `<span part="label" class="nds-button__label"><slot>${fallbackLabel}</slot></span>`
      : `<span part="label" class="nds-button__label" data-nds-slot-target="default">${fallbackLabel}</span>`;

  return `
    <span class="nds-button__root">
      <button part="control" class="nds-button__control" type="${type}"${disabled ? ' disabled' : ''}>
        ${content}
      </button>
    </span>
  `.trim();
};
