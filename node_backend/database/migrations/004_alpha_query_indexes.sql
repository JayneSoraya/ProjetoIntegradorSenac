-- Índices e extensão para os padrões de consulta do alpha técnico.
-- IMPORTANTE: reconciliar com o schema Neon real antes de aplicar no banco existente.

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX IF NOT EXISTS idx_conta_tipo_status
  ON conta(tipo_conta, status_conta);

CREATE INDEX IF NOT EXISTS idx_produto_nome_trgm
  ON produto USING GIN (nome_produto gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_produto_marca_trgm
  ON produto USING GIN (marca gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_nota_usuario_data
  ON nota_fiscal(id_usuario, processada_em DESC);

CREATE INDEX IF NOT EXISTS idx_oferta_mercado_atualizacao
  ON oferta_supermercado(id_supermercado, data_atualizacao DESC);
