-- ============================================================
-- Migration 003 — Campos que faltam nas tabelas de comanda para
-- suportar o Painel de Pedidos (status de preparo) e o vínculo
-- com a comanda física (ticket/QR Code).
-- ============================================================

ALTER TABLE comandas
  ADD COLUMN IF NOT EXISTS codigo_comanda TEXT REFERENCES comandas_fisicas(codigo);

ALTER TABLE itens_comanda
  ADD COLUMN IF NOT EXISTS status_preparo TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_preparo IN ('pendente','pronto','entregue'));
