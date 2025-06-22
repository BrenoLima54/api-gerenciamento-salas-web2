const mongoose = require('mongoose');
const app = require('../app');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) return;

  try {
    const db = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    isConnected = db.connections[0].readyState === 1;

    if (isConnected) {
      console.log("Conectado ao MongoDB.");
    }
  } catch (err) {
    console.error("Erro ao conectar com o MongoDB:", err);
  }
}

connectToDatabase();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

module.exports = app;
