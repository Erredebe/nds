import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSDialogElement } from './component.js';

export { NDSDialogElement };

export const defineDialog = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSDialogElement, options);
