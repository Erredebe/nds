import type { DomMode } from './base-element.js';
import type { NDSComponentElement, NDSComponentClass, NDSComponentDefinition, NDSPropDefinition } from './component.js';
import { generatedComponentStyles } from '../generated/component-styles.generated.js';
import { generatedComponentTemplates } from '../generated/component-templates.generated.js';

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

const componentPropsMetadataKey = Symbol('nds.componentProps');
const componentWatchersMetadataKey = Symbol('nds.componentWatchers');

interface NDSDecoratorMetadata {
  [componentPropsMetadataKey]?: NDSPropDefinition[];
  [componentWatchersMetadataKey]?: Record<string, string[]>;
}

interface NDSComponentDecoratorOptions {
  defaultDomMode?: DomMode;
  stylePath: string;
  tagName: string;
  templatePath: string;
}

type PropType = BooleanConstructor | StringConstructor;

interface NDSPropDecoratorOptions {
  attribute?: false | string;
  reflect?: boolean;
  type?: PropType;
  values?: readonly string[];
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

const registerProp = (context: ClassAccessorDecoratorContext, definition: NDSPropDefinition): void => {
  const metadata = getMetadata(context);
  const props = metadata[componentPropsMetadataKey] ?? [];

  pushUnique(props, definition, (value) => value.propertyKey === definition.propertyKey);
  metadata[componentPropsMetadataKey] = props;
};

const registerWatcher = (context: ClassMethodDecoratorContext, propertyKey: string): void => {
  const metadata = getMetadata(context);
  const watchers = metadata[componentWatchersMetadataKey] ?? {};
  const methodNames = watchers[propertyKey] ?? [];

  methodNames.push(String(context.name));
  watchers[propertyKey] = methodNames;
  metadata[componentWatchersMetadataKey] = watchers;
};

const normalizeStringValue = (value: unknown, fallback: string, allowedValues?: readonly string[]): string => {
  const normalized = `${value ?? ''}`;

  if (!allowedValues || allowedValues.length === 0) {
    return normalized;
  }

  return allowedValues.includes(normalized) ? normalized : fallback;
};

const normalizeBooleanValue = (value: unknown): boolean => Boolean(value);

const createReactiveDecorator = (kind: 'prop' | 'state', options: NDSPropDecoratorOptions = {}) => {
  return <T>(
    value: ClassAccessorDecoratorTarget<object, T>,
    context: ClassAccessorDecoratorContext<object, T>
  ): ClassAccessorDecoratorResult<object, T> => {
    if (context.kind !== 'accessor' || context.static || context.private) {
      throw new TypeError(`@${kind} can only be used on public instance accessors.`);
    }

    const propertyKey = String(context.name);
    const type = options.type === Boolean ? 'boolean' : 'string';
    const reflect = kind === 'prop' ? (options.reflect ?? false) : false;
    const attribute = kind === 'prop' ? (options.attribute === false ? undefined : options.attribute ?? toKebabCase(propertyKey)) : undefined;

    registerProp(context, {
      ...(attribute ? { attribute } : {}),
      propertyKey,
      reflect,
      type
    });

    return {
      get(this: object): T {
        return value.get.call(this);
      },
      set(this: object, nextValue: T): void {
        const previousValue = value.get.call(this);
        const fallbackValue = previousValue as string | boolean;
        const normalizedValue = (
          type === 'boolean'
            ? normalizeBooleanValue(nextValue)
            : normalizeStringValue(nextValue, `${fallbackValue ?? ''}`, options.values)
        ) as T;

        value.set.call(this, normalizedValue);

        const host = this as NDSComponentElement;

        if (attribute) {
          host.syncReactiveAttribute(attribute, reflect, normalizedValue);
        }

        host.notifyReactivePropertyChange(propertyKey, previousValue, normalizedValue);
      },
      init(initialValue: T): T {
        return (
          type === 'boolean'
            ? normalizeBooleanValue(initialValue)
            : normalizeStringValue(initialValue, `${initialValue ?? ''}`, options.values)
        ) as T;
      }
    };
  };
};

const getGeneratedShadowStyles = (tagName: string): string => generatedComponentStyles[tagName]?.shadowStyles ?? '';
const getGeneratedTemplate = (tagName: string) => generatedComponentTemplates[tagName];

type DecoratedComponentHooks = {
  rendered(): void;
};

const getDecoratedHooks = (element: NDSComponentElement): DecoratedComponentHooks =>
  element as unknown as DecoratedComponentHooks;

export const component =
  ({ defaultDomMode = 'shadow', stylePath, tagName, templatePath }: NDSComponentDecoratorOptions) =>
  <T extends abstract new (...args: any[]) => object>(value: T, context: ClassDecoratorContext<T>): void => {
    if (context.kind !== 'class') {
      throw new TypeError('@component can only decorate classes.');
    }

    const componentClass = value as unknown as NDSComponentClass<NDSComponentElement>;
    const metadata = (context.metadata as NDSDecoratorMetadata | undefined) ?? {};
    const propDefinitions = metadata[componentPropsMetadataKey] ?? [];
    const watchers = metadata[componentWatchersMetadataKey] ?? {};
    const observedAttributes = propDefinitions.flatMap(({ attribute }) => (attribute ? [attribute] : []));
    const previousDefinition = componentClass.definition as NDSComponentDefinition<any> | undefined;

    componentClass.definition = {
      tagName,
      observedAttributes,
      shadowStyles: getGeneratedShadowStyles(tagName) || previousDefinition?.shadowStyles || '',
      defaultDomMode,
      stylePath,
      templatePath,
      template: getGeneratedTemplate(tagName) ?? previousDefinition?.template ?? { nodes: [], sourcePath: templatePath, tagName },
      afterRender: (element) => getDecoratedHooks(element).rendered()
    };

    componentClass.propDefinitions = propDefinitions;
    componentClass.watchers = watchers;
    componentClass.observedAttributes = observedAttributes;
    componentClass.shadowStyles = componentClass.definition.shadowStyles;
  };

export const prop = (options?: NDSPropDecoratorOptions) => createReactiveDecorator('prop', options);

export const state = (options?: NDSPropDecoratorOptions) => createReactiveDecorator('state', options);

export const watch =
  (propertyKey: string) =>
  (_value: (this: unknown, nextValue: unknown, previousValue: unknown) => void, context: ClassMethodDecoratorContext) => {
    if (context.kind !== 'method' || context.static || context.private) {
      throw new TypeError('@watch can only be used on public instance methods.');
    }

    registerWatcher(context, propertyKey);
  };
