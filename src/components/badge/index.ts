import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { NDSBadgeElement } from './component.js';

export { NDSBadgeElement };

export const defineBadge = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(NDSBadgeElement, options);
