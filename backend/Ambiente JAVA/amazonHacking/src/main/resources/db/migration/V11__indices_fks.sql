-- B12: indices nas demais chaves estrangeiras. O Postgres nao cria indice
-- automatico em FK; sem eles, JOINs e filtros por essas colunas viram varredura
-- de tabela inteira conforme o volume cresce.
CREATE INDEX idx_safra_users ON safra (users_id);
CREATE INDEX idx_safra_imagem_safra ON safra_imagem (safra_id);
CREATE INDEX idx_plantacao_safra ON plantacao (safra_id);
