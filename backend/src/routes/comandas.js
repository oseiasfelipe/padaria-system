const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /comandas — lista abertas
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT * FROM comandas WHERE status='aberta' ORDER BY aberta_em DESC`
    );
    for (const c of rows) {
      const { rows: itens } = await pool.query('SELECT * FROM itens_comanda WHERE comanda_id=$1', [c.id]);
      c.itens = itens;
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /comandas/historico
router.get('/historico', auth, async (req, res) => {
  try {
    const { data } = req.query;
    let q = `SELECT * FROM comandas WHERE status='fechada'`;
    const vals = [];
    if (data) { vals.push(data); q += ` AND aberta_em::date=$${vals.length}`; }
    q += ' ORDER BY fechada_em DESC LIMIT 200';
    const { rows } = await pool.query(q, vals);
    for (const c of rows) {
      const { rows: itens } = await pool.query('SELECT * FROM itens_comanda WHERE comanda_id=$1', [c.id]);
      const { rows: pags  } = await pool.query('SELECT * FROM pagamentos WHERE comanda_id=$1', [c.id]);
      c.itens = itens; c.pagamentos = pags;
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /comandas — abre nova comanda
// body: { tipo, mesaNumero, nomeCliente, codigoComanda }
router.post('/', auth, async (req, res) => {
  const { tipo, mesaNumero, nomeCliente, codigoComanda } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO comandas (tipo,mesa_numero,nome_cliente,atendente_id,codigo_comanda)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [tipo, mesaNumero ?? null, nomeCliente || null, req.usuario.id, codigoComanda || null]
    );
    res.status(201).json({ ...rows[0], itens: [] });
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

// POST /comandas/:id/itens — adiciona item (sempre entra como "pendente")
router.post('/:id/itens', auth, async (req, res) => {
  const { produto_id, nome_produto, preco_unit, qtd, peso_kg, total_item } = req.body;
  // Recalcula no servidor se o total não vier (ou vier zerado) do frontend —
  // evita que um esquecimento no front derrube o lançamento do item.
  const totalFinal = total_item != null ? total_item : (preco_unit || 0) * (qtd || 1);
  try {
    const { rows } = await pool.query(
      `INSERT INTO itens_comanda (comanda_id,produto_id,nome_produto,preco_unit,qtd,peso_kg,total_item,status_preparo)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pendente') RETURNING *`,
      [req.params.id, produto_id, nome_produto, preco_unit, qtd || 1, peso_kg || null, totalFinal]
    );
    if (produto_id && !peso_kg) {
      await pool.query(
        'UPDATE produtos SET estoque=GREATEST(0,estoque-$1) WHERE id=$2 AND estoque IS NOT NULL',
        [qtd || 1, produto_id]
      );
    }
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PATCH /comandas/:id/itens/:itemId — ajusta quantidade e/ou status de preparo
router.patch('/:id/itens/:itemId', auth, async (req, res) => {
  const { qtd, statusPreparo } = req.body;
  try {
    let q, vals;
    if (statusPreparo !== undefined) {
      q = 'UPDATE itens_comanda SET status_preparo=$1 WHERE id=$2 AND comanda_id=$3 RETURNING *';
      vals = [statusPreparo, req.params.itemId, req.params.id];
    } else {
      q = `UPDATE itens_comanda SET qtd=$1,
             status_preparo = CASE WHEN status_preparo IN ('pronto','entregue') THEN 'pendente' ELSE status_preparo END
           WHERE id=$2 AND comanda_id=$3 RETURNING *`;
      vals = [qtd, req.params.itemId, req.params.id];
    }
    const { rows } = await pool.query(q, vals);
    if (!rows[0]) return res.status(404).json({ erro: 'Item não encontrado' });
    res.json(rows[0]);
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
    const { rows } = await client.query(
      `UPDATE comandas SET status='fechada',total_final=$1,fechada_em=NOW(),nome_cliente=COALESCE($2,nome_cliente)
       WHERE id=$3 RETURNING codigo_comanda`,
      [total_final, nome_cliente || null, req.params.id]
    );
    for (const p of (pagamentos||[])) {
      await client.query(
        'INSERT INTO pagamentos (comanda_id,forma,valor,troco) VALUES ($1,$2,$3,$4)',
        [req.params.id, p.forma, p.valor, p.troco||0]
      );
    }
    const codigoComanda = rows[0]?.codigo_comanda;
    if (codigoComanda) {
      await client.query(
        "UPDATE comandas_fisicas SET status='paga', atualizado_em=NOW() WHERE codigo=$1",
        [codigoComanda]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally { client.release(); }
});

// DELETE /comandas/:id — cancela (cliente desistiu), libera a comanda física
router.delete('/:id', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows } = await client.query(
      'DELETE FROM comandas WHERE id=$1 AND status=\'aberta\' RETURNING codigo_comanda',
      [req.params.id]
    );
    const codigoComanda = rows[0]?.codigo_comanda;
    if (codigoComanda) {
      await client.query(
        `UPDATE comandas_fisicas SET status='livre', mesa=NULL, nome_cliente=NULL,
           aberto_em=NULL, atualizado_em=NOW() WHERE codigo=$1`,
        [codigoComanda]
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
