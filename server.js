require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./app');
const http = require('http');
const path = require('path');
const {Server} = require('socket.io');
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = new Server(server);

const temperatureState = {
  currentTemp: "Aguardando dados do sensor..."
};

app.set('temperatureState', temperatureState);

io.on('connection', (socket) => {
  console.log('Um usuário conectou via WebSocket');
  socket.emit('nova-temperatura', `A temperatura atual do laboratório é: ${temperatureState.currentTemp}°C`);

  socket.on('disconnect', () => {
    console.log('Usuário desconectou');
  });
});

app.set('io', io);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// Função assíncrona para iniciar o servidor e conectar ao MongoDB
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado ao MongoDB.');

    server.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (err) {
    console.error('Erro ao conectar com o MongoDB:', err);
  }
}

start();