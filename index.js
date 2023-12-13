const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Configurar el directorio de archivos estáticos
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

let sequenceInterval;
let sequenceCounter = 1;
let intervaloSlider = 1000;


function iniciarSecuencia() {
  console.log('Secuencia iniciada');
  sequenceInterval = setInterval(() => {
    io.emit('changeButtonColor', sequenceCounter);
    console.log(`Evento changeButtonColor emitido con buttonNumber: ${sequenceCounter}`);
    sequenceCounter = (sequenceCounter % 16) + 1;
  }, intervaloSlider);
}


io.on('connection', (socket) => {
  console.log('Usuario conectado');

  socket.on('startSequence', () => {
    console.log('Evento startSequence recibido');
    if (!sequenceInterval) {
      iniciarSecuencia();
    }
  });

  socket.on('sliderChange', (nuevoIntervalo) => {
    intervaloSlider = nuevoIntervalo;

    // Si la secuencia está en ejecución, detenerla y reiniciar con el nuevo intervalo
    if (sequenceInterval) {
      clearInterval(sequenceInterval);
      sequenceInterval = null;
      iniciarSecuencia();
    }
  });

  socket.on('pauseSequence', () => {
    console.log('Secuencia pausada');
    clearInterval(sequenceInterval);
    sequenceCounter = 1;
  });

  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
    clearInterval(sequenceInterval);
  });
});

// Mover la ruta de manejo de Express después de la configuración de Socket.IO
app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'index.html'));
});

// Agregar una ruta para manejar solicitudes GET y enviar un mensaje
app.get('/mensaje', (req, res) => {
  res.send('¡El servidor está funcionando!');
});

const PORT = process.env.PORT || 5500;
server.listen(PORT, () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
});