const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /caixa/fechamentos — histórico de fechamentos
router.get('/fechamentos', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM fechamentos_caixa ORDER BY data DESC, hora DESC LIMIT 200'
    );
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /caixa/fechamentos — registra um fechamento
router.post('/fechamentos', auth, async (req, res) => {
  const {
    totalGeral, totalDinheiro, totalPix, totalDebito, totalCredito, totalVale,
    sangria, suprimento, saldoCaixa, qtdVendas, observacao,
  } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO fechamentos_caixa
         (data, total_geral, total_dinheiro, total_pix, total_debito, total_credito,
          total_vale, sangria, suprimento, saldo_caixa, qtd_vendas, observacao, fechado_por)
       VALUES (CURRENT_DATE,$1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING *`,
      [totalGeral || 0, totalDinheiro || 0, totalPix || 0, totalDebito || 0, totalCredito || 0,
       totalVale || 0, sangria || 0, suprimento || 0, saldoCaixa || 0, qtdVendas || 0,
       observacao || null, req.usuario.id]
    );
    res.status(201).json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
