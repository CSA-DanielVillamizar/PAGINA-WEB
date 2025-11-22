#!/usr/bin/env node
/**
 * Servidor HTTP mínimo para health check independiente de NestJS.
 * Este script arranca inmediatamente y permite diagnosticar si el problema es Node.js o NestJS.
 */
const http = require('http');

const PORT = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      service: 'lama-backend-minimal',
      timestamp: new Date().toISOString(),
      node: process.version,
      uptime: process.uptime()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[HEALTHCHECK] Servidor mínimo escuchando en puerto ${PORT}`);
  console.log(`[HEALTHCHECK] Node.js ${process.version}`);
  console.log(`[HEALTHCHECK] DISABLE_DB=${process.env.DISABLE_DB}`);
});

server.on('error', (err) => {
  console.error('[HEALTHCHECK] Error del servidor:', err);
  process.exit(1);
});
