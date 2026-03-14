import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSFieldElement } from './component.js';

export { NDSFieldElement };

export const defineField = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSFieldElement, options);
