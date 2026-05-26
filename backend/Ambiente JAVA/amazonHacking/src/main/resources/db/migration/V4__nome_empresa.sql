-- Adiciona o nome (razão social / nome fantasia) das empresas compradoras.
-- Mudança aditiva, sem risco de perda de dados.
--
-- Para não quebrar empresas já cadastradas (que ainda não têm nome), a coluna
-- é criada permitindo nulo, os registros antigos recebem um nome provisório e
-- só então a coluna passa a ser obrigatória (NOT NULL). Esse "backfill" garante
-- que a validação NOT NULL não falhe com dados pré-existentes.

-- 1) Cria a coluna permitindo nulo temporariamente.
ALTER TABLE empresas ADD COLUMN nome VARCHAR(150);

-- 2) Preenche as empresas já cadastradas com um nome provisório.
UPDATE empresas SET nome = 'Empresa sem nome' WHERE nome IS NULL;

-- 3) Agora que não há mais nulos, torna a coluna obrigatória.
ALTER TABLE empresas ALTER COLUMN nome SET NOT NULL;
