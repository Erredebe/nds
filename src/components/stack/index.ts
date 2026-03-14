import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSStackElement } from './component.js';

export { NDSStackElement };

export const defineStack = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSStackElement, options);
