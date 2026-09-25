-- ============================================================
-- Migration 004 — Substitui a dependência de mesa_id (chave
-- estrangeira pra uma tabela "mesas" com schema desconhecido)
-- por uma coluna simples e própria: mesa_numero. Elimina o
-- risco de a criação de comanda falhar silenciosamente por
-- causa de uma FK que não sabemos se tem as linhas esperadas.
-- ============================================================
ALTER TABLE comandas ADD COLUMN IF NOT EXISTS mesa_numero INTEGER;
 
