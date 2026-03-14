import { access, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const rootDirectory = process.cwd();
const packageJsonPath = resolve(rootDirectory, 'package.json');
const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf8'));

const requiredTopLevelFields = ['name', 'version', 'description', 'license', 'type', 'exports', 'files', 'types'];

for (const fieldName of requiredTopLevelFields) {
  if (!packageJson[fieldName]) {
    throw new Error(`package.json must define '${fieldName}'.`);
  }
}

if (packageJson.type !== 'module') {
  throw new Error("package.json must keep 'type' set to 'module'.");
}

if (!Array.isArray(packageJson.files) || !packageJson.files.includes('dist')) {
  throw new Error("package.json must publish the 'dist' directory.");
}

const exportEntries = Object.entries(packageJson.exports ?? {});

if (exportEntries.length === 0) {
  throw new Error('package.json must expose at least one export.');
}

for (const [exportKey, exportValue] of exportEntries) {
  if (typeof exportValue === 'string') {
    await access(resolve(rootDirectory, exportValue));
    continue;
  }

  if (!exportValue || typeof exportValue !== 'object') {
    throw new Error(`Export '${exportKey}' must be a string or condition object.`);
  }

  const supportedConditions = ['types', 'import'];

  for (const conditionName of supportedConditions) {
    const relativePath = exportValue[conditionName];

    if (!relativePath) {
      throw new Error(`Export '${exportKey}' must define '${conditionName}'.`);
    }

    await access(resolve(rootDirectory, relativePath));
  }
}

await access(resolve(rootDirectory, 'README.md'));
await access(resolve(rootDirectory, 'LICENSE'));
