import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { enumAttribute } from '../../utils/attributes.js';
import { resolveRadiusValue, resolveSpaceValue } from '../../utils/style-values.js';
import { boxShadowStyles } from './styles.js';
import { renderBoxTemplate } from './template.js';

const boxSurfaces = ['accent', 'subtle', 'transparent'] as const;

const applyBoxStyles = (element: NDSBoxElement): void => {
  element.style.setProperty('--nds-box-padding', resolveSpaceValue(element.getAttribute('padding')));
  element.style.setProperty('--nds-box-radius', resolveRadiusValue(element.getAttribute('radius')));

  const surface = enumAttribute(element, 'surface', boxSurfaces, 'transparent');

  if (surface === 'subtle') {
    element.style.setProperty('--nds-box-background', 'var(--nds-component-box-subtle-background)');
    element.style.setProperty('--nds-box-border', '1px solid var(--nds-color-border)');
    return;
  }

  if (surface === 'accent') {
    element.style.setProperty('--nds-box-background', 'var(--nds-component-box-accent-background)');
    element.style.setProperty('--nds-box-border', '1px solid var(--nds-color-accent)');
    return;
  }

  element.style.setProperty('--nds-box-background', 'transparent');
  element.style.setProperty('--nds-box-border', '0 solid transparent');
};

export class NDSBoxElement extends NDSComponentElement {
  static definition: NDSComponentDefinition<NDSBoxElement> = {
    tagName: 'nds-box',
    observedAttributes: ['padding', 'radius', 'surface'],
    shadowStyles: boxShadowStyles,
    defaultDomMode: 'shadow',
    renderTemplate: renderBoxTemplate,
    afterRender: applyBoxStyles
  };
}
