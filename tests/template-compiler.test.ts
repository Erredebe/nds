import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

describe('template compiler diagnostics', () => {
  it('fails with a readable error for invalid expressions', async () => {
    const temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'nds-template-'));
    const scriptPath = resolve(process.cwd(), 'scripts/generate-component-templates.mjs');

    try {
      await mkdir(resolve(temporaryDirectory, 'src/components/bad'), { recursive: true });
      await writeFile(resolve(temporaryDirectory, 'src/components/bad/template.html'), '<div [value]="foo("></div>', 'utf8');

      let failure: Error | null = null;

      try {
        await execFileAsync(process.execPath, [scriptPath], {
          cwd: temporaryDirectory
        });
      } catch (error) {
        failure = error as Error;
      }

      expect(failure).not.toBeNull();
      expect((failure as Error & { stderr?: string }).stderr || String(failure)).toContain(
        'Expresion invalida en src/components/bad/template.html [value]'
      );
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });

  it('fails when a non-event binding contains an assignment', async () => {
    const temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'nds-template-'));
    const scriptPath = resolve(process.cwd(), 'scripts/generate-component-templates.mjs');

    try {
      await mkdir(resolve(temporaryDirectory, 'src/components/bad'), { recursive: true });
      await writeFile(resolve(temporaryDirectory, 'src/components/bad/template.html'), '<div [value]="count = 1"></div>', 'utf8');

      let failure: Error | null = null;

      try {
        await execFileAsync(process.execPath, [scriptPath], {
          cwd: temporaryDirectory
        });
      } catch (error) {
        failure = error as Error;
      }

      expect(failure).not.toBeNull();
      expect((failure as Error & { stderr?: string }).stderr || String(failure)).toContain(
        'Assignments are only allowed in event statements.'
      );
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });

  it('fails when a template uses blocked property bindings', async () => {
    const temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'nds-template-'));
    const scriptPath = resolve(process.cwd(), 'scripts/generate-component-templates.mjs');

    try {
      await mkdir(resolve(temporaryDirectory, 'src/components/bad'), { recursive: true });
      await writeFile(resolve(temporaryDirectory, 'src/components/bad/template.html'), '<iframe [srcdoc]="html"></iframe>', 'utf8');

      let failure: Error | null = null;

      try {
        await execFileAsync(process.execPath, [scriptPath], {
          cwd: temporaryDirectory
        });
      } catch (error) {
        failure = error as Error;
      }

      expect(failure).not.toBeNull();
      expect((failure as Error & { stderr?: string }).stderr || String(failure)).toContain(
        'Binding de propiedad no permitido'
      );
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });

  it('generates templates for valid Angular-like bindings', async () => {
    const temporaryDirectory = await mkdtemp(resolve(tmpdir(), 'nds-template-'));
    const scriptPath = resolve(process.cwd(), 'scripts/generate-component-templates.mjs');

    try {
      await mkdir(resolve(temporaryDirectory, 'src/components/good'), { recursive: true });
      await mkdir(resolve(temporaryDirectory, 'src/generated'), { recursive: true });
      await writeFile(
        resolve(temporaryDirectory, 'src/components/good/template.html'),
        '<ul><li *for="item, index in items; trackBy: item.id">{{ item.label }}</li></ul>',
        'utf8'
      );

      await execFileAsync(process.execPath, [scriptPath], {
        cwd: temporaryDirectory
      });

      const output = await readFile(resolve(temporaryDirectory, 'src/generated/component-templates.generated.ts'), 'utf8');

      expect(output).toContain('trackByExpression');
      expect(output).toContain('item.id');
    } finally {
      await rm(temporaryDirectory, { force: true, recursive: true });
    }
  });
});
