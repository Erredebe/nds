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
      'dist/styles.css'
    ];

    await Promise.all(
      expectedFiles.map((relativePath) => access(resolve(process.cwd(), relativePath)))
    );

    const packageJson = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf8'));
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
      './styles.css',
      './package.json'
    ]);
    expect(css).toContain('nds-button');
    expect(css).toContain('[data-nds-theme="dark"]');
  });
});
