-- Suporte à sincronização offline-first do app do produtor.
-- Mudanças aditivas (ADD COLUMN), sem risco de perda de dados.

-- local_id: UUID gerado pelo app no celular antes de salvar no IndexedDB.
-- Funciona como "chave de idempotência": se o mesmo cadastro for enviado duas
-- vezes (ex.: retry após queda de rede), a restrição UNIQUE impede o duplicado.
-- No PostgreSQL, a coluna UNIQUE aceita vários NULL, então as safras já
-- existentes (sem local_id) não entram em conflito.
ALTER TABLE safra ADD COLUMN local_id UUID UNIQUE;

-- synced_at: momento em que a safra chegou ao backend (data do servidor).
-- Diferente de created_at, que é o instante do cadastro no aparelho.
ALTER TABLE safra ADD COLUMN synced_at TIMESTAMP;
