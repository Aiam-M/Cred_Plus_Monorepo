-- A6: safra_id e empresa_id de um interesse nunca devem ser nulos.
-- Checado antes de aplicar: 0 registros orfaos.
ALTER TABLE interesse ALTER COLUMN safra_id SET NOT NULL;
ALTER TABLE interesse ALTER COLUMN empresa_id SET NOT NULL;

-- A5: impede que a mesma empresa registre interesse duas vezes na mesma safra.
-- Resolve a race condition do "verifica e depois insere": agora o proprio banco
-- garante a unicidade. Checado antes de aplicar: 0 pares duplicados.
ALTER TABLE interesse ADD CONSTRAINT uq_interesse_safra_empresa UNIQUE (safra_id, empresa_id);

-- B12: indice na FK empresa_id (Postgres nao cria indice automatico em FK).
-- O safra_id ja fica indexado pela constraint UNIQUE acima (coluna mais a esquerda).
CREATE INDEX idx_interesse_empresa ON interesse (empresa_id);
