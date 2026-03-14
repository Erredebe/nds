import { escapeHtml } from '../utils/dom.js';
import type { DomMode } from './base-element.js';

export interface CompiledTemplateTextPart {
  kind: 'expr' | 'static';
  value: string;
}

export interface CompiledTemplateForBinding {
  expression: string;
  indexName?: string;
  itemName: string;
  trackByExpression?: string;
}

export interface CompiledTemplateTextNode {
  kind: 'text';
  parts: CompiledTemplateTextPart[];
}

export interface CompiledTemplateElementNode {
  kind: 'element';
  attributeBindings: Array<[name: string, expression: string]>;
  children: CompiledTemplateNode[];
  classBindings: Array<[name: string, expression: string]>;
  eventBindings: Array<[name: string, expression: string]>;
  forBinding?: CompiledTemplateForBinding;
  ifExpression?: string;
  innerHtmlExpression?: string;
  propertyBindings: Array<[name: string, expression: string]>;
  ref?: string;
  staticAttributes: Array<[name: string, value: string]>;
  styleBindings: Array<[name: string, expression: string]>;
  tagName: string;
}

export type CompiledTemplateNode = CompiledTemplateElementNode | CompiledTemplateTextNode;

export interface CompiledTemplateDefinition {
  sourcePath: string;
  tagName: string;
  nodes: CompiledTemplateNode[];
}

export interface RenderTemplateResult {
  fragment: DocumentFragment;
  refs: Record<string, Element>;
}

type ReusePool = Map<string, HTMLElement[]>;

type ScopeLocals = Record<string, unknown>;
type TemplateHost = HTMLElement & Record<string, unknown> & { refs: Record<string, Element> };

const expressionCache = new Map<string, (scope: object, event?: Event) => unknown>();
const statementCache = new Map<string, (scope: object, event?: Event) => void>();
const listenerControllerSymbol = Symbol('nds.template.listenerController');
const reuseKeyAttribute = 'data-nds-key';

type BoundElement = HTMLElement & {
  [listenerControllerSymbol]?: AbortController;
};

const compileExpression = (expression: string): ((scope: object, event?: Event) => unknown) => {
  const cached = expressionCache.get(expression);

  if (cached) {
    return cached;
  }

  const compiled = new Function('$scope', '$event', `with ($scope) { return (${expression}); }`) as (
    scope: object,
    event?: Event
  ) => unknown;

  expressionCache.set(expression, compiled);
  return compiled;
};

const compileStatement = (statement: string): ((scope: object, event?: Event) => void) => {
  const cached = statementCache.get(statement);

  if (cached) {
    return cached;
  }

  const compiled = new Function('$scope', '$event', `with ($scope) { ${statement}; }`) as (
    scope: object,
    event?: Event
  ) => void;

  statementCache.set(statement, compiled);
  return compiled;
};

const createScope = (component: TemplateHost, locals: ScopeLocals, event?: Event): object =>
  new Proxy(Object.create(null) as Record<string, unknown>, {
    get(_target, property) {
      if (property === Symbol.unscopables) {
        return undefined;
      }

      if (typeof property !== 'string') {
        return undefined;
      }

      if (property === '$event') {
        return event;
      }

      if (Object.prototype.hasOwnProperty.call(locals, property)) {
        return locals[property];
      }

      const value = (component as unknown as Record<string, unknown>)[property];
      return typeof value === 'function' ? value.bind(component) : value;
    },
    has(_target, property) {
      if (typeof property !== 'string') {
        return false;
      }

      return property === '$event' || Object.prototype.hasOwnProperty.call(locals, property) || property in component;
    },
    set(_target, property, value) {
      if (typeof property !== 'string') {
        return false;
      }

      if (Object.prototype.hasOwnProperty.call(locals, property)) {
        locals[property] = value;
        return true;
      }

      component[property] = value;
      return true;
    }
  });

const evaluateExpression = (component: TemplateHost, expression: string, locals: ScopeLocals, event?: Event): unknown =>
  compileExpression(expression)(createScope(component, locals, event), event);

const executeStatement = (component: TemplateHost, statement: string, locals: ScopeLocals, event: Event): void => {
  compileStatement(statement)(createScope(component, locals, event), event);
};

const toTextValue = (value: unknown): string => {
  if (value === null || value === undefined || value === false) {
    return '';
  }

  return escapeHtml(String(value));
};

const renderTextNode = (component: TemplateHost, node: CompiledTemplateTextNode, locals: ScopeLocals): Text => {
  const text = node.parts
    .map((part) => (part.kind === 'static' ? part.value : toTextValue(evaluateExpression(component, part.value, locals))))
    .join('');

  return document.createTextNode(text);
};

const asIterable = (value: unknown): unknown[] => {
  if (Array.isArray(value)) {
    return value;
  }

  if (!value || typeof value === 'string' || typeof (value as { [Symbol.iterator]?: unknown })[Symbol.iterator] !== 'function') {
    return [];
  }

  return Array.from(value as Iterable<unknown>);
};

const toReuseKey = (tagName: string, key: string): string => `${tagName}::${key}`;

const createReusePool = (root: ParentNode): ReusePool => {
  const pool: ReusePool = new Map();

  root.querySelectorAll<HTMLElement>(`[${reuseKeyAttribute}]`).forEach((element) => {
    const key = element.getAttribute(reuseKeyAttribute);

    if (!key) {
      return;
    }

    const poolKey = toReuseKey(element.tagName.toLowerCase(), key);
    const existing = pool.get(poolKey) ?? [];
    existing.push(element);
    pool.set(poolKey, existing);
  });

  return pool;
};

const takeReusedElement = (pool: ReusePool | undefined, tagName: string, key: string): HTMLElement | null => {
  if (!pool) {
    return null;
  }

  const poolKey = toReuseKey(tagName, key);
  const entries = pool.get(poolKey);

  if (!entries || entries.length === 0) {
    return null;
  }

  const next = entries.shift() ?? null;

  if (entries.length === 0) {
    pool.delete(poolKey);
  }

  return next;
};

const resetReusedElement = (element: BoundElement): void => {
  element[listenerControllerSymbol]?.abort();
  delete element[listenerControllerSymbol];

  for (const attributeName of element.getAttributeNames()) {
    element.removeAttribute(attributeName);
  }

  element.replaceChildren();
};

const applyElementBindings = (
  component: TemplateHost,
  element: HTMLElement,
  node: CompiledTemplateElementNode,
  locals: ScopeLocals,
  refs: Record<string, Element>
): void => {
  for (const [name, value] of node.staticAttributes) {
    element.setAttribute(name, value);
  }

  for (const [name, expression] of node.propertyBindings) {
    (element as unknown as Record<string, unknown>)[name] = evaluateExpression(component, expression, locals);
  }

  for (const [name, expression] of node.attributeBindings) {
    const value = evaluateExpression(component, expression, locals);

    if (value === null || value === undefined || value === false) {
      element.removeAttribute(name);
      continue;
    }

    element.setAttribute(name, value === true ? '' : String(value));
  }

  for (const [name, expression] of node.classBindings) {
    element.classList.toggle(name, Boolean(evaluateExpression(component, expression, locals)));
  }

  for (const [name, expression] of node.styleBindings) {
    const value = evaluateExpression(component, expression, locals);

    if (value === null || value === undefined || value === false || value === '') {
      element.style.removeProperty(name);
      continue;
    }

    element.style.setProperty(name, String(value));
  }

  for (const [name, statement] of node.eventBindings) {
    const boundElement = element as BoundElement;
    const controller = boundElement[listenerControllerSymbol] ?? new AbortController();

    boundElement[listenerControllerSymbol] = controller;
    element.addEventListener(name, (event) => {
      executeStatement(component, statement, { ...locals }, event);
    }, { signal: controller.signal });
  }

  if (node.ref) {
    element.setAttribute('data-nds-ref', node.ref);
    refs[node.ref] = element;
  }
};

const applyInnerHtmlBinding = (
  component: TemplateHost,
  element: HTMLElement,
  node: CompiledTemplateElementNode,
  locals: ScopeLocals
): boolean => {
  if (!node.innerHtmlExpression) {
    return false;
  }

  const value = evaluateExpression(component, node.innerHtmlExpression, locals);
  element.innerHTML = value === null || value === undefined ? '' : String(value);
  return true;
};

const renderNodeCollection = (
  component: TemplateHost,
  nodes: CompiledTemplateNode[],
  locals: ScopeLocals,
  refs: Record<string, Element>,
  domMode: DomMode,
  projectedNodes: Node[],
  reusePool?: ReusePool
): Node[] => {
  const rendered: Node[] = [];

  for (const node of nodes) {
    if (node.kind === 'text') {
      rendered.push(renderTextNode(component, node, locals));
      continue;
    }

    if (node.forBinding) {
      const forBinding = node.forBinding;
      const values = asIterable(evaluateExpression(component, forBinding.expression, locals));

      values.forEach((item, index) => {
        const nextLocals: ScopeLocals = {
          ...locals,
          [forBinding.itemName]: item
        };

        if (forBinding.indexName) {
          nextLocals[forBinding.indexName] = index;
        }

        const trackByValue = forBinding.trackByExpression
          ? evaluateExpression(component, forBinding.trackByExpression, nextLocals)
          : undefined;
        const { forBinding: _forBinding, ...cloneNodeBase } = node;
        const cloneNode: CompiledTemplateElementNode = {
          ...cloneNodeBase,
          staticAttributes:
            trackByValue === undefined
              ? cloneNodeBase.staticAttributes
              : [...cloneNodeBase.staticAttributes, ['data-nds-key', String(trackByValue)]]
        };

        rendered.push(...renderNodeCollection(component, [cloneNode], nextLocals, refs, domMode, projectedNodes, reusePool));
      });

      continue;
    }

    if (node.ifExpression && !evaluateExpression(component, node.ifExpression, locals)) {
      continue;
    }

    if (node.tagName === 'slot') {
      if (domMode === 'light') {
        const slotTarget = document.createElement('span');
        slotTarget.setAttribute('data-nds-slot-target', 'default');
        slotTarget.style.display = 'contents';

        if (projectedNodes.length > 0) {
          slotTarget.append(...projectedNodes.splice(0, projectedNodes.length));
        } else {
          slotTarget.append(...renderNodeCollection(component, node.children, locals, refs, domMode, projectedNodes, reusePool));
        }

        rendered.push(slotTarget);

        continue;
      }

      const slotElement = document.createElement('slot');
      applyElementBindings(component, slotElement, node, locals, refs);
      slotElement.append(...renderNodeCollection(component, node.children, locals, refs, domMode, projectedNodes, reusePool));
      rendered.push(slotElement);
      continue;
    }

    const reuseKey = node.staticAttributes.find(([name]) => name === reuseKeyAttribute)?.[1];
    const element = (reuseKey ? takeReusedElement(reusePool, node.tagName, reuseKey) : null) ?? document.createElement(node.tagName);

    if (reuseKey && element instanceof HTMLElement) {
      resetReusedElement(element as BoundElement);
    }

    applyElementBindings(component, element, node, locals, refs);

    if (!applyInnerHtmlBinding(component, element, node, locals)) {
      element.append(...renderNodeCollection(component, node.children, locals, refs, domMode, projectedNodes, reusePool));
    }

    rendered.push(element);
  }

  return rendered;
};

export const renderTemplate = (
  component: TemplateHost,
  template: CompiledTemplateDefinition,
  domMode: DomMode,
  projectedNodes: Node[] = [],
  reusePool?: ReusePool
): RenderTemplateResult => {
  const fragment = document.createDocumentFragment();
  const refs: Record<string, Element> = {};
  const localProjectedNodes = [...projectedNodes];

  fragment.append(...renderNodeCollection(component, template.nodes, {}, refs, domMode, localProjectedNodes, reusePool));

  return {
    fragment,
    refs
  };
};

export const collectReusableNodes = (root: ParentNode): ReusePool => createReusePool(root);
