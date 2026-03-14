import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSSelectElement } from './component.js';

export { NDSSelectElement };

export const defineSelect = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSSelectElement, options);
