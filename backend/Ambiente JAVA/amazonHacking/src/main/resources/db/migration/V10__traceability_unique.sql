-- C5: garante a integridade da cadeia de rastreabilidade no proprio banco.
-- Checado antes de aplicar: 0 eventos sem hash e 0 forks.

-- Dois eventos da mesma safra nao podem apontar para o mesmo hash_anterior
-- (isso seria um "fork" na cadeia). NULL nao entra nesta regra no Postgres,
-- por isso o evento inicial (sem hash anterior) e tratado pelo indice abaixo.
ALTER TABLE traceability_event
    ADD CONSTRAINT uq_evento_safra_hash_anterior UNIQUE (safra_id, hash_anterior);

-- Garante que exista no maximo UM evento inicial (hash_anterior nulo) por safra.
CREATE UNIQUE INDEX uq_evento_inicial_por_safra
    ON traceability_event (safra_id)
    WHERE hash_anterior IS NULL;

-- B12: indice na FK safra_id para acelerar a leitura da cadeia.
CREATE INDEX idx_traceability_safra ON traceability_event (safra_id);
