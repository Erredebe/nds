import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm } from 'node:fs/promises';
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

      const firstRun = await execFileAsync(process.execPath, [scriptPath, 'alertBox'], {
        cwd: temporaryDirectory
      });

      expect(firstRun.stdout).toContain('Componente generado en src/components/alert-box');
      expect(firstRun.stdout).toContain('Tag: nds-alert-box');
      expect(firstRun.stdout).toContain('Clase: NDSAlertBoxElement');
      expect(firstRun.stdout).toContain('Pasos manuales pendientes:');

      const componentFile = await readFile(resolve(componentDirectory, 'alert-box/component.ts'), 'utf8');
      const templateFile = await readFile(resolve(componentDirectory, 'alert-box/template.ts'), 'utf8');
      const stylesFile = await readFile(resolve(componentDirectory, 'alert-box/styles.ts'), 'utf8');
      const indexFile = await readFile(resolve(componentDirectory, 'alert-box/index.ts'), 'utf8');

      expect(componentFile).toContain('export class NDSAlertBoxElement');
      expect(componentFile).toContain("tagName: 'nds-alert-box'");
      expect(templateFile).toContain('export const renderAlertBoxTemplate');
      expect(stylesFile).toContain('export const alertBoxShadowStyles');
      expect(indexFile).toContain('export const defineAlertBox');

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
