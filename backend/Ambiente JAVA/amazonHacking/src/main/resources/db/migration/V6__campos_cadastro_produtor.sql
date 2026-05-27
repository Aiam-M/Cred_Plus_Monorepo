-- Migration V6: Adiciona campos de cadastro completo do produtor
-- Campos novos: CPF, data de nascimento, município e estado.
-- Todos são opcionais (nullable) para não quebrar usuários já cadastrados.

ALTER TABLE users ADD COLUMN cpf          VARCHAR(14);
ALTER TABLE users ADD COLUMN data_nascimento DATE;
ALTER TABLE users ADD COLUMN municipio    VARCHAR(100);
ALTER TABLE users ADD COLUMN estado       VARCHAR(2);
