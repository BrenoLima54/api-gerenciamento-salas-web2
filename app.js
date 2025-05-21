const express = require("express");
const app = express();
const limitaDias = require('./middlewares/closedDays');
app.set("json spaces", 2);
require("dotenv").config();

app.use(limitaDias);

// Rotas
const userRoutes = require('./routes/userRoutes');
const labRoutes = require('./routes/labRoutes');

// Middlewares
app.use(express.json());

// Registro das rotas
app.use('/user', userRoutes);
app.use('/laboratorio', labRoutes);

module.exports = app;
