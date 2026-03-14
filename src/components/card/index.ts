import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSCardElement } from './component.js';

export { NDSCardElement };

export const defineCard = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSCardElement, options);
