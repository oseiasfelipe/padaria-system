const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /produtos
router.get('/', auth, async (req, res) => {
  try {
    const { tipo, disponivel } = req.query;
    let q = `SELECT p.*, c.nome as categoria_nome, c.emoji as categoria_emoji
             FROM produtos p LEFT JOIN categorias c ON c.id=p.categoria_id WHERE 1=1`;
    const vals = [];
    if (tipo)       { vals.push(tipo);       q += ` AND p.tipo=$${vals.length}`; }
    if (disponivel) { vals.push(disponivel==='true'); q += ` AND p.disponivel=$${vals.length}`; }
    q += ' ORDER BY p.nome';
    const { rows } = await pool.query(q, vals);
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /produtos
router.post('/', auth, async (req, res) => {
  const { nome, preco, categoria_id, tipo, venda_peso, estoque, codbarra } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO produtos (nome,preco,categoria_id,tipo,venda_peso,estoque,codbarra)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [nome, preco, categoria_id, tipo||'padaria', venda_peso||false, estoque||null, codbarra||'']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PUT /produtos/:id
router.put('/:id', auth, async (req, res) => {
  const { nome, preco, categoria_id, venda_peso, estoque, codbarra, disponivel } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE produtos SET nome=$1,preco=$2,categoria_id=$3,venda_peso=$4,
       estoque=$5,codbarra=$6,disponivel=$7 WHERE id=$8 RETURNING *`,
      [nome, preco, categoria_id, venda_peso, estoque, codbarra, disponivel, req.params.id]
    );
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// DELETE /produtos/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM produtos WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /produtos/categorias
router.get('/categorias', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM categorias WHERE ativo=true ORDER BY tipo,nome');
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /produtos/categorias
router.post('/categorias', auth, async (req, res) => {
  const { nome, emoji, tipo } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO categorias (nome,emoji,tipo) VALUES ($1,$2,$3) RETURNING *',
      [nome, emoji||'🍞', tipo||'padaria']
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
