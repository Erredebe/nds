import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('package contract', () => {
  it('keeps runtime dependencies empty', async () => {
    const packageJson = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf8'));

    expect(packageJson.dependencies).toEqual({});
    expect(packageJson.peerDependencies).toEqual({});
  });

  it('emits declaration files, component entrypoints and styles.css', async () => {
    const expectedFiles = [
      'dist/index.d.ts',
      'dist/components/button/index.d.ts',
      'dist/components/input/index.d.ts',
      'dist/components/text/index.d.ts',
      'dist/components/heading/index.d.ts',
      'dist/components/box/index.d.ts',
      'dist/components/stack/index.d.ts',
      'dist/components/card/index.d.ts',
      'dist/components/alert/index.d.ts',
      'dist/styles.css'
    ];

    await Promise.all(
      expectedFiles.map((relativePath) => access(resolve(process.cwd(), relativePath)))
    );

    const packageJson = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf8'));
    const generatedStyles = await readFile(resolve(process.cwd(), 'src/generated/component-styles.generated.ts'), 'utf8');
    const generatedTemplates = await readFile(resolve(process.cwd(), 'src/generated/component-templates.generated.ts'), 'utf8');
    const css = await readFile(resolve(process.cwd(), 'dist/styles.css'), 'utf8');

    expect(Object.keys(packageJson.exports)).toEqual([
      '.',
      './button',
      './input',
      './text',
      './heading',
      './box',
      './stack',
      './card',
      './alert',
      './styles.css',
      './package.json'
    ]);
    expect(generatedStyles).toContain("export const generatedLightStyles = [");
    expect(generatedStyles).toContain("'nds-button'");
    expect(generatedTemplates).toContain('src/components/button/template.html');
    expect(generatedTemplates).toContain('"nds-input"');
    expect(css).toContain('nds-button');
    expect(css).toContain('[data-nds-theme="dark"]');
  });

  it('ships required package metadata for publication', async () => {
    const packageJson = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf8'));

    await Promise.all([
      access(resolve(process.cwd(), 'README.md')),
      access(resolve(process.cwd(), 'LICENSE')),
      access(resolve(process.cwd(), 'CHANGELOG.md')),
      access(resolve(process.cwd(), 'CONTRIBUTING.md'))
    ]);

    expect(packageJson.license).toBe('MIT');
    expect(packageJson.type).toBe('module');
    expect(packageJson.engines.node).toBe('>=20');
    expect(packageJson.repository.url).toContain('github.com/Erredebe/nds');
    expect(packageJson.publishConfig.access).toBe('public');
  });

  it('supports consumer imports from the built package entrypoints', async () => {
    const rootModule = await import(resolve(process.cwd(), 'dist/index.js'));
    const buttonModule = await import(resolve(process.cwd(), 'dist/components/button/index.js'));
    const inputModule = await import(resolve(process.cwd(), 'dist/components/input/index.js'));
    const alertModule = await import(resolve(process.cwd(), 'dist/components/alert/index.js'));

    expect(typeof rootModule.defineAllComponents).toBe('function');
    expect(typeof rootModule.setTheme).toBe('function');
    expect(typeof buttonModule.defineButton).toBe('function');
    expect(typeof inputModule.defineInput).toBe('function');
    expect(typeof alertModule.defineAlert).toBe('function');
  });
});
