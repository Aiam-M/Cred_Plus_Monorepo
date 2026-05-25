-- Campos adicionais necessários para o dashboard de empresas.
-- Todas as alterações são aditivas (ADD COLUMN), sem risco de perda de dados.

-- Safra: score ambiental calculado e data em que foi validada em campo.
ALTER TABLE safra ADD COLUMN agro_score INTEGER;
ALTER TABLE safra ADD COLUMN validada_em TIMESTAMP;

-- Associacao: localização textual exibida no catálogo (município/UF).
ALTER TABLE associacao ADD COLUMN municipio VARCHAR(100);
ALTER TABLE associacao ADD COLUMN estado CHAR(2);

-- Plantacao: unidade de medida da quantidade (padrão KG).
ALTER TABLE plantacao ADD COLUMN unidade VARCHAR(10) NOT NULL DEFAULT 'KG';

-- Traceability: dados de exibição de cada evento da cadeia.
ALTER TABLE traceability_event ADD COLUMN responsavel VARCHAR(200);
ALTER TABLE traceability_event ADD COLUMN responsavel_tipo VARCHAR(50);
ALTER TABLE traceability_event ADD COLUMN observacao TEXT;

-- Interesse: status de acompanhamento da negociação intermediada pela Amazon People.
ALTER TABLE interesse ADD COLUMN status VARCHAR(50) NOT NULL DEFAULT 'AGUARDANDO_CONTATO';
