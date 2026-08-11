-- Separa pertencimento ao catálogo/assortimento do supermercado da existência de preço.
-- Sem esta relação, "produto sem preço" confundiria todo produto global não vendido pela unidade.

CREATE TABLE IF NOT EXISTS supermercado_produto (
  id_supermercado BIGINT NOT NULL REFERENCES supermercado(id_supermercado) ON DELETE CASCADE,
  id_produto BIGINT NOT NULL REFERENCES produto(id_produto) ON DELETE CASCADE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
  origem VARCHAR(30) NOT NULL DEFAULT 'LEGADO'
    CHECK (origem IN ('LEGADO', 'MANUAL', 'IMPORTACAO', 'NFCE', 'API_PARCEIRO')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id_supermercado, id_produto)
);

-- Todo produto que já possui oferta necessariamente pertence ao catálogo da unidade.
INSERT INTO supermercado_produto (id_supermercado, id_produto, ativo, origem)
SELECT id_supermercado, id_produto, TRUE, 'LEGADO'
FROM oferta_supermercado
ON CONFLICT (id_supermercado, id_produto) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_supermercado_produto_produto
  ON supermercado_produto(id_produto, id_supermercado)
  WHERE ativo = TRUE;
