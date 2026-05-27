-- Migration V7: Insere a associação piloto do projeto Cred+
-- Vila Jutaiteua, Moju-PA — comunidade parceira do Amazon Hacking 2026.
--
-- ON CONFLICT (cnpj) DO NOTHING: se a associação já existir (ex.: rodou manualmente),
-- a migration não falha nem duplica o registro.

INSERT INTO associacao (nome, cnpj, descricao, latitude, longitude, area_total_hectares, municipio, estado)
VALUES (
    'Associação dos Agricultores Familiares de Jutaiteua',
    '12345678000190',
    'Comunidade piloto do projeto Cred+ — Vila Jutaiteua, Moju-PA. Produtores de cacau e açaí.',
    -2.0847,
    -48.8022,
    500.0,
    'Moju',
    'PA'
)
ON CONFLICT (cnpj) DO NOTHING;
