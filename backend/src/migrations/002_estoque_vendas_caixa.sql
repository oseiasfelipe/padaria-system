-- ============================================================
-- Migration 002 — Produtos, Categorias, Vendas (PDV Mercado),
-- Comandas Físicas (tickets) e Fechamentos de Caixa
-- Roda automaticamente no boot (mesmo padrão do 001_schema.sql
-- em index.js), então usa "IF NOT EXISTS" em tudo — seguro
-- rodar de novo sem duplicar ou dar erro.
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias (
  id          SERIAL PRIMARY KEY,
  nome        TEXT NOT NULL,
  emoji       TEXT,
  tipo        TEXT NOT NULL CHECK (tipo IN ('padaria','mercado')),
  criado_em   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS produtos (
  id            SERIAL PRIMARY KEY,
  nome          TEXT NOT NULL,
  preco         NUMERIC(10,2) NOT NULL,
  categoria_id  INTEGER REFERENCES categorias(id) ON DELETE SET NULL,
  tipo          TEXT NOT NULL CHECK (tipo IN ('padaria','mercado')),
  venda_peso    BOOLEAN NOT NULL DEFAULT false,
  estoque       INTEGER,              -- NULL = não controla estoque (itens de padaria)
  codbarra      TEXT,
  imagem        TEXT,                 -- base64 ou URL da foto
  ativo         BOOLEAN NOT NULL DEFAULT true,
  criado_em     TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_produtos_codbarra ON produtos(codbarra) WHERE codbarra IS NOT NULL AND codbarra <> '';
CREATE INDEX IF NOT EXISTS idx_produtos_categoria ON produtos(categoria_id);

-- Vendas diretas do PDV Mercado (sem comanda — balcão de mercadoria)
CREATE TABLE IF NOT EXISTS vendas (
  id            SERIAL PRIMARY KEY,
  nome_cliente  TEXT,
  total         NUMERIC(10,2) NOT NULL,
  atendente_id  INTEGER REFERENCES usuarios(id),
  criado_em     TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vendas_itens (
  id            SERIAL PRIMARY KEY,
  venda_id      INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  produto_id    INTEGER REFERENCES produtos(id),
  nome_produto  TEXT NOT NULL,
  preco_unit    NUMERIC(10,2) NOT NULL,
  qtd           NUMERIC(10,3) NOT NULL DEFAULT 1,
  peso_kg       NUMERIC(10,3),
  total_item    NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS vendas_pagamentos (
  id        SERIAL PRIMARY KEY,
  venda_id  INTEGER NOT NULL REFERENCES vendas(id) ON DELETE CASCADE,
  forma     TEXT NOT NULL,          -- dinheiro | pix | debito | credito | vale
  valor     NUMERIC(10,2) NOT NULL,
  troco     NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Comandas físicas (tickets impressos com QR Code / número)
CREATE TABLE IF NOT EXISTS comandas_fisicas (
  codigo        TEXT PRIMARY KEY,
  status        TEXT NOT NULL DEFAULT 'livre' CHECK (status IN ('livre','em_uso','paga')),
  mesa          INTEGER,
  nome_cliente  TEXT,
  aberto_em     TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT NOW()
);

-- Fechamentos de caixa (histórico do que já foi fechado)
CREATE TABLE IF NOT EXISTS fechamentos_caixa (
  id              SERIAL PRIMARY KEY,
  data            DATE NOT NULL,
  hora            TIME NOT NULL DEFAULT CURRENT_TIME,
  total_geral     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_dinheiro  NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_pix       NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_debito    NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_credito   NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_vale      NUMERIC(10,2) NOT NULL DEFAULT 0,
  sangria         NUMERIC(10,2) NOT NULL DEFAULT 0,
  suprimento      NUMERIC(10,2) NOT NULL DEFAULT 0,
  saldo_caixa     NUMERIC(10,2) NOT NULL DEFAULT 0,
  qtd_vendas      INTEGER NOT NULL DEFAULT 0,
  observacao      TEXT,
  fechado_por     INTEGER REFERENCES usuarios(id),
  criado_em       TIMESTAMP DEFAULT NOW()
);
