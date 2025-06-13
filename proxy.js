const net = require('net');

const server = net.createServer(socket => {
  socket.once('data', data => {
    const reqStr = data.toString();

    if (!reqStr.includes('Upgrade: Websocket')) {
      socket.end();
      return;
    }

    const response = [
      'HTTP/1.1 101 Switching Protocols',
      'Upgrade: websocket',
      'Connection: Upgrade',
      '\r\n'
    ].join('\r\n');

    socket.write(response);

    const ssh = net.connect({ host: '5.34.178.157', port: 22 });

    let sshBannerReceived = false;
    let bufferedClientData = [];

    // Capturar datos SSH (banner)
    ssh.on('data', data => {
      if (!sshBannerReceived) {
        sshBannerReceived = true;
        // Enviar banner SSH al cliente
        socket.write(data);
        // Ahora reenviar los datos del cliente que quedaron en buffer
        bufferedClientData.forEach(chunk => ssh.write(chunk));
        bufferedClientData = [];
        // A partir de ahora, pipe normal
        socket.on('data', chunk => ssh.write(chunk));
      } else {
        socket.write(data);
      }
    });

    ssh.on('close', () => socket.end());
    ssh.on('error', () => {});
    socket.on('close', () => ssh.end());
    socket.on('error', () => {});

    // Antes de recibir el banner SSH, guardar datos del cliente en buffer
    socket.on('data', data => {
      if (!sshBannerReceived) {
        bufferedClientData.push(data);
      }
    });
  });
});

server.listen(8080);
