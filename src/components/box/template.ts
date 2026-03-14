import type { DomMode } from '../../foundation/base-element.js';
import type { NDSBoxElement } from './component.js';

export const renderBoxTemplate = (_element: NDSBoxElement, mode: DomMode): string => {
  const content =
    mode === 'shadow'
      ? '<slot></slot>'
      : '<div part="content" class="nds-box__content" data-nds-slot-target="default"></div>';

  return `
    <div part="container" class="nds-box__container">
      ${content}
    </div>
  `.trim();
};
