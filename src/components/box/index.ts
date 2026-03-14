import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSBoxElement } from './component.js';

export { NDSBoxElement };

export const defineBox = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSBoxElement, options);
