const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /vendas — histórico, com itens e pagamentos, filtrável por data (YYYY-MM-DD)
router.get('/', auth, async (req, res) => {
  try {
    const { data } = req.query;
    let q = 'SELECT * FROM vendas';
    const vals = [];
    if (data) { vals.push(data); q += ' WHERE criado_em::date=$1'; }
    q += ' ORDER BY criado_em DESC LIMIT 500';
    const { rows } = await pool.query(q, vals);
    for (const v of rows) {
      const { rows: itens } = await pool.query('SELECT * FROM vendas_itens WHERE venda_id=$1', [v.id]);
      const { rows: pags  } = await pool.query('SELECT * FROM vendas_pagamentos WHERE venda_id=$1', [v.id]);
      v.itens = itens; v.pagamentos = pags;
    }
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /vendas — registra uma venda do PDV Mercado por completo:
// itens + pagamentos + baixa de estoque, tudo em uma transação (ou tudo
// grava, ou nada grava — evita venda "pela metade" se algo falhar no meio).
// body: { nomeCliente, total, itens:[{produtoId,nome,precoUnit,qtd,totalItem}], pagamentos:[{forma,valor,troco}] }
router.post('/', auth, async (req, res) => {
  const { nomeCliente, total, itens, pagamentos } = req.body;
  if (!Array.isArray(itens) || itens.length === 0) {
    return res.status(400).json({ erro: 'A venda precisa ter ao menos um item' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: vRows } = await client.query(
      'INSERT INTO vendas (nome_cliente,total,atendente_id) VALUES ($1,$2,$3) RETURNING *',
      [nomeCliente || 'Consumidor', total, req.usuario.id]
    );
    const venda = vRows[0];

    for (const i of itens) {
      await client.query(
        `INSERT INTO vendas_itens (venda_id,produto_id,nome_produto,preco_unit,qtd,peso_kg,total_item)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [venda.id, i.produtoId || null, i.nome, i.precoUnit, i.qtd || 1, i.pesoKg || null, i.totalItem]
      );
      // Baixa estoque só de item com controle de estoque (produto de mercado)
      if (i.produtoId && !i.pesoKg) {
        await client.query(
          'UPDATE produtos SET estoque=GREATEST(0,estoque-$1) WHERE id=$2 AND estoque IS NOT NULL',
          [i.qtd || 1, i.produtoId]
        );
      }
    }

    for (const p of (pagamentos || [])) {
      await client.query(
        'INSERT INTO vendas_pagamentos (venda_id,forma,valor,troco) VALUES ($1,$2,$3,$4)',
        [venda.id, p.forma, p.valor, p.troco || 0]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(venda);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ erro: err.message });
  } finally { client.release(); }
});

module.exports = router;
