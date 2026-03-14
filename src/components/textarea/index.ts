import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSTextareaElement } from './component.js';

export { NDSTextareaElement };

export const defineTextarea = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSTextareaElement, options);
