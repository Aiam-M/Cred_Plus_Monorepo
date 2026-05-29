-- A3: versao do token por conta. Quando a senha e trocada, incrementamos este
-- numero; o JWT carrega a versao em que foi emitido. Se as versoes nao baterem,
-- o token e rejeitado. Isso invalida tokens antigos apos a troca de senha mesmo
-- com JWT sendo stateless (sem isso, um token roubado valeria ate expirar).
ALTER TABLE users    ADD COLUMN token_version integer NOT NULL DEFAULT 0;
ALTER TABLE empresas ADD COLUMN token_version integer NOT NULL DEFAULT 0;
