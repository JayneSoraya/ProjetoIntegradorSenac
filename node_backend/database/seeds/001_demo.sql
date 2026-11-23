-- Seed opcional somente para ambiente local/demonstracao.
-- Senhas reais devem ser criadas pela API para que bcrypt seja aplicado corretamente.

INSERT INTO supermercado (cnpj, nome_fantasia, endereco_completo, latitude, longitude, status_cadastro)
VALUES
  ('11222333000181', 'Mercado Demo Centro', 'Endereco de demonstracao', -23.550520, -46.633308, 'APROVADO'),
  ('44555666000181', 'Mercado Demo Bairro', 'Endereco de demonstracao', -23.560000, -46.640000, 'APROVADO')
ON CONFLICT (cnpj) DO NOTHING;

INSERT INTO produto (codigo_barras, nome_produto, marca, categoria, peso, unidade_medida)
VALUES
  ('7890000000001', 'Arroz Agulhinha', 'Marca Demo', 'Alimentos', 5, 'kg'),
  ('7890000000002', 'Feijao Carioca', 'Marca Demo', 'Alimentos', 1, 'kg')
ON CONFLICT (codigo_barras) DO NOTHING;

INSERT INTO oferta_supermercado (id_supermercado, id_produto, preco_atual, preco_fidelidade, fonte)
SELECT s.id_supermercado, p.id_produto,
       CASE WHEN s.cnpj = '11222333000181' THEN 24.90 ELSE 26.40 END,
       CASE WHEN s.cnpj = '11222333000181' THEN 23.90 ELSE NULL END,
       'MANUAL'
FROM supermercado s
CROSS JOIN produto p
WHERE s.cnpj IN ('11222333000181', '44555666000181')
  AND p.codigo_barras = '7890000000001'
ON CONFLICT (id_supermercado, id_produto) DO UPDATE
SET preco_atual = EXCLUDED.preco_atual,
    preco_fidelidade = EXCLUDED.preco_fidelidade,
    fonte = EXCLUDED.fonte,
    data_atualizacao = NOW();

INSERT INTO oferta_supermercado (id_supermercado, id_produto, preco_atual, fonte)
SELECT s.id_supermercado, p.id_produto,
       CASE WHEN s.cnpj = '11222333000181' THEN 7.20 ELSE 6.85 END,
       'MANUAL'
FROM supermercado s
CROSS JOIN produto p
WHERE s.cnpj IN ('11222333000181', '44555666000181')
  AND p.codigo_barras = '7890000000002'
ON CONFLICT (id_supermercado, id_produto) DO UPDATE
SET preco_atual = EXCLUDED.preco_atual,
    fonte = EXCLUDED.fonte,
    data_atualizacao = NOW();

-- As ofertas demo pertencem explicitamente ao catálogo de cada unidade.
INSERT INTO supermercado_produto (id_supermercado, id_produto, ativo, origem, atualizado_em)
SELECT s.id_supermercado, p.id_produto, TRUE, 'MANUAL', NOW()
FROM supermercado s
CROSS JOIN produto p
WHERE s.cnpj IN ('11222333000181', '44555666000181')
  AND p.codigo_barras IN ('7890000000001', '7890000000002')
ON CONFLICT (id_supermercado, id_produto) DO UPDATE
SET ativo = TRUE, origem = 'MANUAL', atualizado_em = NOW();
