import type { DomMode } from '../../foundation/base-element.js';
import { stringAttribute } from '../../utils/attributes.js';
import { escapeHtml } from '../../utils/dom.js';
import type { NDSTextElement } from './component.js';

export const renderTextTemplate = (element: NDSTextElement, mode: DomMode): string => {
  const fallbackText = escapeHtml(stringAttribute(element, 'text'));
  const content =
    mode === 'shadow'
      ? `<slot>${fallbackText}</slot>`
      : `<span data-nds-slot-target="default">${fallbackText}</span>`;

  return `<p part="text" class="nds-text__content">${content}</p>`;
};
