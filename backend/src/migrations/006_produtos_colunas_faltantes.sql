-- ============================================================
-- Migration 006 — Adiciona as colunas que faltam na tabela
-- "produtos" JÁ EXISTENTE (criada antes deste projeto, com um
-- catálogo mais antigo). A migração 002 usava CREATE TABLE IF
-- NOT EXISTS, que não faz nada quando a tabela já existe — por
-- isso as colunas novas (categoria_id, venda_peso, estoque,
-- codbarra, imagem, ativo...) nunca chegaram a ser criadas de
-- verdade. ADD COLUMN IF NOT EXISTS resolve isso não importa
-- qual schema já existia antes.
-- ============================================================

ALTER TABLE produtos ADD COLUMN IF NOT EXISTS categoria_id INTEGER REFERENCES categorias(id) ON DELETE SET NULL;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS tipo TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS venda_peso BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS estoque INTEGER;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS codbarra TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem TEXT;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS criado_em TIMESTAMP DEFAULT NOW();
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS atualizado_em TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_produtos_codbarra ON produtos(codbarra) WHERE codbarra IS NOT NULL AND codbarra <> '';
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);
