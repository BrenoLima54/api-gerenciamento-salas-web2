const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const bcrypt = require("bcrypt");

const router = express.Router();

router.post("/logar", async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ erro: "E-mail e senha são obrigatórios!" });
  }

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    // Compara senha inserida com a armazenada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ erro: "Credenciais inválidas" });
    }

    const token = jwt.sign(
      { id: usuario._id, email: usuario.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro interno no servidor" });
  }
});

module.exports = router;
