import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

await Promise.all([
  rm(resolve(process.cwd(), 'dist'), { force: true, recursive: true }),
  rm(resolve(process.cwd(), 'site-dist'), { force: true, recursive: true })
]);
