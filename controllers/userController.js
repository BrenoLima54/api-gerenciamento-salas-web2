const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.create = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'Email e senha são obrigatórios' });
  }

  try {
    const usuarioExistente = await User.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ erro: 'Usuário já existe' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const usuario = new User({ email, senha: senhaHash });
    await usuario.save();

    res.status(201).json({ mensagem: 'Usuário registrado com sucesso' });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
};

exports.logar = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: 'E-mail e senha são obrigatórios!' });
  }

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
};
