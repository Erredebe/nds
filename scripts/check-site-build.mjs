import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

const expectedFiles = [
  'site-dist/index.html',
  'site-dist/components/button/index.html',
  'site-dist/components/input/index.html',
  'site-dist/components/text/index.html',
  'site-dist/components/heading/index.html',
  'site-dist/components/box/index.html',
  'site-dist/components/stack/index.html',
  'site-dist/components/card/index.html',
  'site-dist/components/alert/index.html',
  'site-dist/dom-modes/index.html',
  'site-dist/dist/index.js',
  'site-dist/dist/styles.css'
];

await Promise.all(expectedFiles.map((relativePath) => access(resolve(process.cwd(), relativePath))));
