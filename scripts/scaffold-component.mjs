import { access, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rawName = process.argv[2]?.trim();

if (!rawName) {
  console.error('Uso: npm run scaffold:component -- <name>');
  process.exit(1);
}

const toTokens = (value) => {
  const normalized = value
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

  const tokens = normalized.split('-').filter(Boolean);

  if (tokens[0] === 'nds') {
    tokens.shift();
  }

  return tokens;
};

const tokens = toTokens(rawName);

if (tokens.length === 0) {
  console.error('Nombre de componente invalido. Usa kebab-case o un nombre simple.');
  process.exit(1);
}

const toPascalCase = (parts) => parts.map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`).join('');
const toCamelCase = (value) => `${value[0]?.toLowerCase() ?? ''}${value.slice(1)}`;

const folderName = tokens.join('-');
const classBaseName = toPascalCase(tokens);
const className = `NDS${classBaseName}Element`;
const defineFunctionName = `define${classBaseName}`;
const renderFunctionName = `render${classBaseName}Template`;
const styleBaseName = toCamelCase(classBaseName);
const shadowStylesName = `${styleBaseName}ShadowStyles`;
const lightStylesName = `${styleBaseName}LightStyles`;
const tagName = `nds-${folderName}`;
const blockClassName = tagName;

const componentDirectory = resolve(process.cwd(), 'src/components', folderName);

try {
  await access(componentDirectory);
  console.error(`La carpeta ya existe: src/components/${folderName}`);
  process.exit(1);
} catch {
  // No existe: se puede continuar.
}

await mkdir(componentDirectory, { recursive: false });

const componentSource = `import { NDSComponentElement, type NDSComponentDefinition } from '../../foundation/component.js';
import { stringAttribute } from '../../utils/attributes.js';
import { ${shadowStylesName} } from './styles.js';
import { ${renderFunctionName} } from './template.js';

export class ${className} extends NDSComponentElement {
  static definition: NDSComponentDefinition<${className}> = {
    tagName: '${tagName}',
    observedAttributes: ['text'],
    shadowStyles: ${shadowStylesName},
    defaultDomMode: 'shadow',
    renderTemplate: ${renderFunctionName},
    getDefaultSlotFallbackText: (element) => stringAttribute(element, 'text')
  };
}
`;

const templateSource = `import type { DomMode } from '../../foundation/base-element.js';
import { stringAttribute } from '../../utils/attributes.js';
import { escapeHtml } from '../../utils/dom.js';
import type { ${className} } from './component.js';

export const ${renderFunctionName} = (element: ${className}, mode: DomMode): string => {
  const fallbackText = escapeHtml(stringAttribute(element, 'text'));
  const content =
    mode === 'shadow'
      ? \`<slot>\${fallbackText}</slot>\`
      : \`<span data-nds-slot-target="default">\${fallbackText}</span>\`;

  return \`<div part="root" class="${blockClassName}__root">\${content}</div>\`;
};
`;

const stylesSource = `export const ${shadowStylesName} = \`
:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

.${blockClassName}__root {
  display: block;
}
\`.trim();

export const ${lightStylesName} = \`
${tagName} {
  display: block;
}

${tagName}[hidden] {
  display: none;
}

${tagName} .${blockClassName}__root {
  display: block;
}
\`.trim();
`;

const indexSource = `import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { ${className} } from './component.js';

export { ${className} };

export const ${defineFunctionName} = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(${className}, options);
`;

await Promise.all([
  writeFile(resolve(componentDirectory, 'component.ts'), componentSource, 'utf8'),
  writeFile(resolve(componentDirectory, 'template.ts'), templateSource, 'utf8'),
  writeFile(resolve(componentDirectory, 'styles.ts'), stylesSource, 'utf8'),
  writeFile(resolve(componentDirectory, 'index.ts'), indexSource, 'utf8')
]);

console.log(`Componente generado en src/components/${folderName}`);
console.log(`Tag: ${tagName}`);
console.log(`Clase: ${className}`);
console.log('');
console.log('Pasos manuales pendientes:');
console.log('- Actualizar src/index.ts');
console.log('- Actualizar src/styles.ts');
console.log('- Actualizar package.json (exports si aplica)');
console.log('- Actualizar tests/examples');
