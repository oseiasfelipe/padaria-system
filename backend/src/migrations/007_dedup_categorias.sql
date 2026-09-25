-- ============================================================
-- Migration 007 — Remove categorias duplicadas.
--
-- Motivo: enquanto GET /produtos estava quebrando (falta da
-- coluna "ativo", corrigida na migration 006), o front-end via
-- Promise.all([produtos, categorias]) — quando UMA das duas
-- falhava, a outra também era descartada. Isso fazia o app
-- achar, a cada recarregamento, que não existia NENHUMA
-- categoria ainda, e recriava as 17 categorias padrão de novo
-- a cada tentativa — gerando dezenas de duplicatas.
--
-- Esta migração mantém só a categoria mais antiga (menor id)
-- de cada nome+tipo repetido, repassa qualquer produto que
-- estivesse ligado a uma duplicata para a categoria mantida,
-- e só então apaga as duplicatas.
-- ============================================================

-- 1) Repassa produtos que apontam para uma categoria duplicada
--    para a categoria "mantida" (a de menor id) do mesmo nome+tipo.
WITH ranking AS (
  SELECT id, lower(trim(nome)) AS nome_norm, tipo,
         MIN(id) OVER (PARTITION BY lower(trim(nome)), tipo) AS id_mantido
  FROM categorias
)
UPDATE produtos p
SET categoria_id = r.id_mantido
FROM ranking r
WHERE p.categoria_id = r.id
  AND r.id <> r.id_mantido;

-- 2) Apaga as categorias duplicadas, mantendo só a mais antiga de cada nome+tipo.
WITH ranking AS (
  SELECT id, lower(trim(nome)) AS nome_norm, tipo,
         MIN(id) OVER (PARTITION BY lower(trim(nome)), tipo) AS id_mantido
  FROM categorias
)
DELETE FROM categorias c
USING ranking r
WHERE c.id = r.id
  AND r.id <> r.id_mantido;
