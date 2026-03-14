import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const packageJsonPath = resolve(process.cwd(), 'package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

const requiredExports = ['.', './alert', './styles.css', './package.json'];

const dependencyCount = Object.keys(packageJson.dependencies ?? {}).length;
const peerDependencyCount = Object.keys(packageJson.peerDependencies ?? {}).length;

if (dependencyCount !== 0) {
  throw new Error('package.json must keep dependencies empty.');
}

if (peerDependencyCount !== 0) {
  throw new Error('package.json must keep peerDependencies empty.');
}

for (const exportKey of requiredExports) {
  if (!(exportKey in (packageJson.exports ?? {}))) {
    throw new Error(`Missing export subpath: ${exportKey}`);
  }
}

const distDirectory = resolve(process.cwd(), 'dist');
const jsFiles = [];

const walk = async (directoryPath) => {
  const entries = await import('node:fs/promises').then(({ readdir }) =>
    readdir(directoryPath, { withFileTypes: true })
  );

  for (const entry of entries) {
    const entryPath = resolve(directoryPath, entry.name);

    if (entry.isDirectory()) {
      await walk(entryPath);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      jsFiles.push(entryPath);
    }
  }
};

await walk(distDirectory);

const importPattern =
  /\b(?:import|export)\s+(?:[^'"]*?\s+from\s+)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;

for (const filePath of jsFiles) {
  const fileContent = await readFile(filePath, 'utf8');

  for (const match of fileContent.matchAll(importPattern)) {
    const specifier = match[1] ?? match[2];

    if (!specifier) {
      continue;
    }

    if (
      specifier.startsWith('./') ||
      specifier.startsWith('../') ||
      specifier.startsWith('/') ||
      specifier.startsWith('node:')
    ) {
      continue;
    }

    throw new Error(`Bare runtime import found in ${filePath}: ${specifier}`);
  }
}
