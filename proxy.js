const WebSocket = require('ws');
const http = require('http');

const VPS_WS_URL = 'ws://5.34.178.157:2086/vpnjantit'; // Cambia por tu VPS y path

const server = http.createServer();

const wss = new WebSocket.Server({ noServer: true });

server.on('upgrade', function upgrade(request, socket, head) {
  // Solo aceptar upgrades websocket
  wss.handleUpgrade(request, socket, head, function done(wsClient) {
    console.log('Cliente WebSocket conectado a proxy (Google Cloud Run)');

    // Crear conexión cliente WS a VPS
    const wsVps = new WebSocket(VPS_WS_URL);

    wsVps.on('open', () => {
      console.log('Conectado a VPS WebSocket');

      // Pipe bidireccional de mensajes (proxy)
      wsClient.on('message', message => {
        wsVps.send(message);
      });

      wsVps.on('message', message => {
        wsClient.send(message);
      });

      // Manejar cierre desde cliente
      wsClient.on('close', () => {
        wsVps.close();
        console.log('Cliente desconectado');
      });

      // Manejar cierre desde VPS
      wsVps.on('close', () => {
        wsClient.close();
        console.log('Conexión con VPS cerrada');
      });
    });

    wsVps.on('error', err => {
      console.error('Error al conectar con VPS:', err.message);
      wsClient.close();
    });
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Proxy WebSocket escuchando en puerto ${PORT}`);
});
