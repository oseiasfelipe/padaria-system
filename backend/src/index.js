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
app.use('/auth',       require('./routes/auth'));
app.use('/produtos',   require('./routes/produtos'));
app.use('/comandas',   require('./routes/comandas'));
app.use('/relatorios', require('./routes/relatorios'));

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

// ── Migrations automáticas ───────────────────────────────────────────────────
async function runMigrations() {
  const sql = fs.readFileSync(
    path.join(__dirname, 'migrations/001_schema.sql'), 'utf8'
  );
  try {
    await pool.query(sql);
    console.log('✅ Schema OK');
  } catch (err) {
    console.error('⚠️  Migration:', err.message);
  }
}

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, async () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  await runMigrations();
});
