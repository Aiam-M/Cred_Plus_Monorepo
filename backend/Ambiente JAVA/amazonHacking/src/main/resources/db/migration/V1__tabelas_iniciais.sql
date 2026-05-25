create table associacao(
                           id integer generated always as identity primary key ,
                           nome varchar(150) not null ,
                           cnpj char(14) not null unique ,
                           descricao varchar(350),
                           latitude double precision,
                           longitude double precision,
                           area_total_hectares double precision
);

create table users(
                      id UUID primary key default gen_random_uuid(),
                      associacao_id integer references associacao(id) not null ,
                      nome varchar(350) not null          ,
                      email varchar(350) not null unique  ,
                      password_hash varchar(350) not null ,
                      role varchar(150) not null          ,
                      created_at timestamp default now()
);

create table safra(
                      id integer generated always as identity primary key ,
                      users_id uuid references users(id) not null ,
                      name varchar(250) not null ,
                      area_plantacao double precision ,
                      status varchar(150) not null ,
                      created_at timestamp default now()
);


create table plantacao(
                          id integer generated always as identity primary key ,
                          safra_id integer references safra(id) not null ,
                          tipo varchar(100) not null,
    -- Precisa ser em KG
                          quantidade double precision
);

create table safra_imagem(
                             id integer generated always as identity primary key ,
                             safra_id integer references safra(id) not null ,
                             url text not null ,
                             created_at timestamp default now()
);

create table empresas(
                         id uuid primary key default gen_random_uuid(),
                         cnpj varchar(14) not null unique ,
                         email varchar(150) not null unique ,
                         password_hash text not null,
                         segmento varchar(100),
                         created_at timestamp default now()
);

create table interesse(
                          id integer generated always as identity primary key,
                          safra_id integer references safra(id),
                          empresa_id uuid references empresas(id),
                          mensagem text,
                          created_at timestamp default now()
);

CREATE TABLE traceability_event (
                                    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                                    safra_id      INTEGER NOT NULL REFERENCES safra(id),
                                    tipo          VARCHAR(100) NOT NULL,
                                    dados         varchar not null ,
                                    hash          varchar NOT NULL,
                                    hash_anterior varchar,
                                    created_at    TIMESTAMP DEFAULT NOW()
);

