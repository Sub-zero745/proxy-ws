const WebSocket = require('ws');
const http = require('http');

// Servidor HTTP para manejar el Upgrade a WebSocket
const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('🌐 WebSocket proxy is running.\n');
});

// Servidor WebSocket (solo para path /vpnjantit)
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (clientSocket) => {
  console.log('✅ Cliente conectado al proxy');

  // Conectar a la VPS V2Ray vía WebSocket
  const vpsSocket = new WebSocket('ws://5.34.178.157:10000/vpnjantit');

  vpsSocket.on('open', () => {
    console.log('🔗 Conectado a la VPS');
    
    // Bidireccional
    clientSocket.on('message', (msg) => vpsSocket.send(msg));
    vpsSocket.on('message', (msg) => clientSocket.send(msg));

    clientSocket.on('close', () => vpsSocket.close());
    vpsSocket.on('close', () => clientSocket.close());
  });

  vpsSocket.on('error', (err) => {
    console.error('❌ Error en conexión con la VPS:', err.message);
    clientSocket.close();
  });
});

server.on('upgrade', (req, socket, head) => {
  if (req.url === '/vpnjantit') {
    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit('connection', ws, req);
    });
  } else {
    socket.destroy();
  }
});

// Puerto 8080 para Cloud Run
server.listen(8080, () => {
  console.log('🚀 Proxy WebSocket escuchando en el puerto 8080');
});
