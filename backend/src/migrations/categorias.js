const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /categorias — lista todas
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias ORDER BY id ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /categorias — cria nova
router.post('/', auth, async (req, res) => {
  const { nome, emoji, tipo } = req.body;
  if (!nome || !tipo) return res.status(400).json({ erro: 'Nome e tipo são obrigatórios' });
  try {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nome,emoji,tipo) VALUES ($1,$2,$3) RETURNING *',
      [nome, emoji || null, tipo]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PUT /categorias/:id — edita
router.put('/:id', auth, async (req, res) => {
  const { nome, emoji, tipo } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE categorias SET nome=COALESCE($1,nome), emoji=COALESCE($2,emoji), tipo=COALESCE($3,tipo) WHERE id=$4 RETURNING *',
      [nome, emoji, tipo, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Categoria não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// DELETE /categorias/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM categorias WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
