-- Corrige colunas definidas como CHAR para VARCHAR.
-- CHAR no PostgreSQL (bpchar) não é reconhecido pelo Hibernate como varchar,
-- causando falha na validação de schema (ddl-auto=validate).
-- VARCHAR é mais adequado para esses campos, pois não preenche com espaços.

ALTER TABLE associacao ALTER COLUMN cnpj TYPE varchar(14);
ALTER TABLE associacao ALTER COLUMN estado TYPE varchar(2);
