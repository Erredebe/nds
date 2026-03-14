import type { DomMode } from './base-element.js';
import type { NDSComponentElement } from './component.js';
import {
  type NDSComponentClass,
  type NDSComponentDefinition,
  type NDSListenerDefinition
} from './component.js';
import { generatedComponentStyles } from '../generated/component-styles.generated.js';

const symbolConstructor = Symbol as SymbolConstructor & { metadata?: symbol };
const metadataSymbol = symbolConstructor.metadata ?? Symbol.for('Symbol.metadata');

if (!symbolConstructor.metadata) {
  Object.defineProperty(symbolConstructor, 'metadata', {
    configurable: false,
    enumerable: false,
    value: metadataSymbol,
    writable: false
  });
}

const componentAttributesMetadataKey = Symbol('nds.componentAttributes');
const componentListenersMetadataKey = Symbol('nds.componentListeners');

interface NDSDecoratorMetadata {
  [componentAttributesMetadataKey]?: NDSAttributeDefinition[];
  [componentListenersMetadataKey]?: NDSListenerDefinition[];
}

interface NDSAttributeDefinition {
  attribute: string;
}

interface NDSComponentDecoratorOptions {
  defaultDomMode?: DomMode;
  stylePath: string;
  tagName: string;
}

interface NDSAttributeDecoratorOptions {
  attribute?: string;
}

const toKebabCase = (value: string): string =>
  value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .toLowerCase();

const getMetadata = (
  context: ClassFieldDecoratorContext | ClassMethodDecoratorContext | ClassAccessorDecoratorContext
): NDSDecoratorMetadata => {
  const metadata = context.metadata as NDSDecoratorMetadata | undefined;

  if (!metadata) {
    throw new TypeError('Decorators metadata is not available in this runtime.');
  }

  return metadata;
};

const pushUnique = <T>(values: T[], nextValue: T, matcher: (value: T) => boolean): void => {
  if (!values.some(matcher)) {
    values.push(nextValue);
  }
};

const registerAttribute = (
  context: ClassAccessorDecoratorContext,
  definition: NDSAttributeDefinition
): void => {
  const metadata = getMetadata(context);
  const attributes = metadata[componentAttributesMetadataKey] ?? [];

  pushUnique(attributes, definition, (value) => value.attribute === definition.attribute);
  metadata[componentAttributesMetadataKey] = attributes;
};

const registerListener = (
  context: ClassMethodDecoratorContext,
  definition: NDSListenerDefinition
): void => {
  const metadata = getMetadata(context);
  const listeners = metadata[componentListenersMetadataKey] ?? [];

  listeners.push(definition);
  metadata[componentListenersMetadataKey] = listeners;
};

const getGeneratedShadowStyles = (tagName: string): string => generatedComponentStyles[tagName]?.shadowStyles ?? '';

type DecoratedComponentHooks = {
  renderTemplate(mode: DomMode): string;
  defaultSlotFallbackText(): string;
  rendered(): void;
};

const getDecoratedHooks = (element: NDSComponentElement): DecoratedComponentHooks =>
  element as unknown as DecoratedComponentHooks;

const reflectStringAttribute = (element: HTMLElement, name: string, value: string): void => {
  if (element.getAttribute(name) !== value) {
    element.setAttribute(name, value);
  }
};

const reflectBooleanAttribute = (element: HTMLElement, name: string, value: boolean): void => {
  const hasAttribute = element.hasAttribute(name);

  if (value && !hasAttribute) {
    element.setAttribute(name, '');
    return;
  }

  if (!value && hasAttribute) {
    element.removeAttribute(name);
  }
};

const createAccessorDecorator = <T>(
  definitionFactory: (attribute: string) => {
    fromAttribute: (value: string | null, fallback: T) => T;
    normalizeAssignedValue: (value: T, fallback: T) => T;
    reflectAttribute: (element: HTMLElement, attribute: string, value: T) => void;
  },
  options: NDSAttributeDecoratorOptions = {}
) => {
  return (
    value: ClassAccessorDecoratorTarget<HTMLElement, T>,
    context: ClassAccessorDecoratorContext<HTMLElement, T>
  ): ClassAccessorDecoratorResult<HTMLElement, T> => {
    if (context.kind !== 'accessor' || context.static || context.private) {
      throw new TypeError('@attr decorators can only be used on public instance accessors.');
    }

    const attribute = options.attribute ?? toKebabCase(String(context.name));
    const definition = definitionFactory(attribute);

    registerAttribute(context, { attribute });

    return {
      get(this: HTMLElement): T {
        return definition.fromAttribute(this.getAttribute(attribute), value.get.call(this));
      },
      set(this: HTMLElement, nextValue: T): void {
        const normalizedValue = definition.normalizeAssignedValue(nextValue, value.get.call(this));

        value.set.call(this, normalizedValue);
        definition.reflectAttribute(this, attribute, normalizedValue);
      },
      init(initialValue: T): T {
        return initialValue;
      }
    };
  };
};

export const component =
  ({ defaultDomMode = 'shadow', stylePath, tagName }: NDSComponentDecoratorOptions) =>
  <T extends abstract new (...args: any[]) => object>(
    value: T,
    context: ClassDecoratorContext<T>
  ): void => {
    if (context.kind !== 'class') {
      throw new TypeError('@component can only decorate classes.');
    }

    const componentClass = value as unknown as NDSComponentClass<NDSComponentElement>;
    const metadata = (context.metadata as NDSDecoratorMetadata | undefined) ?? {};
    const observedAttributes = (metadata[componentAttributesMetadataKey] ?? []).map(({ attribute }) => attribute);
    const listeners = metadata[componentListenersMetadataKey] ?? [];
    const previousDefinition = componentClass.definition as NDSComponentDefinition<any> | undefined;

    componentClass.definition = {
      tagName,
      observedAttributes,
      shadowStyles: getGeneratedShadowStyles(tagName) || previousDefinition?.shadowStyles || '',
      defaultDomMode,
      stylePath,
      renderTemplate: (element, mode) => getDecoratedHooks(element).renderTemplate(mode),
      getDefaultSlotFallbackText: (element) => getDecoratedHooks(element).defaultSlotFallbackText(),
      afterRender: (element) => getDecoratedHooks(element).rendered()
    };

    componentClass.listeners = listeners;
    componentClass.observedAttributes = observedAttributes;
    componentClass.shadowStyles = componentClass.definition.shadowStyles;
  };

export const attr = {
  boolean: (options?: NDSAttributeDecoratorOptions) =>
    createAccessorDecorator<boolean>(
      () => ({
        fromAttribute: (value, fallback) => (value === null ? fallback : value !== 'false'),
        normalizeAssignedValue: (value) => Boolean(value),
        reflectAttribute: reflectBooleanAttribute
      }),
      options
    ),
  enum: <const T extends readonly string[]>(values: T, options?: NDSAttributeDecoratorOptions) =>
    createAccessorDecorator<T[number]>(
      () => ({
        fromAttribute: (value, fallback) => (values.includes(value as T[number]) ? (value as T[number]) : fallback),
        normalizeAssignedValue: (value, fallback) => (values.includes(value) ? value : fallback),
        reflectAttribute: reflectStringAttribute
      }),
      options
    ),
  string: (options?: NDSAttributeDecoratorOptions) =>
    createAccessorDecorator<string>(
      () => ({
        fromAttribute: (value, fallback) => value ?? fallback,
        normalizeAssignedValue: (value) => `${value ?? ''}`,
        reflectAttribute: reflectStringAttribute
      }),
      options
    )
};

export const listen =
  (
    eventName: string,
    options: {
      selector?: string;
      target?: 'host' | 'renderRoot';
    } = {}
  ) =>
  (
    _value: (this: unknown, event: Event) => void,
    context: ClassMethodDecoratorContext<unknown, (this: unknown, event: Event) => void>
  ): void => {
    if (context.kind !== 'method' || context.static || context.private) {
      throw new TypeError('@listen can only be used on public instance methods.');
    }

    const definition: NDSListenerDefinition = {
      eventName,
      methodName: String(context.name),
      target: options.target ?? 'renderRoot'
    };

    if (options.selector) {
      definition.selector = options.selector;
    }

    registerListener(context, definition);
  };
