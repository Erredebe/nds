import { readFile, readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { JSDOM } from 'jsdom';

const rootDirectory = process.cwd();
const componentsDirectory = resolve(rootDirectory, 'src/components');
const outputFilePath = resolve(rootDirectory, 'src/generated/component-templates.generated.ts');

const interpolationPattern = /{{([\s\S]+?)}}/g;

const validateExpression = (expression, context) => {
  try {
    new Function('$scope', '$event', `with ($scope) { return (${expression}); }`);
  } catch (error) {
    throw new Error(`Expresion invalida en ${context}: ${expression}\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const validateStatement = (statement, context) => {
  try {
    new Function('$scope', '$event', `with ($scope) { ${statement}; }`);
  } catch (error) {
    throw new Error(`Statement invalido en ${context}: ${statement}\n${error instanceof Error ? error.message : String(error)}`);
  }
};

const splitTextParts = (value) => {
  const parts = [];
  let lastIndex = 0;

  for (const match of value.matchAll(interpolationPattern)) {
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push({ kind: 'static', value: value.slice(lastIndex, index) });
    }

    parts.push({ kind: 'expr', value: match[1].trim() });
    lastIndex = index + match[0].length;
  }

  if (lastIndex < value.length) {
    parts.push({ kind: 'static', value: value.slice(lastIndex) });
  }

  return parts;
};

const parseForBinding = (value) => {
  const [loopExpression, ...clauses] = value.split(';').map((part) => part.trim()).filter(Boolean);
  const match = loopExpression?.match(/^([A-Za-z_$][\w$]*)(?:\s*,\s*([A-Za-z_$][\w$]*))?\s+in\s+([\s\S]+)$/);

  if (!match) {
    throw new Error(`Directiva *for invalida: ${value}`);
  }

  let trackByExpression;

  for (const clause of clauses) {
    const trackByMatch = clause.match(/^trackBy\s*:\s*([\s\S]+)$/);

    if (trackByMatch) {
      trackByExpression = trackByMatch[1].trim();
      continue;
    }

    throw new Error(`Clausula *for no soportada: ${clause}`);
  }

  return {
    expression: match[3].trim(),
    indexName: match[2] ? match[2].trim() : undefined,
    itemName: match[1].trim(),
    ...(trackByExpression ? { trackByExpression } : {})
  };
};

const compileNode = (node, contextPath) => {
  if (node.nodeType === node.TEXT_NODE) {
    const parts = splitTextParts(node.textContent ?? '');

    for (const part of parts) {
      if (part.kind === 'expr') {
        validateExpression(part.value, `${contextPath} (interpolacion)`);
      }
    }

    if (parts.length === 0) {
      return null;
    }

    return {
      kind: 'text',
      parts
    };
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
    return null;
  }

  const staticAttributes = [];
  const propertyBindings = [];
  const attributeBindings = [];
  const classBindings = [];
  const styleBindings = [];
  const eventBindings = [];
  let ref;
  let ifExpression;
  let forBinding;
  let innerHtmlExpression;

  for (const attribute of Array.from(node.attributes)) {
    const { name, value } = attribute;

    if (name === 'ref') {
      ref = value.trim();
      continue;
    }

    if (name === '*if') {
      validateExpression(value.trim(), `${contextPath} *if`);
      ifExpression = value.trim();
      continue;
    }

    if (name === '*for') {
      forBinding = parseForBinding(value);
      validateExpression(forBinding.expression, `${contextPath} *for expression`);

      if (forBinding.trackByExpression) {
        validateExpression(forBinding.trackByExpression, `${contextPath} *for trackBy`);
      }

      continue;
    }

    if (name.startsWith('[') && name.endsWith(']')) {
      const bindingName = name.slice(1, -1).trim();
      const bindingNameLower = bindingName.toLowerCase();

      if (bindingName.startsWith('attr.')) {
        validateExpression(value.trim(), `${contextPath} [attr.${bindingName.slice(5)}]`);
        attributeBindings.push([bindingName.slice(5), value.trim()]);
        continue;
      }

      if (bindingName.startsWith('class.')) {
        validateExpression(value.trim(), `${contextPath} [class.${bindingName.slice(6)}]`);
        classBindings.push([bindingName.slice(6), value.trim()]);
        continue;
      }

      if (bindingName.startsWith('style.')) {
        validateExpression(value.trim(), `${contextPath} [style.${bindingName.slice(6)}]`);
        styleBindings.push([bindingName.slice(6), value.trim()]);
        continue;
      }

      if (bindingNameLower === 'innerhtml') {
        validateExpression(value.trim(), `${contextPath} [innerHTML]`);
        innerHtmlExpression = value.trim();
        continue;
      }

      validateExpression(value.trim(), `${contextPath} [${bindingName}]`);
      propertyBindings.push([bindingName, value.trim()]);
      continue;
    }

    if (name.startsWith('(') && name.endsWith(')')) {
      validateStatement(value.trim(), `${contextPath} (${name.slice(1, -1).trim()})`);
      eventBindings.push([name.slice(1, -1).trim(), value.trim()]);
      continue;
    }

    staticAttributes.push([name, value]);
  }

  return {
    kind: 'element',
    tagName: node.tagName.toLowerCase(),
    staticAttributes,
    propertyBindings,
    attributeBindings,
    classBindings,
    styleBindings,
    eventBindings,
    ref,
    ifExpression,
    forBinding,
    innerHtmlExpression,
    children: Array.from(node.childNodes).map((child) => compileNode(child, contextPath)).filter(Boolean)
  };
};

const componentDirectories = (await readdir(componentsDirectory, { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

const entries = [];

for (const directoryName of componentDirectories) {
  const templatePath = resolve(componentsDirectory, directoryName, 'template.html');
  const templateSource = await readFile(templatePath, 'utf8');
  const dom = new JSDOM(`<body>${templateSource}</body>`);
  const contextPath = `src/components/${directoryName}/template.html`;
  const nodes = Array.from(dom.window.document.body.childNodes).map((node) => compileNode(node, contextPath)).filter(Boolean);
  const tagName = `nds-${directoryName}`;

  entries.push([
    tagName,
    {
      sourcePath: `src/components/${directoryName}/template.html`,
      tagName,
      nodes
    }
  ]);
}

const fileSource = [
  "import type { CompiledTemplateDefinition } from '../foundation/template.js';",
  '',
  'export const generatedComponentTemplates: Record<string, CompiledTemplateDefinition> = {',
  ...entries.map(([tagName, definition]) => `  ${JSON.stringify(tagName)}: ${JSON.stringify(definition)},`),
  '};',
  ''
].join('\n');

await writeFile(outputFilePath, fileSource, 'utf8');
