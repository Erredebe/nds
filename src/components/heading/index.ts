import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSHeadingElement } from './component.js';

export { NDSHeadingElement };

export const defineHeading = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSHeadingElement, options);
