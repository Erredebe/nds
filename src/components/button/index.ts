import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSButtonElement } from './component.js';

export { NDSButtonElement };

export const defineButton = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSButtonElement, options);
