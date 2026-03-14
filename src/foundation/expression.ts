type BinaryOperator = '!=' | '!==' | '%' | '*' | '+' | '-' | '/' | '<' | '<=' | '==' | '===' | '>' | '>=' | '&&' | '||';
type UnaryOperator = '!' | '+' | '-';

type ExpressionNode =
  | AssignmentExpressionNode
  | BinaryExpressionNode
  | CallExpressionNode
  | ConditionalExpressionNode
  | IdentifierNode
  | LiteralNode
  | MemberExpressionNode
  | UnaryExpressionNode;

interface AssignmentExpressionNode {
  kind: 'assignment';
  left: IdentifierNode | MemberExpressionNode;
  right: ExpressionNode;
}

interface BinaryExpressionNode {
  kind: 'binary';
  left: ExpressionNode;
  operator: BinaryOperator;
  right: ExpressionNode;
}

interface CallExpressionNode {
  arguments: ExpressionNode[];
  callee: ExpressionNode;
  kind: 'call';
}

interface ConditionalExpressionNode {
  alternate: ExpressionNode;
  consequent: ExpressionNode;
  kind: 'conditional';
  test: ExpressionNode;
}

interface IdentifierNode {
  kind: 'identifier';
  name: string;
}

interface LiteralNode {
  kind: 'literal';
  value: boolean | null | number | string | undefined;
}

interface MemberExpressionNode {
  kind: 'member';
  object: ExpressionNode;
  property: string;
}

interface UnaryExpressionNode {
  argument: ExpressionNode;
  kind: 'unary';
  operator: UnaryOperator;
}

type Token = {
  type: 'eof' | 'identifier' | 'number' | 'operator' | 'punctuation' | 'string';
  value: string;
};

export interface ExpressionEvaluationContext {
  component: Record<string, unknown>;
  event?: Event;
  locals: Record<string, unknown>;
}

const binaryPrecedence = new Map<BinaryOperator, number>([
  ['||', 1],
  ['&&', 2],
  ['==', 3],
  ['!=', 3],
  ['===', 3],
  ['!==', 3],
  ['<', 4],
  ['<=', 4],
  ['>', 4],
  ['>=', 4],
  ['+', 5],
  ['-', 5],
  ['*', 6],
  ['/', 6],
  ['%', 6]
]);

const isIdentifierStart = (value: string): boolean => /[A-Za-z_$]/.test(value);
const isIdentifierPart = (value: string): boolean => /[A-Za-z0-9_$]/.test(value);
const isDigit = (value: string): boolean => /[0-9]/.test(value);

const escapeStringLiteral = (value: string): string => JSON.stringify(value);

const rewriteTemplateLiterals = (source: string): string => {
  let result = '';
  let index = 0;

  const parseTemplate = (): string => {
    index += 1;
    const parts: string[] = [];
    let textBuffer = '';

    while (index < source.length) {
      const current = source[index] ?? '';

      if (current === '`') {
        index += 1;
        if (textBuffer.length > 0) {
          parts.push(escapeStringLiteral(textBuffer));
        }
        return parts.length > 0 ? `(${parts.join(' + ')})` : "''";
      }

      if (current === '\\') {
        const next = source[index + 1] ?? '';
        textBuffer += next;
        index += 2;
        continue;
      }

      if (current === '$' && source[index + 1] === '{') {
        if (textBuffer.length > 0) {
          parts.push(escapeStringLiteral(textBuffer));
          textBuffer = '';
        }

        index += 2;
        let depth = 1;
        let expression = '';

        while (index < source.length && depth > 0) {
          const next = source[index] ?? '';

          if (next === '{') {
            depth += 1;
            expression += next;
            index += 1;
            continue;
          }

          if (next === '}') {
            depth -= 1;

            if (depth === 0) {
              index += 1;
              break;
            }

            expression += next;
            index += 1;
            continue;
          }

          expression += next;
          index += 1;
        }

        parts.push(`(${rewriteTemplateLiterals(expression)})`);
        continue;
      }

      textBuffer += current;
      index += 1;
    }

    throw new Error('Unterminated template literal.');
  };

  while (index < source.length) {
    const current = source[index] ?? '';

    if (current === '`') {
      result += parseTemplate();
      continue;
    }

    result += current;
    index += 1;
  }

  return result;
};

class TokenStream {
  readonly #source: string;
  #index = 0;
  #current: Token | null = null;

  constructor(source: string) {
    this.#source = rewriteTemplateLiterals(source.trim());
  }

  peek(): Token {
    this.#current ??= this.readToken();
    return this.#current;
  }

  next(): Token {
    const token = this.peek();
    this.#current = null;
    return token;
  }

  match(type: Token['type'], value?: string): boolean {
    const token = this.peek();
    return token.type === type && (value === undefined || token.value === value);
  }

  expect(type: Token['type'], value?: string): Token {
    const token = this.next();

    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(`Unexpected token ${token.value || token.type}.`);
    }

    return token;
  }

  readToken(): Token {
    while (this.#index < this.#source.length && /\s/.test(this.#source[this.#index] ?? '')) {
      this.#index += 1;
    }

    if (this.#index >= this.#source.length) {
      return { type: 'eof', value: '' };
    }

    const remaining = this.#source.slice(this.#index);

    for (const operator of ['===', '!==', '>=', '<=', '&&', '||', '==', '!=']) {
      if (remaining.startsWith(operator)) {
        this.#index += operator.length;
        return { type: 'operator', value: operator };
      }
    }

    const single = this.#source[this.#index] ?? '';

    if ('+-*/%><=!?:.,()'.includes(single)) {
      this.#index += 1;

      if ('+-*/%><='.includes(single)) {
        return { type: 'operator', value: single };
      }

      return { type: 'punctuation', value: single };
    }

    if (single === '"' || single === "'") {
      const quote = single;
      let value = '';
      this.#index += 1;

      while (this.#index < this.#source.length) {
        const current = this.#source[this.#index] ?? '';

        if (current === '\\') {
          const next = this.#source[this.#index + 1] ?? '';
          value += next;
          this.#index += 2;
          continue;
        }

        if (current === quote) {
          this.#index += 1;
          return { type: 'string', value };
        }

        value += current;
        this.#index += 1;
      }

      throw new Error('Unterminated string literal.');
    }

    if (isDigit(single)) {
      let value = single;
      this.#index += 1;

      while (this.#index < this.#source.length) {
        const current = this.#source[this.#index] ?? '';

        if (!isDigit(current) && current !== '.') {
          break;
        }

        value += current;
        this.#index += 1;
      }

      return { type: 'number', value };
    }

    if (isIdentifierStart(single)) {
      let value = single;
      this.#index += 1;

      while (this.#index < this.#source.length && isIdentifierPart(this.#source[this.#index] ?? '')) {
        value += this.#source[this.#index] ?? '';
        this.#index += 1;
      }

      return { type: 'identifier', value };
    }

    throw new Error(`Unsupported token: ${single}`);
  }
}

class Parser {
  readonly #tokens: TokenStream;

  constructor(source: string) {
    this.#tokens = new TokenStream(source);
  }

  parse(): ExpressionNode {
    const expression = this.parseAssignment();
    this.#tokens.expect('eof');
    return expression;
  }

  parseAssignment(): ExpressionNode {
    const left = this.parseConditional();

    if (!this.#tokens.match('operator', '=')) {
      return left;
    }

    if (left.kind !== 'identifier' && left.kind !== 'member') {
      throw new Error('Invalid assignment target.');
    }

    this.#tokens.next();
    return {
      kind: 'assignment',
      left,
      right: this.parseAssignment()
    };
  }

  parseConditional(): ExpressionNode {
    const test = this.parseBinary(1);

    if (!this.#tokens.match('punctuation', '?')) {
      return test;
    }

    this.#tokens.next();
    const consequent = this.parseAssignment();
    this.#tokens.expect('punctuation', ':');
    const alternate = this.parseAssignment();

    return {
      alternate,
      consequent,
      kind: 'conditional',
      test
    };
  }

  parseBinary(minPrecedence: number): ExpressionNode {
    let left = this.parseUnary();

    while (this.#tokens.peek().type === 'operator') {
      const operator = this.#tokens.peek().value as BinaryOperator;
      const precedence = binaryPrecedence.get(operator);

      if (!precedence || precedence < minPrecedence) {
        break;
      }

      this.#tokens.next();
      const right = this.parseBinary(precedence + 1);
      left = {
        kind: 'binary',
        left,
        operator,
        right
      };
    }

    return left;
  }

  parseUnary(): ExpressionNode {
    if (this.#tokens.match('operator', '!') || this.#tokens.match('operator', '+') || this.#tokens.match('operator', '-')) {
      const operator = this.#tokens.next().value as UnaryOperator;
      return {
        argument: this.parseUnary(),
        kind: 'unary',
        operator
      };
    }

    return this.parseMemberOrCall();
  }

  parseMemberOrCall(): ExpressionNode {
    let expression = this.parsePrimary();

    while (true) {
      if (this.#tokens.match('punctuation', '.')) {
        this.#tokens.next();
        const property = this.#tokens.expect('identifier').value;
        expression = {
          kind: 'member',
          object: expression,
          property
        };
        continue;
      }

      if (this.#tokens.match('punctuation', '(')) {
        this.#tokens.next();
        const args: ExpressionNode[] = [];

        if (!this.#tokens.match('punctuation', ')')) {
          while (true) {
            args.push(this.parseAssignment());

            if (!this.#tokens.match('punctuation', ',')) {
              break;
            }

            this.#tokens.next();
          }
        }

        this.#tokens.expect('punctuation', ')');
        expression = {
          arguments: args,
          callee: expression,
          kind: 'call'
        };
        continue;
      }

      break;
    }

    return expression;
  }

  parsePrimary(): ExpressionNode {
    const token = this.#tokens.next();

    if (token.type === 'identifier') {
      if (token.value === 'true') {
        return { kind: 'literal', value: true };
      }

      if (token.value === 'false') {
        return { kind: 'literal', value: false };
      }

      if (token.value === 'null') {
        return { kind: 'literal', value: null };
      }

      if (token.value === 'undefined') {
        return { kind: 'literal', value: undefined };
      }

      return { kind: 'identifier', name: token.value };
    }

    if (token.type === 'number') {
      return { kind: 'literal', value: Number(token.value) };
    }

    if (token.type === 'string') {
      return { kind: 'literal', value: token.value };
    }

    if (token.type === 'punctuation' && token.value === '(') {
      const expression = this.parseAssignment();
      this.#tokens.expect('punctuation', ')');
      return expression;
    }

    throw new Error(`Unexpected token ${token.value || token.type}.`);
  }
}

const expressionCache = new Map<string, ExpressionNode>();

const parseExpression = (source: string): ExpressionNode => {
  const cached = expressionCache.get(source);

  if (cached) {
    return cached;
  }

  const parsed = new Parser(source).parse();
  expressionCache.set(source, parsed);
  return parsed;
};

const hasOwn = (value: object, property: string): boolean => Object.prototype.hasOwnProperty.call(value, property);

const resolveIdentifier = (context: ExpressionEvaluationContext, name: string): unknown => {
  if (name === '$event') {
    return context.event;
  }

  if (hasOwn(context.locals, name)) {
    return context.locals[name];
  }

  const value = context.component[name];
  return typeof value === 'function' ? value.bind(context.component) : value;
};

const assignIdentifier = (context: ExpressionEvaluationContext, name: string, value: unknown): unknown => {
  if (hasOwn(context.locals, name)) {
    context.locals[name] = value;
    return value;
  }

  context.component[name] = value;
  return value;
};

const evaluateBinary = (operator: BinaryOperator, left: unknown, right: () => unknown): unknown => {
  if (operator === '&&') {
    return left && right();
  }

  if (operator === '||') {
    return left || right();
  }

  const rightValue = right();

  switch (operator) {
    case '==':
      return left == rightValue;
    case '!=':
      return left != rightValue;
    case '===':
      return left === rightValue;
    case '!==':
      return left !== rightValue;
    case '<':
      return (left as number | string) < (rightValue as number | string);
    case '<=':
      return (left as number | string) <= (rightValue as number | string);
    case '>':
      return (left as number | string) > (rightValue as number | string);
    case '>=':
      return (left as number | string) >= (rightValue as number | string);
    case '+':
      return typeof left === 'string' || typeof rightValue === 'string'
        ? `${left ?? ''}${rightValue ?? ''}`
        : Number(left) + Number(rightValue);
    case '-':
      return Number(left) - Number(rightValue);
    case '*':
      return Number(left) * Number(rightValue);
    case '/':
      return Number(left) / Number(rightValue);
    case '%':
      return Number(left) % Number(rightValue);
  }
};

const evaluateNode = (node: ExpressionNode, context: ExpressionEvaluationContext): unknown => {
  switch (node.kind) {
    case 'literal':
      return node.value;
    case 'identifier':
      return resolveIdentifier(context, node.name);
    case 'member': {
      const target = evaluateNode(node.object, context) as Record<string, unknown> | null | undefined;

      if (target === null || target === undefined) {
        return undefined;
      }

      return target[node.property];
    }
    case 'call': {
      if (node.callee.kind === 'member') {
        const target = evaluateNode(node.callee.object, context) as Record<string, unknown> | null | undefined;

        if (target === null || target === undefined) {
          return undefined;
        }

        const value = target[node.callee.property];

        if (typeof value !== 'function') {
          return undefined;
        }

        return value.call(target, ...node.arguments.map((arg) => evaluateNode(arg, context)));
      }

      const callee = evaluateNode(node.callee, context);

      if (typeof callee !== 'function') {
        return undefined;
      }

      return callee(...node.arguments.map((arg) => evaluateNode(arg, context)));
    }
    case 'unary': {
      const value = evaluateNode(node.argument, context);

      if (node.operator === '!') {
        return !value;
      }

      if (node.operator === '+') {
        return Number(value);
      }

      return -Number(value);
    }
    case 'binary': {
      const left = evaluateNode(node.left, context);
      return evaluateBinary(node.operator, left, () => evaluateNode(node.right, context));
    }
    case 'conditional':
      return evaluateNode(node.test, context)
        ? evaluateNode(node.consequent, context)
        : evaluateNode(node.alternate, context);
    case 'assignment': {
      const value = evaluateNode(node.right, context);

      if (node.left.kind === 'identifier') {
        return assignIdentifier(context, node.left.name, value);
      }

      const target = evaluateNode(node.left.object, context) as Record<string, unknown> | null | undefined;

      if (target !== null && target !== undefined) {
        target[node.left.property] = value;
      }

      return value;
    }
  }
};

export const validateExpressionSource = (source: string): void => {
  parseExpression(source);
};

export const evaluateExpressionSource = (source: string, context: ExpressionEvaluationContext): unknown =>
  evaluateNode(parseExpression(source), context);

export const executeStatementSource = (source: string, context: ExpressionEvaluationContext): void => {
  evaluateNode(parseExpression(source), context);
};
