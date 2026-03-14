import { NDSBaseElement, type DomMode } from './base-element.js';
import type { CompiledTemplateDefinition } from './template.js';
import { collectReusableNodes, renderTemplate } from './template.js';

export interface NDSPropDefinition {
  attribute?: string;
  propertyKey: string;
  reflect: boolean;
  type: 'boolean' | 'string';
}

export interface NDSComponentDefinition<T extends HTMLElement = NDSComponentElement> {
  tagName: string;
  observedAttributes: string[];
  shadowStyles: string;
  defaultDomMode: DomMode;
  stylePath?: string;
  templatePath?: string;
  template: CompiledTemplateDefinition;
  afterRender?: (element: T) => void;
}

export interface NDSComponentClass<T extends NDSComponentElement = NDSComponentElement>
  extends CustomElementConstructor {
  new (...args: any[]): T;
  definition: NDSComponentDefinition<T>;
  domMode: DomMode;
  shadowStyles: string;
  observedAttributes: string[];
  propDefinitions?: readonly NDSPropDefinition[];
  watchers?: Readonly<Record<string, readonly string[]>>;
}

const emptyTemplate: CompiledTemplateDefinition = {
  sourcePath: 'inline',
  tagName: 'nds-component',
  nodes: []
};

export class NDSComponentElement extends NDSBaseElement {
  static definition: NDSComponentDefinition<any> = {
    tagName: 'nds-component',
    observedAttributes: [],
    shadowStyles: '',
    defaultDomMode: 'shadow',
    template: emptyTemplate
  };

  static propDefinitions: readonly NDSPropDefinition[] = [];
  static watchers: Readonly<Record<string, readonly string[]>> = {};

  #isApplyingAttribute = new Set<string>();
  #isRendering = false;
  #needsRender = false;
  #refs: Record<string, Element> = {};
  #syncedInitialAttributes = false;

  public get refs(): Record<string, Element> {
    return this.#refs;
  }

  protected get definition(): NDSComponentDefinition<this> {
    return (this.constructor as NDSComponentClass<this>).definition;
  }

  protected rendered(): void {}

  protected emit<T>(
    type: string,
    detail?: T,
    options: Omit<CustomEventInit<T>, 'detail'> = {}
  ): boolean {
    return this.dispatchEvent(
      new CustomEvent(type, {
        bubbles: true,
        cancelable: false,
        composed: true,
        ...options,
        detail
      })
    );
  }

  connectedCallback(): void {
    this.syncInitialAttributes();
    this.requestUpdate();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue || this.#isApplyingAttribute.has(name)) {
      return;
    }

    const definition = (this.constructor as NDSComponentClass<this>).propDefinitions?.find(
      (entry) => entry.attribute === name
    );

    if (!definition) {
      return;
    }

    this.#isApplyingAttribute.add(name);

    try {
      (this as Record<string, unknown>)[definition.propertyKey] =
        definition.type === 'boolean' ? newValue !== null && newValue !== 'false' : newValue;
    } finally {
      this.#isApplyingAttribute.delete(name);
    }
  }

  protected requestUpdate(): void {
    if (!this.isConnected) {
      return;
    }

    if (this.#isRendering) {
      this.#needsRender = true;
      return;
    }

    this.performRender();
  }

  public notifyReactivePropertyChange(propertyKey: string, previousValue: unknown, nextValue: unknown): void {
    if (Object.is(previousValue, nextValue)) {
      return;
    }

    const watcherNames = (this.constructor as NDSComponentClass<this>).watchers?.[propertyKey] ?? [];

    for (const watcherName of watcherNames) {
      const watcher = this[watcherName as keyof this];

      if (typeof watcher === 'function') {
        watcher.call(this, nextValue, previousValue);
      }
    }

    this.requestUpdate();
  }

  public syncReactiveAttribute(attribute: string, reflect: boolean, value: unknown): void {
    if (!reflect || this.#isApplyingAttribute.has(attribute)) {
      return;
    }

    this.#isApplyingAttribute.add(attribute);

    try {
      if (typeof value === 'boolean') {
        if (value) {
          this.setAttribute(attribute, '');
        } else {
          this.removeAttribute(attribute);
        }

        return;
      }

      if (value === null || value === undefined) {
        this.removeAttribute(attribute);
        return;
      }

      this.setAttribute(attribute, String(value));
    } finally {
      this.#isApplyingAttribute.delete(attribute);
    }
  }

  private performRender(): void {
    this.#isRendering = true;

    try {
      const focusSnapshot = this.captureFocusSnapshot();
      const projectedNodes = this.domMode === 'light' ? this.collectLightDomSlotNodes() : [];
      const reusePool = collectReusableNodes(this.renderRoot);
      const { fragment, refs } = renderTemplate(
        this as unknown as HTMLElement & Record<string, unknown> & { refs: Record<string, Element> },
        this.definition.template,
        this.domMode,
        projectedNodes,
        reusePool
      );

      this.mountManagedFragment(fragment);
      this.#refs = refs;
      this.restoreFocusSnapshot(focusSnapshot, refs);
      this.rendered();
      this.definition.afterRender?.(this);
    } finally {
      this.#isRendering = false;
    }

    if (this.#needsRender) {
      this.#needsRender = false;
      this.performRender();
    }
  }

  private syncInitialAttributes(): void {
    if (this.#syncedInitialAttributes) {
      return;
    }

    this.#syncedInitialAttributes = true;

    for (const definition of (this.constructor as NDSComponentClass<this>).propDefinitions ?? []) {
      if (!definition.attribute || !this.hasAttribute(definition.attribute)) {
        continue;
      }

      this.attributeChangedCallback(definition.attribute, null, this.getAttribute(definition.attribute));
    }
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
  ConfiguredComponentClass.propDefinitions = componentClass.propDefinitions ?? [];
  ConfiguredComponentClass.watchers = componentClass.watchers ?? {};

  const nextByMode = existingByMode ?? new Map<DomMode, NDSComponentClass<any>>();
  nextByMode.set(domMode, ConfiguredComponentClass as unknown as NDSComponentClass<any>);
  configuredComponentClassCache.set(componentClass, nextByMode);

  return ConfiguredComponentClass as T;
};
