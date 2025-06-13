const http = require('http');
const WebSocket = require('ws');

// Servidor HTTP que escucha solicitudes WebSocket
const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200);
    res.end('OK');
  }
});

// Servidor WebSocket en el puerto 8080
const wss = new WebSocket.Server({ server });

wss.on('connection', clientSocket => {
  console.log('🟢 Cliente conectado (Google Cloud Run)');

  // Conectar a tu VPS por WebSocket (puerto 2086)
  const targetSocket = new WebSocket('ws://199.195.249.27:80');

  targetSocket.on('open', () => {
    console.log('🔗 Conectado al WebSocket de la VPS');

    // Redirección cliente → VPS
    clientSocket.on('message', data => {
      targetSocket.send(data);
    });

    // Redirección VPS → cliente
    targetSocket.on('message', data => {
      clientSocket.send(data);
    });
  });

  // Manejo de errores y cierre
  clientSocket.on('close', () => targetSocket.close());
  targetSocket.on('close', () => clientSocket.close());

  clientSocket.on('error', () => {});
  targetSocket.on('error', () => {});
});

server.listen(8080, () => {
  console.log('🚀 Proxy WebSocket escuchando en el puerto 8080');
});
