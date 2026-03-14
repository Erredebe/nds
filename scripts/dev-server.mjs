import { createReadStream } from 'node:fs';
import { access, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, resolve } from 'node:path';

const rootDirectory = resolve(process.cwd());
const port = Number(process.env.PORT ?? 4173);

const mimeTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.map', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8']
]);

const sendResponse = (response, statusCode, body, contentType = 'text/plain; charset=utf-8') => {
  response.writeHead(statusCode, { 'Content-Type': contentType });
  response.end(body);
};

const resolveRequestPath = (requestUrl) => {
  const parsedUrl = new URL(requestUrl, `http://127.0.0.1:${port}`);
  const pathname = decodeURIComponent(parsedUrl.pathname);
  const safeSegments = pathname
    .split(/[\\/]+/)
    .filter((segment) => segment !== '' && segment !== '.' && segment !== '..');

  return resolve(rootDirectory, ...safeSegments);
};

const ensureInRoot = (filePath) => filePath === rootDirectory || filePath.startsWith(`${rootDirectory}\\`) || filePath.startsWith(`${rootDirectory}/`);

const server = createServer(async (request, response) => {
  if (!request.url) {
    sendResponse(response, 400, 'Bad request');
    return;
  }

  let filePath = resolveRequestPath(request.url);

  if (!ensureInRoot(filePath)) {
    sendResponse(response, 403, 'Forbidden');
    return;
  }

  try {
    const fileStats = await stat(filePath);

    if (fileStats.isDirectory()) {
      filePath = join(filePath, 'index.html');
    }

    await access(filePath);
  } catch {
    sendResponse(response, 404, 'Not found');
    return;
  }

  const contentType = mimeTypes.get(extname(filePath)) ?? 'application/octet-stream';

  response.writeHead(200, { 'Content-Type': contentType });
  createReadStream(filePath).pipe(response);
});

server.listen(port, () => {
  console.log(`no-dep-ds dev server running at http://localhost:${port}`);
  console.log(`basic example: http://localhost:${port}/examples/basic/`);
  console.log(`mixed dom example: http://localhost:${port}/examples/mixed-dom/`);
});
