import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { stringAttribute } from '../../utils/attributes.js';
import { textShadowStyles } from './styles.js';
import { renderTextTemplate } from './template.js';

export class NDSTextElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSTextElement> = {
    tagName: 'nds-text',
    observedAttributes: ['align', 'text', 'variant', 'weight'],
    shadowStyles: textShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderTextTemplate,
    getDefaultSlotFallbackText: (element) => stringAttribute(element, 'text')
  };
}
