-- Interesse: marca se o produtor já leu a mensagem enviada pela empresa.
-- Aditiva, sem risco de perda de dados. Registros antigos começam como não lidos
-- (false) — o produtor verá todas as mensagens existentes como "novas" da primeira
-- vez que abrir a tela de interesses no app.
ALTER TABLE interesse ADD COLUMN lida BOOLEAN NOT NULL DEFAULT false;

-- Índice parcial para a contagem de mensagens não lidas por produtor (badge no Dashboard).
-- O JOIN passa por safra(produtor_id); aqui só aceleramos o filtro pelas linhas não lidas.
CREATE INDEX IF NOT EXISTS idx_interesse_nao_lidos
    ON interesse (safra_id)
    WHERE lida = false;
