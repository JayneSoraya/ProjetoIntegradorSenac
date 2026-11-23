-- Integridade adicional introduzida no alpha técnico.
-- Mantida como migration separada para preservar imutabilidade de 001/002.

-- Um usuário deve possuir no máximo um carrinho aberto.
CREATE UNIQUE INDEX IF NOT EXISTS ux_carrinho_um_aberto_por_usuario
  ON carrinho(id_usuario)
  WHERE status = 'ABERTO';

-- Ajuda consultas operacionais por status e data.
CREATE INDEX IF NOT EXISTS idx_supermercado_status_nome
  ON supermercado(status_cadastro, nome_fantasia);

CREATE INDEX IF NOT EXISTS idx_importacao_preco_mercado_data
  ON importacao_preco(id_supermercado, criada_em DESC);
