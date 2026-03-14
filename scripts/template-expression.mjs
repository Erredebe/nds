const binaryPrecedence = new Map([
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

const isIdentifierStart = (value) => /[A-Za-z_$]/.test(value);
const isIdentifierPart = (value) => /[A-Za-z0-9_$]/.test(value);
const isDigit = (value) => /[0-9]/.test(value);

const rewriteTemplateLiterals = (source) => {
  let result = '';
  let index = 0;

  const parseTemplate = () => {
    index += 1;
    const parts = [];
    let textBuffer = '';

    while (index < source.length) {
      const current = source[index] ?? '';

      if (current === '`') {
        index += 1;

        if (textBuffer.length > 0) {
          parts.push(JSON.stringify(textBuffer));
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
          parts.push(JSON.stringify(textBuffer));
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
  #current = null;
  #index = 0;
  #source;

  constructor(source) {
    this.#source = rewriteTemplateLiterals(source.trim());
  }

  peek() {
    this.#current ??= this.readToken();
    return this.#current;
  }

  next() {
    const token = this.peek();
    this.#current = null;
    return token;
  }

  match(type, value) {
    const token = this.peek();
    return token.type === type && (value === undefined || token.value === value);
  }

  expect(type, value) {
    const token = this.next();

    if (token.type !== type || (value !== undefined && token.value !== value)) {
      throw new Error(`Unexpected token ${token.value || token.type}.`);
    }

    return token;
  }

  readToken() {
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
  #tokens;

  constructor(source) {
    this.#tokens = new TokenStream(source);
  }

  parse() {
    const expression = this.parseAssignment();
    this.#tokens.expect('eof');
    return expression;
  }

  parseAssignment() {
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

  parseConditional() {
    const test = this.parseBinary(1);

    if (!this.#tokens.match('punctuation', '?')) {
      return test;
    }

    this.#tokens.next();
    const consequent = this.parseAssignment();
    this.#tokens.expect('punctuation', ':');
    const alternate = this.parseAssignment();
    return { alternate, consequent, kind: 'conditional', test };
  }

  parseBinary(minPrecedence) {
    let left = this.parseUnary();

    while (this.#tokens.peek().type === 'operator') {
      const operator = this.#tokens.peek().value;
      const precedence = binaryPrecedence.get(operator);

      if (!precedence || precedence < minPrecedence) {
        break;
      }

      this.#tokens.next();
      left = {
        kind: 'binary',
        left,
        operator,
        right: this.parseBinary(precedence + 1)
      };
    }

    return left;
  }

  parseUnary() {
    if (this.#tokens.match('operator', '!') || this.#tokens.match('operator', '+') || this.#tokens.match('operator', '-')) {
      return {
        argument: this.parseUnary(),
        kind: 'unary',
        operator: this.#tokens.next().value
      };
    }

    return this.parseMemberOrCall();
  }

  parseMemberOrCall() {
    let expression = this.parsePrimary();

    while (true) {
      if (this.#tokens.match('punctuation', '.')) {
        this.#tokens.next();
        expression = {
          kind: 'member',
          object: expression,
          property: this.#tokens.expect('identifier').value
        };
        continue;
      }

      if (this.#tokens.match('punctuation', '(')) {
        this.#tokens.next();
        const args = [];

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
        expression = { arguments: args, callee: expression, kind: 'call' };
        continue;
      }

      break;
    }

    return expression;
  }

  parsePrimary() {
    const token = this.#tokens.next();

    if (token.type === 'identifier') {
      if (['true', 'false', 'null', 'undefined'].includes(token.value)) {
        return { kind: 'literal', value: token.value };
      }

      return { kind: 'identifier', name: token.value };
    }

    if (token.type === 'number' || token.type === 'string') {
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

export const validateExpressionSource = (source) => {
  new Parser(source).parse();
};
