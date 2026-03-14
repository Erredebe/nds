import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSAlertElement } from './component.js';

export { NDSAlertElement };

export const defineAlert = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSAlertElement, options);
