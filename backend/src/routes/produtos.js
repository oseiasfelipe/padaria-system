const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /produtos — lista todos os ativos
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM produtos WHERE ativo=true ORDER BY nome ASC'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /produtos/codbarra/:codigo — busca por código de barras (usado no
// leitor do Estoque e no PDV Mercado)
router.get('/codbarra/:codigo', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM produtos WHERE codbarra=$1 AND ativo=true', [req.params.codigo]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /produtos — cria novo
router.post('/', auth, async (req, res) => {
  const { nome, preco, categoria_id, tipo, venda_peso, estoque, codbarra, imagem } = req.body;
  if (!nome || preco === undefined || !tipo) {
    return res.status(400).json({ erro: 'Nome, preço e tipo são obrigatórios' });
  }
  try {
    const { rows } = await pool.query(
      `INSERT INTO produtos (nome,preco,categoria_id,tipo,venda_peso,estoque,codbarra,imagem)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [nome, preco, categoria_id || null, tipo, !!venda_peso, estoque ?? null, codbarra || null, imagem || null]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PUT /produtos/:id — edita campos (cadastro)
router.put('/:id', auth, async (req, res) => {
  const { nome, preco, categoria_id, tipo, venda_peso, estoque, codbarra, imagem } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE produtos SET
         nome=COALESCE($1,nome), preco=COALESCE($2,preco),
         categoria_id=COALESCE($3,categoria_id), tipo=COALESCE($4,tipo),
         venda_peso=COALESCE($5,venda_peso), estoque=$6,
         codbarra=COALESCE($7,codbarra), imagem=COALESCE($8,imagem),
         atualizado_em=NOW()
       WHERE id=$9 RETURNING *`,
      [nome, preco, categoria_id, tipo, venda_peso, estoque ?? null, codbarra, imagem, req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PATCH /produtos/:id/estoque — ajusta estoque por delta (botões +/- do Estoque)
// body: { delta: 1 } ou { delta: -1 }, ou { definir: 30 } para setar valor absoluto
router.patch('/:id/estoque', auth, async (req, res) => {
  const { delta, definir } = req.body;
  try {
    let rows;
    if (definir !== undefined) {
      ({ rows } = await pool.query(
        'UPDATE produtos SET estoque=GREATEST(0,$1), atualizado_em=NOW() WHERE id=$2 RETURNING *',
        [definir, req.params.id]
      ));
    } else {
      ({ rows } = await pool.query(
        'UPDATE produtos SET estoque=GREATEST(0,COALESCE(estoque,0)+$1), atualizado_em=NOW() WHERE id=$2 RETURNING *',
        [delta || 0, req.params.id]
      ));
    }
    if (!rows[0]) return res.status(404).json({ erro: 'Produto não encontrado' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// DELETE /produtos/:id — remoção lógica (mantém histórico de vendas íntegro)
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('UPDATE produtos SET ativo=false, atualizado_em=NOW() WHERE id=$1', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
