const express = require("express");
const app = express();
app.set("json spaces", 2);
require("dotenv").config();

// Rotas
const userRoutes = require('./routes/userRoutes');
const labRoutes = require('./routes/labRoutes');

// Middlewares
app.use(express.json());

// Registro das rotas
app.use('/user', userRoutes);
app.use('/laboratorio', labRoutes);

module.exports = app;
