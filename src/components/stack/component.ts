import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { enumAttribute } from '../../utils/attributes.js';
import { resolveSpaceValue } from '../../utils/style-values.js';
import { stackShadowStyles } from './styles.js';
import { renderStackTemplate } from './template.js';

const stackAlignments = ['baseline', 'center', 'end', 'start', 'stretch'] as const;
const stackDirections = ['column', 'row'] as const;
const stackJustifyValues = ['center', 'end', 'space-around', 'space-between', 'start'] as const;

const toFlexAlignment = (value: string): string => {
  if (value === 'start') {
    return 'flex-start';
  }

  if (value === 'end') {
    return 'flex-end';
  }

  return value;
};

const applyStackStyles = (element: NDSStackElement): void => {
  element.style.setProperty('--nds-stack-gap', resolveSpaceValue(element.getAttribute('gap'), 'var(--nds-spacing-3)'));
  element.style.setProperty(
    '--nds-stack-direction',
    enumAttribute(element, 'direction', stackDirections, 'column')
  );
  element.style.setProperty(
    '--nds-stack-align',
    toFlexAlignment(enumAttribute(element, 'align', stackAlignments, 'stretch'))
  );
  element.style.setProperty(
    '--nds-stack-justify',
    toFlexAlignment(enumAttribute(element, 'justify', stackJustifyValues, 'start'))
  );
};

export class NDSStackElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSStackElement> = {
    tagName: 'nds-stack',
    observedAttributes: ['align', 'direction', 'gap', 'justify'],
    shadowStyles: stackShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderStackTemplate,
    afterRender: applyStackStyles
  };
}
