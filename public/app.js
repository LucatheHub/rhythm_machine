const socket = io();
let secuenciaEnEjecucion = false;
let intervaloSlider = 1000;
let sequenceInterval;
let sequenceCounter = 1;
const audioMetro = new Audio('sonidos/metro.mp3');
const audioSnare = new Audio('sonidos/kick.mp3');


document.addEventListener('DOMContentLoaded', () => {
  const playAudio = (audio) => {
    if (secuenciaEnEjecucion) {
      audio.currentTime = 0;
      audio.play();
    }
  };

  const cambiarColorBoton = (numeroBoton) => {
    const boton = document.getElementById(`button${numeroBoton}`);
    boton.style.backgroundColor = 'yellow';
    setTimeout(() => {
      boton.style.backgroundColor = '';
    }, intervaloSlider);
  };

  const iniciarSecuencia = () => {
    console.log('Secuencia iniciada');
    sequenceInterval = setInterval(() => {
      cambiarColorBoton(sequenceCounter);

      // Reproduce el sonido del metrónomo
      playAudio(audioMetro);

      // Reproduce el sonido de la snare al mismo tiempo
      playAudio(audioSnare);

      socket.emit('changeButtonColor', sequenceCounter);
      sequenceCounter = (sequenceCounter % 16) + 1;
    }, intervaloSlider);
  };

  socket.on('connect', () => {
    console.log('Conectado al servidor');
  });

  socket.on('connect_error', (error) => {
    console.error('Error de conexión:', error);
  });

  socket.on('changeButtonColor', (numeroBoton) => {
    cambiarColorBoton(numeroBoton);
  });

  const detenerSecuencia = () => {
    console.log('Secuencia pausada');
    clearInterval(sequenceInterval);
    sequenceCounter = 1;
  };

  const actualizarIntervalo = (nuevoIntervalo) => {
    intervaloSlider = nuevoIntervalo;
    if (secuenciaEnEjecucion) {
      detenerSecuencia();
      iniciarSecuencia();
    }
  };

  const slider = document.getElementById('intervalSlider');
  const intervalValue = document.getElementById('intervalValue');
  const playButton = document.getElementById('play');
  const pauseButton = document.getElementById('pause');

  slider.addEventListener('input', () => {
    const nuevoIntervalo = parseInt(slider.value);
    intervalValue.textContent = nuevoIntervalo;
    actualizarIntervalo(nuevoIntervalo);
  });

  playButton.addEventListener('click', () => {
    if (!secuenciaEnEjecucion) {
      secuenciaEnEjecucion = true;
      iniciarSecuencia();
    }
  });

  pauseButton.addEventListener('click', () => {
    secuenciaEnEjecucion = false;
    detenerSecuencia();
    socket.emit('pauseSequence');
  });
});
