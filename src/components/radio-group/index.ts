import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSRadioGroupElement } from './component.js';

export { NDSRadioGroupElement };

export const defineRadioGroup = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSRadioGroupElement, options);
