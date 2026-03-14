import { NDSComponentElement, component, prop } from '../../foundation/index.js';
import { resolveShadowValue, resolveSpaceValue } from '../../utils/style-values.js';

const cardTags = ['div', 'article', 'section', 'aside'] as const;

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
  tagName: 'nds-card',
  templatePath: './template.html'
})
export class NDSCardElement extends NDSComponentElement {
  @prop({ reflect: true, type: Boolean }) accessor elevated = false;
  @prop({ reflect: true }) accessor padding = '';
  @prop({ reflect: true, values: cardTags }) accessor tag: (typeof cardTags)[number] = 'div';

  protected override rendered(): void {
    applyCardStyles(this);
  }
}
