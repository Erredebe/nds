import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { booleanAttribute } from '../../utils/attributes.js';
import { resolveShadowValue, resolveSpaceValue } from '../../utils/style-values.js';
import { cardShadowStyles } from './styles.js';
import { renderCardTemplate } from './template.js';

const applyCardStyles = (element: NDSCardElement): void => {
  element.style.setProperty(
    '--nds-card-padding',
    resolveSpaceValue(element.getAttribute('padding'), 'var(--nds-spacing-5)')
  );
  element.style.setProperty(
    '--nds-card-shadow',
    booleanAttribute(element.getAttribute('elevated')) ? resolveShadowValue('md') : resolveShadowValue('sm')
  );
};

export class NDSCardElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSCardElement> = {
    tagName: 'nds-card',
    observedAttributes: ['elevated', 'padding'],
    shadowStyles: cardShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderCardTemplate,
    afterRender: applyCardStyles
  };
}
