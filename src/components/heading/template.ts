import type { DomMode } from '../../foundation/base-element.js';
import { stringAttribute } from '../../utils/attributes.js';
import { escapeHtml } from '../../utils/dom.js';
import type { NDSHeadingElement } from './component.js';

const headingLevels = new Set(['1', '2', '3', '4', '5', '6']);

const resolveHeadingTag = (value: string | null): `h${1 | 2 | 3 | 4 | 5 | 6}` =>
  headingLevels.has(value ?? '') ? (`h${value}` as `h${1 | 2 | 3 | 4 | 5 | 6}`) : 'h2';

export const renderHeadingTemplate = (element: NDSHeadingElement, mode: DomMode): string => {
  const fallbackText = escapeHtml(stringAttribute(element, 'text'));
  const tagName = resolveHeadingTag(element.getAttribute('level'));
  const content =
    mode === 'shadow'
      ? `<slot>${fallbackText}</slot>`
      : `<span data-nds-slot-target="default">${fallbackText}</span>`;

  return `<${tagName} part="heading" class="nds-heading__content">${content}</${tagName}>`;
};
