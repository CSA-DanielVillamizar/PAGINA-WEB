// Servidor personalizado para Next.js en Azure App Service
// Ejecuta Next en modo producción escuchando el puerto asignado por la plataforma

const { createServer } = require('http');
const next = require('next');

const port = process.env.PORT || 8080;
const hostname = '0.0.0.0';

const app = next({ dev: false, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    handle(req, res);
  }).listen(port, hostname, () => {
    console.log(`> Next.js ready on http://${hostname}:${port}`);
  });
}).catch((err) => {
  console.error('Failed to start Next.js server:', err);
  process.exit(1);
});
