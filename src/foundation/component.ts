import { NDSBaseElement, type DomMode } from './base-element.js';

export interface NDSComponentDefinition<T extends HTMLElement = NDSComponentElement> {
  tagName: string;
  observedAttributes: string[];
  shadowStyles: string;
  defaultDomMode: DomMode;
  renderTemplate: (element: T, mode: DomMode) => string;
  getDefaultSlotFallbackText?: (element: T) => string;
  afterRender?: (element: T) => void;
}

export interface NDSComponentClass<T extends NDSComponentElement = NDSComponentElement>
  extends CustomElementConstructor {
  new (...args: any[]): T;
  definition: NDSComponentDefinition<T>;
  domMode: DomMode;
  shadowStyles: string;
  observedAttributes: string[];
}

export class NDSComponentElement extends NDSBaseElement {
  static definition: NDSComponentDefinition<any> = {
    tagName: 'nds-component',
    observedAttributes: [],
    shadowStyles: '',
    defaultDomMode: 'shadow',
    renderTemplate: () => ''
  };

  protected get definition(): NDSComponentDefinition<this> {
    const componentClass = this.constructor as NDSComponentClass<this>;

    return componentClass.definition;
  }

  protected override renderShadowTemplate(): string {
    return this.definition.renderTemplate(this, 'shadow');
  }

  protected override renderLightTemplate(): string {
    return this.definition.renderTemplate(this, 'light');
  }

  protected override getDefaultSlotFallbackText(): string {
    return this.definition.getDefaultSlotFallbackText?.(this) ?? '';
  }

  protected override afterRender(): void {
    this.definition.afterRender?.(this);
  }
}

const configuredComponentClassCache = new WeakMap<
  NDSComponentClass<any>,
  Map<DomMode, NDSComponentClass<any>>
>();

export const configureComponentClass = <T extends NDSComponentClass<any>>(
  componentClass: T,
  domMode: DomMode
): T => {
  const existingByMode = configuredComponentClassCache.get(componentClass);

  if (existingByMode?.has(domMode)) {
    return existingByMode.get(domMode) as T;
  }

  const definition = componentClass.definition;
  const baseClass = componentClass as unknown as typeof NDSComponentElement;

  class ConfiguredComponentClass extends baseClass {}

  ConfiguredComponentClass.domMode = domMode;
  ConfiguredComponentClass.shadowStyles = definition.shadowStyles;
  ConfiguredComponentClass.observedAttributes = definition.observedAttributes;

  const nextByMode = existingByMode ?? new Map<DomMode, NDSComponentClass<any>>();
  nextByMode.set(domMode, ConfiguredComponentClass as unknown as NDSComponentClass<any>);
  configuredComponentClassCache.set(componentClass, nextByMode);

  return ConfiguredComponentClass as T;
};
