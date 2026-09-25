require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./config/db');
const fs      = require('fs');
const path    = require('path');

const app = express();

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:5173',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));
app.use(express.json());

// ── Rotas ────────────────────────────────────────────────────────────────────
app.use('/auth',            require('./routes/auth'));
app.use('/produtos',        require('./routes/produtos'));
app.use('/comandas',        require('./routes/comandas'));
app.use('/relatorios',      require('./routes/relatorios'));
app.use('/usuarios',        require('./routes/usuarios'));
app.use('/categorias',      require('./routes/categorias'));
app.use('/vendas',          require('./routes/vendas'));
app.use('/comandas-fisicas', require('./routes/comandasFisicas'));
app.use('/caixa',           require('./routes/caixa'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Migrations automáticas ───────────────────────────────────────────────────
// Roda TODOS os arquivos .sql da pasta migrations/, em ordem alfabética
// (001, 002, 003...) — antes só rodava o 001_schema.sql, com nome fixo,
// e os arquivos seguintes (002, 003, 004...) nunca chegavam a executar.
async function runMigrations() {
  const dir = path.join(__dirname, 'migrations');
  const arquivos = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
  for (const arquivo of arquivos) {
    const sql = fs.readFileSync(path.join(dir, arquivo), 'utf8');
    try {
      await pool.query(sql);
      console.log(`✅ Schema OK (${arquivo})`);
    } catch (err) {
      console.error(`⚠️  Migration ${arquivo}:`, err.message);
    }
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  await runMigrations();
});
