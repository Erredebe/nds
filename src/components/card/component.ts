import { type DomMode, NDSComponentElement, attr, component } from '../../foundation/index.js';
import { resolveShadowValue, resolveSpaceValue } from '../../utils/style-values.js';

const applyCardStyles = (element: NDSCardElement): void => {
  element.style.setProperty('--nds-card-padding', resolveSpaceValue(element.padding || null, 'var(--nds-spacing-5)'));
  element.style.setProperty(
    '--nds-card-shadow',
    element.elevated ? resolveShadowValue('md') : resolveShadowValue('sm')
  );
};

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: 'nds-card'
})
export class NDSCardElement extends NDSComponentElement {
  @attr.boolean() accessor elevated = false;
  @attr.string() accessor padding = '';

  protected override renderTemplate(mode: DomMode): string {
    const content =
      mode === 'shadow'
        ? '<slot></slot>'
        : '<div part="content" class="nds-card__content" data-nds-slot-target="default"></div>';

    return `
      <article part="surface" class="nds-card__surface">
        ${content}
      </article>
    `.trim();
  }

  protected override rendered(): void {
    applyCardStyles(this);
  }
}
