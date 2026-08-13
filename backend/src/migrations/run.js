require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const pool = require('../config/db');

async function runMigrations() {
  console.log('🔄 Executando migrations...');
  const sql = fs.readFileSync(path.join(__dirname, '001_schema.sql'), 'utf8');
  try {
    await pool.query(sql);
    console.log('✅ Migrations concluídas!');
  } catch (err) {
    console.error('❌ Erro na migration:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigrations();
