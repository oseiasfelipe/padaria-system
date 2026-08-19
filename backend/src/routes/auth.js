const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../config/db');
const authMw  = require('../middlewares/auth');
// POST /auth/login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha) return res.status(400).json({ erro: 'Email e senha obrigatórios' });
  try {
    const { rows } = await pool.query(
      'SELECT * FROM usuarios WHERE email=$1 AND ativo=true', [email]
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(senha, user.senha_hash))) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    const token = jwt.sign(
      { id: user.id, nome: user.nome, perfil: user.perfil },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES || '8h' }
    );
    res.json({ token, usuario: { id: user.id, nome: user.nome, email: user.email, perfil: user.perfil } });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
// GET /auth/me
router.get('/me', authMw, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id,nome,email,perfil FROM usuarios WHERE id=$1', [req.usuario.id]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});
