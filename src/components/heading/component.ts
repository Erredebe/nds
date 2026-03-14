import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { stringAttribute } from '../../utils/attributes.js';
import { headingShadowStyles } from './styles.js';
import { renderHeadingTemplate } from './template.js';

export class NDSHeadingElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSHeadingElement> = {
    tagName: 'nds-heading',
    observedAttributes: ['align', 'level', 'text'],
    shadowStyles: headingShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderHeadingTemplate,
    getDefaultSlotFallbackText: (element) => stringAttribute(element, 'text')
  };
}
