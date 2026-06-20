const http   = require('http');
const fs     = require('fs');
const path   = require('path');
const os     = require('os');
const { execFile } = require('child_process');

const PORT      = 3000;
const BASE_DIR  = path.join(os.homedir(), '.mrsauravsahu', 'paper');
const SAVE_DIR  = path.join(BASE_DIR, 'examples');
const PAPER_BIN = path.join(BASE_DIR, 'paper');


const MIME = {
  '.html': 'text/html',
  '.js':   'text/javascript',
  '.css':  'text/css',
};

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'GET' && req.url.startsWith('/load')) {
    const params = new URL(req.url, 'http://localhost').searchParams;
    const safe = path.basename(params.get('file') || 'document.md');
    const filePath = path.join(SAVE_DIR, safe);
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) { res.writeHead(404, { 'Content-Type': 'application/json' }); res.end(JSON.stringify({ error: 'not found' })); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ content: data }));
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/save') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filename, content } = JSON.parse(body);
        const safe = path.basename(filename || 'document.md');
        const dest = path.join(SAVE_DIR, safe);
        fs.writeFileSync(dest, content, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ saved: dest }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  if (req.method === 'POST' && req.url === '/pdf') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filename, content } = JSON.parse(body);
        const safe    = path.basename(filename || 'document.md');
        const mdPath  = path.join(SAVE_DIR, safe);
        const pdfName = safe.replace(/\.md$/, '.pdf');
        const pdfPath = path.join(SAVE_DIR, pdfName);
        fs.writeFileSync(mdPath, content, 'utf8');
        execFile(PAPER_BIN, [mdPath, '-o', pdfPath, '-n'], (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
            return;
          }
          fs.readFile(pdfPath, (err2, data) => {
            if (err2) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: err2.message }));
              return;
            }
            res.writeHead(200, {
              'Content-Type': 'application/pdf',
              'Content-Disposition': `attachment; filename="${pdfName}"`,
              'Content-Length': data.length,
            });
            res.end(data);
          });
        });
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // Serve static files from editor/
  const urlPath = new URL(req.url, 'http://localhost').pathname;
  const filePath = path.join(__dirname, urlPath === '/' ? '/index.html' : urlPath);
  const ext = path.extname(filePath);

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`Paper editor running at http://localhost:${PORT}`);
  console.log(`Saving to: ${SAVE_DIR}`);
});
