import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
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

const toPascalCase = (parts) => parts.map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`).join('');
const toCamelCase = (value) => `${value[0]?.toLowerCase() ?? ''}${value.slice(1)}`;

const tokens = toTokens(rawName);

if (tokens.length === 0) {
  console.error('Nombre de componente invalido. Usa kebab-case o un nombre simple.');
  process.exit(1);
}

const folderName = tokens.join('-');
const classBaseName = toPascalCase(tokens);
const className = `NDS${classBaseName}Element`;
const defineFunctionName = `define${classBaseName}`;
const configPropertyName = toCamelCase(classBaseName);
const tagName = `nds-${folderName}`;
const blockClassName = tagName;
const componentDirectory = resolve(process.cwd(), 'src/components', folderName);

const patchRootIndex = async () => {
  const rootIndexPath = resolve(process.cwd(), 'src/index.ts');
  const rootIndexSource = await readFile(rootIndexPath, 'utf8');
  const importLine = `import { ${defineFunctionName} } from './components/${folderName}/index.js';`;
  const configLine = `  ${configPropertyName}?: DefineComponentOptions;`;
  const defineLine = `  ${defineFunctionName}(config.${configPropertyName});`;

  let nextSource = rootIndexSource;

  if (!nextSource.includes(importLine)) {
    nextSource = nextSource.replace(
      /import type \{ DefineComponentOptions \} from '\.\/foundation\/registry\.js';/,
      `${importLine}\nimport type { DefineComponentOptions } from './foundation/registry.js';`
    );
  }

  if (!nextSource.includes(configLine)) {
    const lines = nextSource.split('\n');
    const interfaceIndex = lines.findIndex((line) => line.includes('export interface DefineAllComponentsConfig'));
    const interfaceEndIndex = lines.findIndex((line, index) => index > interfaceIndex && line.trim() === '}');

    if (interfaceIndex !== -1 && interfaceEndIndex !== -1) {
      lines.splice(interfaceEndIndex, 0, configLine);
      nextSource = lines.join('\n');
    }
  }

  if (!nextSource.includes(defineLine)) {
    const lines = nextSource.split('\n');
    const functionIndex = lines.findIndex((line) => line.includes('export const defineAllComponents ='));
    const functionEndIndex = lines.findIndex((line, index) => index > functionIndex && line.trim() === '};');

    if (functionIndex !== -1 && functionEndIndex !== -1) {
      lines.splice(functionEndIndex, 0, defineLine);
      nextSource = lines.join('\n');
    }
  }

  await writeFile(rootIndexPath, nextSource, 'utf8');
};

const patchPackageJson = async () => {
  const packageJsonPath = resolve(process.cwd(), 'package.json');
  const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));
  const exportKey = `./${folderName}`;

  if (!packageJson.exports[exportKey]) {
    const nextExports = {};

    for (const [key, value] of Object.entries(packageJson.exports)) {
      if (key === './styles.css') {
        nextExports[exportKey] = {
          types: `./dist/components/${folderName}/index.d.ts`,
          import: `./dist/components/${folderName}/index.js`
        };
      }

      nextExports[key] = value;
    }

    packageJson.exports = nextExports;
  }

  await writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`, 'utf8');
};

try {
  await access(componentDirectory);
  console.error(`La carpeta ya existe: src/components/${folderName}`);
  process.exit(1);
} catch {
  // No existe: se puede continuar.
}

await mkdir(componentDirectory, { recursive: false });

const componentSource = `import { type DomMode, NDSComponentElement, attr, component } from '../../foundation/index.js';
import { escapeHtml } from '../../utils/dom.js';

@component({
  defaultDomMode: 'shadow',
  stylePath: './styles.css',
  tagName: '${tagName}'
})
export class ${className} extends NDSComponentElement {
  @attr.string() accessor text = '';

  protected override renderTemplate(mode: DomMode): string {
    const fallbackText = escapeHtml(this.defaultSlotFallbackText());
    const content =
      mode === 'shadow'
        ? \`<slot>\${fallbackText}</slot>\`
        : \`<span data-nds-slot-target="default">\${fallbackText}</span>\`;

    return \`<div part="root" class="${blockClassName}__root">\${content}</div>\`;
  }

  protected override defaultSlotFallbackText(): string {
    return this.text;
  }
}
`;

const stylesSource = `:host {
  display: block;
}

:host([hidden]) {
  display: none;
}

.${blockClassName}__root {
  display: block;
}
`;

const indexSource = `import { defineComponent, type DefineComponentOptions } from '../../foundation/index.js';
import { ${className} } from './component.js';

export { ${className} };

export const ${defineFunctionName} = (options: DefineComponentOptions = {}): CustomElementConstructor =>
  defineComponent(${className}, options);
`;

await Promise.all([
  writeFile(resolve(componentDirectory, 'component.ts'), componentSource, 'utf8'),
  writeFile(resolve(componentDirectory, 'styles.css'), stylesSource, 'utf8'),
  writeFile(resolve(componentDirectory, 'index.ts'), indexSource, 'utf8')
]);

await Promise.all([patchRootIndex(), patchPackageJson()]);

console.log(`Componente generado en src/components/${folderName}`);
console.log(`Tag: ${tagName}`);
console.log(`Clase: ${className}`);
console.log('');
console.log('Actualizaciones aplicadas:');
console.log('- src/index.ts');
console.log('- package.json (exports)');
