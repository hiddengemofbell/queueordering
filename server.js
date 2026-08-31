const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

// Connected SSE clients list
let sseClients = [];
let latestQueueState = null;
let latestCustomerTheme = null;

const server = http.createServer((req, res) => {
  const parsedUrl = req.url.split('?')[0];

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Server-Sent Events (SSE) Live Stream Endpoint
  if (parsedUrl === '/events' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    sseClients.push(res);
    console.log(`[SSE] New client connected. Total clients: ${sseClients.length}`);

    // Send initial cached state if available
    if (latestQueueState) {
      res.write(`event: queueState\ndata: ${JSON.stringify(latestQueueState)}\n\n`);
    }
    if (latestCustomerTheme) {
      res.write(`event: customerTheme\ndata: ${JSON.stringify({ theme: latestCustomerTheme })}\n\n`);
    }

    req.on('close', () => {
      sseClients = sseClients.filter(client => client !== res);
      console.log(`[SSE] Client disconnected. Total clients: ${sseClients.length}`);
    });
    return;
  }

  // 2. Queue State Broadcast Endpoint
  if (parsedUrl === '/api/queue-state' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        latestQueueState = JSON.parse(body);
        broadcastSSE('queueState', latestQueueState);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, clients: sseClients.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // 3. Customer Theme Broadcast Endpoint
  if (parsedUrl === '/api/customer-theme' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        latestCustomerTheme = data.theme;
        broadcastSSE('customerTheme', { theme: latestCustomerTheme });
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, clients: sseClients.length }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
    return;
  }

  // Static File Server
  let filePath = path.join(PUBLIC_DIR, parsedUrl === '/' ? 'index.html' : parsedUrl);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 Not Found</h1>', 'utf-8');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${err.code}`, 'utf-8');
      }
    } else {
      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache'
      });
      res.end(content, 'utf-8');
    }
  });
});

function broadcastSSE(eventType, data) {
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => {
    try {
      client.write(payload);
    } catch (e) {
      console.error('[SSE Broadcast Error]:', e);
    }
  });
}

server.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(` Queue Calling System Multi-Device Server Running!`);
  console.log(` - Staff Control Panel:     http://localhost:${PORT}/index.html`);
  console.log(` - Customer Display Panel:  http://localhost:${PORT}/customer.html`);
  console.log(` - Real-Time SSE Stream:    http://localhost:${PORT}/events`);
  console.log(`==================================================\n`);
});
