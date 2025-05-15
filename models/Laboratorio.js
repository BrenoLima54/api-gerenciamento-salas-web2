const mongoose = require("mongoose");

const LaboratorioSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  foto: { type: String },
  capacidade: { type: Number },
});

module.exports = mongoose.model("Laboratorio", LaboratorioSchema);
