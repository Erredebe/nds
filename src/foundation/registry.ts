import type { DomMode } from './base-element.js';
import { configureComponentClass, type NDSComponentClass } from './component.js';

export interface DefineComponentOptions {
  dom?: DomMode;
}

export const normalizeDomMode = (mode?: DomMode): DomMode => mode ?? 'shadow';

export const defineComponent = <T extends NDSComponentClass<any>>(
  componentClass: T,
  options: DefineComponentOptions = {}
): CustomElementConstructor => {
  const definition = componentClass.definition;
  const domMode = normalizeDomMode(options.dom ?? definition.defaultDomMode);
  const existingDefinition = customElements.get(definition.tagName);

  if (existingDefinition) {
    return existingDefinition;
  }

  const configuredClass = configureComponentClass(componentClass, domMode);
  customElements.define(definition.tagName, configuredClass);
  return configuredClass;
};
