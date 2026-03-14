import type { DomMode } from '../../foundation/base-element.js';
import type { NDSStackElement } from './component.js';

export const renderStackTemplate = (_element: NDSStackElement, mode: DomMode): string => {
  const content =
    mode === 'shadow'
      ? '<slot></slot>'
      : '<div part="content" class="nds-stack__content" data-nds-slot-target="default"></div>';

  return `
    <div part="container" class="nds-stack__container">
      ${content}
    </div>
  `.trim();
};
