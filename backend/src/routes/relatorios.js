const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /relatorios/dia?data=DD/MM/YYYY
router.get('/dia', auth, async (req, res) => {
  try {
    const data = req.query.data
      ? req.query.data.split('/').reverse().join('-')
      : new Date().toISOString().slice(0,10);

    const { rows: vendas } = await pool.query(
      `SELECT tipo, SUM(total_final) as total, COUNT(*) as qtd
       FROM comandas WHERE status='fechada' AND fechada_em::date=$1
       GROUP BY tipo`, [data]
    );
    const { rows: formas } = await pool.query(
      `SELECT p.forma, SUM(p.valor) as total
       FROM pagamentos p JOIN comandas c ON c.id=p.comanda_id
       WHERE c.fechada_em::date=$1 GROUP BY p.forma`, [data]
    );
    const { rows: ranking } = await pool.query(
      `SELECT ic.nome_produto, SUM(ic.qtd) as qtd, SUM(ic.total_item) as total
       FROM itens_comanda ic JOIN comandas c ON c.id=ic.comanda_id
       WHERE c.status='fechada' AND c.fechada_em::date=$1
       GROUP BY ic.nome_produto ORDER BY qtd DESC LIMIT 10`, [data]
    );
    const totalDia = vendas.reduce((s,v)=>s+parseFloat(v.total||0),0);
    const qtdVendas= vendas.reduce((s,v)=>s+parseInt(v.qtd||0),0);
    res.json({ data, totalDia, qtdVendas, ticketMedio: qtdVendas?totalDia/qtdVendas:0, vendas, formas, ranking });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /relatorios/estoque-baixo
router.get('/estoque-baixo', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, c.nome as categoria_nome FROM produtos p
       LEFT JOIN categorias c ON c.id=p.categoria_id
       WHERE p.estoque IS NOT NULL AND p.estoque<=5 ORDER BY p.estoque`
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
