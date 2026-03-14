import { NDSBaseElement, type DomMode } from './base-element.js';

export interface NDSComponentDefinition<T extends HTMLElement = NDSComponentElement> {
  tagName: string;
  observedAttributes: string[];
  shadowStyles: string;
  defaultDomMode: DomMode;
  stylePath?: string;
  renderTemplate: (element: T, mode: DomMode) => string;
  getDefaultSlotFallbackText?: (element: T) => string;
  afterRender?: (element: T) => void;
}

export interface NDSListenerDefinition {
  eventName: string;
  methodName: string;
  selector?: string;
  target: 'host' | 'renderRoot';
}

export interface NDSComponentClass<T extends NDSComponentElement = NDSComponentElement>
  extends CustomElementConstructor {
  new (...args: any[]): T;
  definition: NDSComponentDefinition<T>;
  listeners?: readonly NDSListenerDefinition[];
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

  #listenerCleanup = new Map<EventTarget, Array<{ eventName: string; handler: EventListener }>>();

  protected get definition(): NDSComponentDefinition<this> {
    const componentClass = this.constructor as NDSComponentClass<this>;

    return componentClass.definition;
  }

  protected renderTemplate(_mode: DomMode): string {
    return '';
  }

  protected defaultSlotFallbackText(): string {
    return '';
  }

  protected rendered(): void {}

  protected get renderRoot(): ShadowRoot | this {
    return (this.shadowRoot ?? this) as ShadowRoot | this;
  }

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
    this.rebindDeclaredListeners();
    this.definition.afterRender?.(this);
  }

  disconnectedCallback(): void {
    this.removeDeclaredListeners();
  }

  private rebindDeclaredListeners(): void {
    this.removeDeclaredListeners();

    const componentClass = this.constructor as NDSComponentClass<this>;
    const listeners = componentClass.listeners ?? [];

    for (const definition of listeners) {
      const handler = ((event: Event) => {
        const method = this[definition.methodName as keyof this];

        if (typeof method === 'function') {
          method.call(this, event);
        }
      }) as EventListener;

      const targets = this.resolveListenerTargets(definition);

      for (const target of targets) {
        target.addEventListener(definition.eventName, handler);
        const registeredHandlers = this.#listenerCleanup.get(target) ?? [];
        registeredHandlers.push({ eventName: definition.eventName, handler });
        this.#listenerCleanup.set(target, registeredHandlers);
      }
    }
  }

  private removeDeclaredListeners(): void {
    for (const [target, handlers] of this.#listenerCleanup.entries()) {
      for (const { eventName, handler } of handlers) {
        target.removeEventListener(eventName, handler);
      }
    }

    this.#listenerCleanup.clear();
  }

  private resolveListenerTargets(definition: NDSListenerDefinition): EventTarget[] {
    if (definition.target === 'host') {
      return [this];
    }

    const root = this.renderRoot;

    if (!definition.selector) {
      return [root];
    }

    if ('querySelectorAll' in root) {
      return Array.from(root.querySelectorAll(definition.selector));
    }

    return [];
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
