const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const User = require('../models/User');

router.post('/registrar', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(409).json({ erro: 'Usuário já existe' });
    }

    // Hasheando a senha manualmente
    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = new User({ email, senha: senhaHash });
    await usuario.save();

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
});

module.exports = router;
