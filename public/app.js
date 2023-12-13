const socket = io();
let secuenciaEnEjecucion = false;
let intervaloSlider = 1000;
let sequenceInterval;
let sequenceCounter = 1;
const audioMetro = new Audio('sonidos/metro.mp3');
const audioSnare = new Audio('sonidos/kick.mp3');
let audioNuevo;

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

      // Reproduce el nuevo sonido si está definido
      if (audioNuevo) {
        playAudio(audioNuevo);
      }

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

    // Detener el nuevo audio si está definido
    if (audioNuevo) {
      audioNuevo.pause();
      audioNuevo.currentTime = 0;
    }
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

  const dropArea = document.getElementById('drop-area');
  const fileInput = document.getElementById('file-input');

  // Manejar el evento de soltar en el área
  dropArea.addEventListener('drop', handleDrop);

  // Evitar el comportamiento predeterminado para el área de soltar
  dropArea.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  // Manejar el evento de clic en el área para abrir el selector de archivos
  dropArea.addEventListener('click', () => {
    fileInput.click();
  });

  // Manejar el evento de cambio en el input de archivos
  fileInput.addEventListener('change', (event) => {
    handleFiles(event.target.files);
  });

  function handleFiles(files) {
    if (files.length > 0) {
      const file = files[0];
      loadAudio(file);
    } else {
      console.error('No se ha seleccionado ningún archivo.');
    }
  }

  // Función para manejar archivos soltados en el área
  function handleDrop(e) {
    e.preventDefault();
    const files = e.dataTransfer.files;
    handleFiles(files);
  }

  function loadAudio(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
      const audioUrl = e.target.result;
      audioNuevo = new Audio(audioUrl);
    };

    reader.readAsDataURL(file);
  }
});
