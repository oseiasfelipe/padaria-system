require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const pool    = require('./src/config/db');
const fs      = require('fs');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/auth',            require('./src/routes/auth'));
app.use('/produtos',        require('./src/routes/produtos'));
app.use('/comandas',        require('./src/routes/comandas'));
app.use('/relatorios',      require('./src/routes/relatorios'));
app.use('/usuarios',        require('./src/routes/usuarios'));
app.use('/categorias',      require('./src/routes/categorias'));
app.use('/vendas',          require('./src/routes/vendas'));
app.use('/comandas-fisicas', require('./src/routes/comandasFisicas'));
app.use('/caixa',           require('./src/routes/caixa'));

app.get('/health', (_, res) => res.json({ status: 'ok', ts: new Date() }));

async function runMigrations() {
  const dir = path.join(__dirname, 'src/migrations');
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

const PORT = 4010;
app.listen(PORT, async () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
  await runMigrations();
});
