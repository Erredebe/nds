import type { DomMode } from '../../foundation/base-element.js';
import type { NDSCardElement } from './component.js';

export const renderCardTemplate = (_element: NDSCardElement, mode: DomMode): string => {
  const content =
    mode === 'shadow'
      ? '<slot></slot>'
      : '<div part="content" class="nds-card__content" data-nds-slot-target="default"></div>';

  return `
    <article part="surface" class="nds-card__surface">
      ${content}
    </article>
  `.trim();
};
