const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /comandas — lista abertas
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT c.*, m.numero as mesa_numero
       FROM comandas c LEFT JOIN mesas m ON m.id=c.mesa_id
       WHERE c.status='aberta' ORDER BY c.aberta_em DESC`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /comandas/historico
router.get('/historico', auth, async (req, res) => {
  try {
    const { data } = req.query;
    let q = `SELECT c.*, m.numero as mesa_numero FROM comandas c
             LEFT JOIN mesas m ON m.id=c.mesa_id WHERE c.status='fechada'`;
    const vals = [];
    if (data) { vals.push(data); q += ` AND c.aberta_em::date=$${vals.length}`; }
    q += ' ORDER BY c.fechada_em DESC LIMIT 200';
    const { rows } = await pool.query(q, vals);
    // buscar itens e pagamentos para cada comanda
    for (const c of rows) {
      const { rows: itens } = await pool.query('SELECT * FROM itens_comanda WHERE comanda_id=$1', [c.id]);
      const { rows: pags  } = await pool.query('SELECT * FROM pagamentos WHERE comanda_id=$1', [c.id]);
      c.itens = itens; c.pagamentos = pags;
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /comandas — abre nova comanda
router.post('/', auth, async (req, res) => {
  const { tipo, mesa_id, nome_cliente } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO comandas (tipo,mesa_id,nome_cliente,atendente_id)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [tipo, mesa_id||null, nome_cliente||null, req.usuario.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /comandas/:id — detalhe com itens
router.get('/:id', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comandas WHERE id=$1', [req.params.id]);
    if (!rows[0]) return res.status(404).json({ erro: 'Comanda não encontrada' });
    const { rows: itens } = await pool.query('SELECT * FROM itens_comanda WHERE comanda_id=$1', [req.params.id]);
    res.json({ ...rows[0], itens });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /comandas/:id/itens — adiciona item
router.post('/:id/itens', auth, async (req, res) => {
  const { produto_id, nome_produto, preco_unit, qtd, peso_kg, total_item } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO itens_comanda (comanda_id,produto_id,nome_produto,preco_unit,qtd,peso_kg,total_item)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.params.id, produto_id, nome_produto, preco_unit, qtd||1, peso_kg||null, total_item]
    );
    // baixa estoque se mercado
    if (qtd && !peso_kg) {
      await pool.query(
        'UPDATE produtos SET estoque=GREATEST(0,estoque-$1) WHERE id=$2 AND estoque IS NOT NULL',
        [qtd, produto_id]
      );
    }
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// DELETE /comandas/:id/itens/:itemId
router.delete('/:id/itens/:itemId', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM itens_comanda WHERE id=$1 AND comanda_id=$2',
      [req.params.itemId, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /comandas/:id/fechar
router.post('/:id/fechar', auth, async (req, res) => {
  const { total_final, pagamentos, nome_cliente } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `UPDATE comandas SET status='fechada',total_final=$1,fechada_em=NOW(),nome_cliente=COALESCE($2,nome_cliente)
       WHERE id=$3`,
      [total_final, nome_cliente||null, req.params.id]
    );
    for (const p of (pagamentos||[])) {
      await client.query(
        'INSERT INTO pagamentos (comanda_id,forma,valor,troco) VALUES ($1,$2,$3,$4)',
        [req.params.id, p.forma, p.valor, p.troco||0]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally { client.release(); }
});

// PATCH /comandas/:id/cliente
router.patch('/:id/cliente', auth, async (req, res) => {
  try {
    await pool.query('UPDATE comandas SET nome_cliente=$1 WHERE id=$2', [req.body.nome_cliente, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
