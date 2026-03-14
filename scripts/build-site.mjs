import { cp, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDirectory = process.cwd();
const demoDirectory = resolve(rootDirectory, 'demo');
const distDirectory = resolve(rootDirectory, 'dist');
const outputDirectory = resolve(rootDirectory, 'site-dist');

await rm(outputDirectory, { force: true, recursive: true });
await mkdir(outputDirectory, { recursive: true });

await cp(demoDirectory, outputDirectory, { recursive: true });
await cp(distDirectory, resolve(outputDirectory, 'dist'), { recursive: true });
