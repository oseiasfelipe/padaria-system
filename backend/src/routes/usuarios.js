const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const pool    = require('../config/db');
const auth    = require('../middlewares/auth');

// GET /usuarios — lista todos
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nome, email, perfil, ativo, criado_em FROM usuarios ORDER BY criado_em'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /usuarios — cria novo
router.post('/', auth, async (req, res) => {
  const { nome, email, perfil, pin, ativo } = req.body;
  if (!nome || !email || !pin) return res.status(400).json({ erro: 'Nome, email e PIN obrigatórios' });
  try {
    const senha_hash = await bcrypt.hash(pin, 10);
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, perfil, ativo)
       VALUES ($1,$2,$3,$4,$5) RETURNING id, nome, email, perfil, ativo, criado_em`,
      [nome, email, senha_hash, perfil||'atendente', ativo!==false]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ erro: 'Email já cadastrado' });
    res.status(500).json({ erro: err.message });
  }
});

// PUT /usuarios/:id — atualiza
router.put('/:id', auth, async (req, res) => {
  const { nome, email, perfil, pin, ativo } = req.body;
  try {
    if (pin && pin.length >= 4) {
      const senha_hash = await bcrypt.hash(pin, 10);
      await pool.query(
        'UPDATE usuarios SET nome=$1,email=$2,perfil=$3,ativo=$4,senha_hash=$5 WHERE id=$6',
        [nome, email, perfil, ativo, senha_hash, req.params.id]
      );
    } else {
      await pool.query(
        'UPDATE usuarios SET nome=$1,email=$2,perfil=$3,ativo=$4 WHERE id=$5',
        [nome, email, perfil, ativo, req.params.id]
      );
    }
    const { rows } = await pool.query(
      'SELECT id,nome,email,perfil,ativo,criado_em FROM usuarios WHERE id=$1', [req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PATCH /usuarios/:id/toggle — ativa/desativa
router.patch('/:id/toggle', auth, async (req, res) => {
  try {
    await pool.query('UPDATE usuarios SET ativo = NOT ativo WHERE id=$1', [req.params.id]);
    const { rows } = await pool.query('SELECT id,nome,email,perfil,ativo FROM usuarios WHERE id=$1', [req.params.id]);
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// DELETE /usuarios/:id
router.delete('/:id', auth, async (req, res) => {
  if (req.params.id === '1') return res.status(400).json({ erro: 'Admin padrão não pode ser removido' });
  try {
    await pool.query('DELETE FROM usuarios WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
