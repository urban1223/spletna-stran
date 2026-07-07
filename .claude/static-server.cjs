// Minimal static file server for local PWA testing (serves repo root).
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT || 4178;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2'
};

http.createServer((req, res) => {
  try {
    let p = decodeURIComponent(req.url.split('?')[0]);
    let fsPath = path.join(ROOT, p);
    if (!fsPath.startsWith(ROOT)) { res.writeHead(403).end('Forbidden'); return; }
    if (fs.existsSync(fsPath) && fs.statSync(fsPath).isDirectory()) {
      fsPath = path.join(fsPath, 'index.html');
    }
    if (!fs.existsSync(fsPath)) { res.writeHead(404).end('Not found'); return; }
    const ext = path.extname(fsPath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Service-Worker-Allowed': '/'
    });
    fs.createReadStream(fsPath).pipe(res);
  } catch (e) {
    res.writeHead(500).end(String(e));
  }
}).listen(PORT, () => console.log('Static server on http://localhost:' + PORT));
