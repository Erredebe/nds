import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('scaffold component script', () => {
  it('generates files and prevents overwrite', async () => {
    const temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'nds-scaffold-'));
    const scriptPath = resolve(process.cwd(), 'scripts/scaffold-component.mjs');
    const componentDirectory = resolve(temporaryDirectory, 'src/components');

    try {
      await mkdir(componentDirectory, { recursive: true });
      await writeFile(
        resolve(temporaryDirectory, 'package.json'),
        JSON.stringify(
          {
            name: 'fixture',
            exports: {
              '.': {
                types: './dist/index.d.ts',
                import: './dist/index.js'
              },
              './styles.css': './dist/styles.css',
              './package.json': './package.json'
            }
          },
          null,
          2
        ),
        'utf8'
      );
      await writeFile(
        resolve(temporaryDirectory, 'src/index.ts'),
        [
          "import type { DefineComponentOptions } from './foundation/registry.js';",
          '',
          'export interface DefineAllComponentsConfig {',
          '}',
          '',
          'export const defineAllComponents = (config: DefineAllComponentsConfig = {}): void => {',
          '};',
          ''
        ].join('\n'),
        'utf8'
      );

      const firstRun = await execFileAsync(process.execPath, [scriptPath, 'alertBox'], {
        cwd: temporaryDirectory
      });

      expect(firstRun.stdout).toContain('Componente generado en src/components/alert-box');
      expect(firstRun.stdout).toContain('Tag: nds-alert-box');
      expect(firstRun.stdout).toContain('Clase: NDSAlertBoxElement');
      expect(firstRun.stdout).toContain('Actualizaciones aplicadas:');

      const componentFile = await readFile(resolve(componentDirectory, 'alert-box/component.ts'), 'utf8');
      const stylesFile = await readFile(resolve(componentDirectory, 'alert-box/styles.css'), 'utf8');
      const indexFile = await readFile(resolve(componentDirectory, 'alert-box/index.ts'), 'utf8');
      const rootIndexFile = await readFile(resolve(temporaryDirectory, 'src/index.ts'), 'utf8');
      const packageJson = JSON.parse(await readFile(resolve(temporaryDirectory, 'package.json'), 'utf8'));

      expect(componentFile).toContain('export class NDSAlertBoxElement');
      expect(componentFile).toContain("@component({");
      expect(componentFile).toContain("tagName: 'nds-alert-box'");
      expect(stylesFile).toContain(':host {');
      expect(indexFile).toContain('export const defineAlertBox');
      expect(rootIndexFile).toContain("import { defineAlertBox } from './components/alert-box/index.js';");
      expect(rootIndexFile).toContain('  alertBox?: DefineComponentOptions;');
      expect(rootIndexFile).toContain('  defineAlertBox(config.alertBox);');
      expect(packageJson.exports['./alert-box']).toEqual({
        types: './dist/components/alert-box/index.d.ts',
        import: './dist/components/alert-box/index.js'
      });

      let overwriteError: Error | null = null;

      try {
        await execFileAsync(process.execPath, [scriptPath, 'alert-box'], {
          cwd: temporaryDirectory
        });
      } catch (error) {
        overwriteError = error as Error;
      }

      expect(overwriteError).not.toBeNull();
      expect((overwriteError as Error & { stderr?: string }).stderr).toContain(
        'La carpeta ya existe: src/components/alert-box'
      );
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });
});
