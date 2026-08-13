-- PadariaSystem — Schema PostgreSQL
-- Executado automaticamente no primeiro deploy

CREATE TABLE IF NOT EXISTS usuarios (
  id          SERIAL PRIMARY KEY,
  nome        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  senha_hash  VARCHAR(255) NOT NULL,
  perfil      VARCHAR(20) DEFAULT 'atendente' CHECK (perfil IN ('admin','caixa','atendente')),
  ativo       BOOLEAN DEFAULT true,
  criado_em   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categorias (
  id    SERIAL PRIMARY KEY,
  nome  VARCHAR(80) NOT NULL,
  emoji VARCHAR(10) DEFAULT '🍞',
  tipo  VARCHAR(20) DEFAULT 'padaria' CHECK (tipo IN ('padaria','mercado')),
  ativo BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS produtos (
  id           SERIAL PRIMARY KEY,
  nome         VARCHAR(150) NOT NULL,
  preco        NUMERIC(10,2) NOT NULL,
  categoria_id INTEGER REFERENCES categorias(id),
  tipo         VARCHAR(20) DEFAULT 'padaria' CHECK (tipo IN ('padaria','mercado')),
  venda_peso   BOOLEAN DEFAULT false,
  estoque      INTEGER,
  codbarra     VARCHAR(50),
  disponivel   BOOLEAN DEFAULT true,
  criado_em    TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS mesas (
  id      SERIAL PRIMARY KEY,
  numero  INTEGER UNIQUE NOT NULL,
  ativa   BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS comandas (
  id            SERIAL PRIMARY KEY,
  tipo          VARCHAR(20) NOT NULL CHECK (tipo IN ('mesa','balcao','mercado')),
  mesa_id       INTEGER REFERENCES mesas(id),
  nome_cliente  VARCHAR(100),
  status        VARCHAR(20) DEFAULT 'aberta' CHECK (status IN ('aberta','fechada','cancelada')),
  atendente_id  INTEGER REFERENCES usuarios(id),
  total_final   NUMERIC(10,2),
  aberta_em     TIMESTAMP DEFAULT NOW(),
  fechada_em    TIMESTAMP
);

CREATE TABLE IF NOT EXISTS itens_comanda (
  id            SERIAL PRIMARY KEY,
  comanda_id    INTEGER REFERENCES comandas(id) ON DELETE CASCADE,
  produto_id    INTEGER REFERENCES produtos(id),
  nome_produto  VARCHAR(150) NOT NULL,
  preco_unit    NUMERIC(10,2) NOT NULL,
  qtd           INTEGER DEFAULT 1,
  peso_kg       NUMERIC(8,3),
  total_item    NUMERIC(10,2) NOT NULL,
  adicionado_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagamentos (
  id            SERIAL PRIMARY KEY,
  comanda_id    INTEGER REFERENCES comandas(id),
  forma         VARCHAR(30) NOT NULL,
  valor         NUMERIC(10,2) NOT NULL,
  troco         NUMERIC(10,2) DEFAULT 0,
  registrado_em TIMESTAMP DEFAULT NOW()
);

-- Mesas padrão
INSERT INTO mesas (numero) VALUES
  (1),(2),(3),(4),(5),(6),(7),(8),(9),(10),(11),(12)
ON CONFLICT DO NOTHING;

-- Categorias padrão
INSERT INTO categorias (nome, emoji, tipo) VALUES
  ('Pães',       '🍞', 'padaria'),
  ('Frios',      '🧀', 'padaria'),
  ('Salgados',   '🥐', 'padaria'),
  ('Bebidas',    '☕', 'padaria'),
  ('Doces',      '🍰', 'padaria'),
  ('Laticínios', '🥛', 'mercado'),
  ('Mercearia',  '🛒', 'mercado'),
  ('Limpeza',    '🧹', 'mercado'),
  ('Higiene',    '🧴', 'mercado'),
  ('Frios Emb.', '📦', 'mercado')
ON CONFLICT DO NOTHING;

-- Admin padrão: admin@padaria.com / padaria123
INSERT INTO usuarios (nome, email, senha_hash, perfil) VALUES
  ('Administrador', 'admin@padaria.com',
   '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhem',
   'admin')
ON CONFLICT DO NOTHING;
