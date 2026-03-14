import { mkdir, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const stylesModule = await import(pathToFileURL(resolve(process.cwd(), 'dist/styles.js')).href);
const css = stylesModule.createDesignSystemCss();
const outputPath = resolve(process.cwd(), 'dist/styles.css');

await mkdir(dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${css}\n`, 'utf8');
