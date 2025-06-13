const http = require('http');
const WebSocket = require('ws');

const server = http.createServer((req, res) => {
  // Verificar si es solicitud WebSocket
  if (
    req.headers['upgrade'] &&
    req.headers['upgrade'].toLowerCase() === 'websocket'
  ) {
    // No respondemos aquí, dejar que lo maneje ws
    return;
  }

  // Si no es WebSocket, responder 200 OK (para que Google Cloud Run no dé error)
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('OK');
});

const wss = new WebSocket.Server({ noServer: true });

// Manejo de conexión WebSocket entrante
wss.on('connection', (clientWs) => {
  console.log('🌐 Cliente conectado vía WebSocket');

  // Conexión WebSocket hacia tu VPS
  const vpsWs = new WebSocket('ws://5.34.178.157:2086');

  vpsWs.on('open', () => {
    console.log('🔗 Conectado a VPS WebSocket');

    // Cliente -> VPS
    clientWs.on('message', (msg) => {
      if (vpsWs.readyState === WebSocket.OPEN) {
        vpsWs.send(msg);
      }
    });

    // VPS -> Cliente
    vpsWs.on('message', (msg) => {
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(msg);
      }
    });
  });

  // Cierre y errores
  const closeAll = () => {
    if (clientWs.readyState === WebSocket.OPEN) clientWs.close();
    if (vpsWs.readyState === WebSocket.OPEN) vpsWs.close();
  };

  clientWs.on('close', closeAll);
  clientWs.on('error', closeAll);
  vpsWs.on('close', closeAll);
  vpsWs.on('error', closeAll);
});

// Enlace de HTTP con WebSocket
server.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`✅ Proxy WebSocket escuchando en el puerto ${PORT}`);
});
