import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSInputElement } from './component.js';

export { NDSInputElement };

export const defineInput = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSInputElement, options);
