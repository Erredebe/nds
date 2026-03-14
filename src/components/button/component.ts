import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { stringAttribute } from '../../utils/attributes.js';
import { buttonShadowStyles } from './styles.js';
import { renderButtonTemplate } from './template.js';

export class NDSButtonElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSButtonElement> = {
    tagName: 'nds-button',
    observedAttributes: ['disabled', 'label', 'size', 'type', 'variant'],
    shadowStyles: buttonShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderButtonTemplate,
    getDefaultSlotFallbackText: (element) => stringAttribute(element, 'label', 'Button')
  };
}
