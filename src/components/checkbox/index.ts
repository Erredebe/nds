import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSCheckboxElement } from './component.js';

export { NDSCheckboxElement };

export const defineCheckbox = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSCheckboxElement, options);
