const router = require('express').Router();
const pool   = require('../config/db');
const auth   = require('../middlewares/auth');

// GET /comandas-fisicas — lista todas
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comandas_fisicas ORDER BY codigo ASC');
    res.json(rows);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// GET /comandas-fisicas/:codigo — consulta uma (usado no Leitor)
router.get('/:codigo', auth, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM comandas_fisicas WHERE codigo=$1', [req.params.codigo]);
    if (!rows[0]) return res.status(404).json({ erro: 'Comanda não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// POST /comandas-fisicas/gerar — gera um lote novo
// body: { quantidade, prefixo }
router.post('/gerar', auth, async (req, res) => {
  const { quantidade, prefixo } = req.body;
  const qtd = Math.min(Math.max(+quantidade || 0, 1), 200);
  const pref = (prefixo || '').toUpperCase().slice(0, 3);
  try {
    const { rows: existentes } = await pool.query(
      "SELECT codigo FROM comandas_fisicas WHERE codigo LIKE $1", [pref + '%']
    );
    const usados = new Set(existentes.map(r => r.codigo));
    const novas = [];
    for (let i = 1; novas.length < qtd; i++) {
      const cod = pref + String(i).padStart(3, '0');
      if (!usados.has(cod)) { novas.push(cod); usados.add(cod); }
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      for (const cod of novas) {
        await client.query(
          "INSERT INTO comandas_fisicas (codigo,status) VALUES ($1,'livre') ON CONFLICT (codigo) DO NOTHING",
          [cod]
        );
      }
      await client.query('COMMIT');
    } catch (e) { await client.query('ROLLBACK'); throw e; } finally { client.release(); }
    res.status(201).json({ geradas: novas.length, codigos: novas });
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PATCH /comandas-fisicas/:codigo — atualiza status/mesa/cliente
// body: { status, mesa, nomeCliente }
// Observação: aberto_em NÃO vem do cliente — o servidor carimba a hora
// automaticamente ao entrar em "em_uso", evitando problemas de fuso/relógio
// do dispositivo e formatos de hora inconsistentes vindos do frontend.
router.patch('/:codigo', auth, async (req, res) => {
  const { status, mesa, nomeCliente } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE comandas_fisicas SET
         status=COALESCE($1,status), mesa=$2, nome_cliente=$3,
         aberto_em = CASE WHEN $1='em_uso' THEN NOW() ELSE aberto_em END,
         atualizado_em=NOW()
       WHERE codigo=$4 RETURNING *`,
      [status || null, mesa ?? null, nomeCliente ?? null, req.params.codigo]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Comanda não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

// PATCH /comandas-fisicas/:codigo/liberar — atalho pra voltar ao estado livre
router.patch('/:codigo/liberar', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE comandas_fisicas SET status='livre', mesa=NULL, nome_cliente=NULL,
         aberto_em=NULL, atualizado_em=NOW() WHERE codigo=$1 RETURNING *`,
      [req.params.codigo]
    );
    if (!rows[0]) return res.status(404).json({ erro: 'Comanda não encontrada' });
    res.json(rows[0]);
  } catch (err) { res.status(500).json({ erro: err.message }); }
});

module.exports = router;
