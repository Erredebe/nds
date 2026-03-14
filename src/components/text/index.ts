import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSTextElement } from './component.js';

export { NDSTextElement };

export const defineText = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSTextElement, options);
