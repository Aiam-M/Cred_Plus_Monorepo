## Contexto

Projeto desenvolvido no contexto do **Amazon Hacking (CESUPA)**, com foco em
agricultura familiar regenerativa e tendo como comunidade piloto a **Vila Jutaiteua
(Moju-PA)**, produtora de cacau e açaí.

# Cred+ — Rastreabilidade para a Agricultura Familiar Amazônica

Cred+ é uma plataforma de **rastreabilidade e comprovação de origem sustentável**
para pequenos produtores da Amazônia. Ela conecta a agricultura
familiar a empresas que precisam comprovar conformidade ambiental — Como por exemplo: o
regulamento europeu **EUDR** (que exige provar que um produto não vem de áreas
desmatadas).

A ideia central é gerar uma **validação baseada em dados de satélite**, gerando uma trilha de origem confiável
e difícil de adulterar.

---

## O problema que resolvemos

Pequenos produtores amazônicos têm dificuldade de provar, de forma confiável e
barata, que sua produção é de origem sustentável. Sem essa prova, ficam fora de
mercados que exigem conformidade ambiental.

Ao mesmo tempo, empresas compradoras precisam de evidências auditáveis de que cada
lote comprado não está ligado a desmatamento.

Cred+ liga essas duas pontas:

- **Para o produtor:** uma forma simples de cadastrar suas safras — inclusive **sem
  internet** — e ter sua origem validada automaticamente.
- **Para a empresa:** um catálogo de safras já verificadas, com nota ambiental e
  histórico de origem rastreável.

---

## O que a plataforma faz

- **Cadastro de safras offline-first:** o produtor registra a safra no celular mesmo
  sem conexão; os dados são salvos localmente e enviados ao servidor quando houver
  internet.
- **Validação ambiental por satélite (AgroScore):** cada safra recebe uma nota de
  0 a 100 calculada a partir de dados de satélite da região da associação.
- **Cadeia de rastreabilidade imutável:** cada safra acumula eventos (cadastro,
  validação, interesse de empresa, etc.) encadeados por **hash SHA-256**, no estilo
  blockchain — alterar um evento antigo quebraria toda a cadeia.
- **Catálogo para empresas:** empresas compradoras visualizam safras disponíveis,
  filtram por produto/nota/região, consultam o AgroScore detalhado e demonstram
  interesse de compra.
- **Autenticação e autorização:** produtores e empresas têm contas separadas, com
  login via **JWT**; cada usuário só acessa os próprios dados.

---

## Como funciona (visão geral)

A plataforma é um **monorepo** com quatro componentes que se conversam:

```
┌─────────────────────┐         ┌─────────────────────┐
│   App do Produtor    │         │ Dashboard de Empresas│
│   (React PWA,        │         │   (React SPA,        │
│    offline-first)    │         │    catálogo + ESG)   │
└──────────┬───────────┘         └──────────┬───────────┘
           │  REST / JWT                     │  REST / JWT
           └─────────────┬───────────────────┘
                         ▼
              ┌────────────────────────┐
              │   Backend (Spring Boot)│
              │  API REST, regras de   │
              │  negócio, AgroScore,   │
              │  rastreabilidade, sync │
              └─────┬──────────────┬───┘
                    │              │
        JDBC/Flyway │              │ HTTP
                    ▼              ▼
        ┌──────────────────┐  ┌────────────────────────────┐
        │   PostgreSQL     │  │  Microserviço GEE (Python)  │
        │   (NeonDB)       │  │  Google Earth Engine:       │
        │                  │  │  NDVI, Hansen, etc.         │
        └──────────────────┘  └────────────────────────────┘
```

### 1. Cadastro offline e sincronização

O app do produtor guarda as safras localmente (IndexedDB, via Dexie). Quando há
conexão, envia o lote para o endpoint. A sincronização é:

- **Idempotente:** cada safra carrega um `localId` (UUID gerado no app). Se já existir
  no banco, não duplica — só responde "já sincronizado". Isso protege contra reenvios
  por queda de rede.
- **Segura:** a safra é sempre vinculada ao produtor autenticado (vindo do JWT), nunca
  a um id enviado pelo cliente.
- **Atômica:** o lote inteiro roda em uma transação.

### 2. AgroScore (validação por satélite)

Depois do cadastro, o backend pede ao microserviço Python os dados de satélite da
região (índices de vegetação como NDVI, e dados de cobertura florestal do Hansen
Global Forest Change). Com esses dados, o `AgroScoreService` calcula uma nota de
**0 a 100** somando cinco critérios ambientais.

Se o microserviço estiver fora do ar no momento do cadastro, a safra fica
"aguardando validação" e o sistema tenta recalcular periodicamente (reconciliação
automática).

### 3. Rastreabilidade (hash encadeado)

Cada evento relevante da safra vira um `traceability_event` com um hash SHA-256
calculado a partir do conteúdo do evento **somado ao hash do evento anterior**. O
resultado é uma cadeia verificável: o dashboard consegue conferir se ela está íntegra.

### 4. Consumo pelas empresas

O dashboard de empresas consome a API REST para listar safras, ver detalhes,
consultar o AgroScore e a cadeia de rastreabilidade, e registrar interesse de compra.

---

## Estrutura do repositório

```
Monorepo Amazon Hacking/
├── backend/
│   ├── Ambiente JAVA/amazonHacking/        # API principal (Spring Boot)
│   └── Ambiente PYTHON/python-gee-micro/   # Microserviço Google Earth Engine (Flask)
└── frontend/
    ├── app produtor/credplus-pwa/          # App do produtor (React PWA, offline-first)
    └── dashboard empresas/Cred--Dashboard/ # Dashboard das empresas compradoras (React)
```

---

## Componentes

### Backend — API principal (`backend/Ambiente JAVA/amazonHacking`)

Coração do sistema: regras de negócio, autenticação, AgroScore, rastreabilidade e
sincronização.

**Stack:**

- Java 21 + Spring Boot 3.4
- Spring Web (REST), Spring Data JPA, Bean Validation
- Spring Security + JWT (biblioteca `java-jwt`), senhas com BCrypt
- PostgreSQL (NeonDB serverless) com migrations **Flyway**
- Cloudinary (upload das fotos de comprovação da safra)
- Bucket4j (rate limiting)

**Modelo de domínio:**

| Tabela              | Significado                                                   |
|---------------------|---------------------------------------------------------------|
| `associacao`        | Associação de agricultores (geolocalizada)                    |
| `users`             | Produtores membros da associação                              |
| `safra`             | Registro de safra/colheita                                    |
| `plantacao`         | Detalhes das plantações (tipo, quantidade)                    |
| `safra_imagem`      | URLs das fotos de comprovação                                 |
| `empresas`          | Empresas compradoras                                          |
| `interesse`         | Interesse de uma empresa em uma safra                         |
| `traceability_event`| Evento da cadeia de rastreabilidade (hash SHA-256 encadeado)  |
 

---

### Microserviço GEE (`backend/Ambiente PYTHON/python-gee-micro`)

Pequeno serviço Flask que conversa com o **Google Earth Engine** e devolve os dados
de satélite que o backend usa para calcular o AgroScore.

**Stack:** Python + Flask + `earthengine-api` (servido com Gunicorn em produção).

> A região analisada (polígono da comunidade) fica definida na configuração do serviço.

---

### App do Produtor (`frontend/app produtor/credplus-pwa`)

PWA (Progressive Web App) que o produtor usa para cadastrar e acompanhar suas safras,
**funcionando mesmo sem internet**.

**Stack:** React 19 + TypeScript, Vite, `vite-plugin-pwa`, Tailwind CSS, componentes
Radix UI, **Dexie** (IndexedDB) para a base offline, React Router e React Hook Form.

**Como o offline funciona:** os dados são guardados no IndexedDB do navegador e
sincronizados com o backend (`POST /cred/sync`) quando há conexão.

---

### Dashboard de Empresas (`frontend/dashboard empresas/Cred--Dashboard`)

Aplicação web onde as empresas compradoras exploram o catálogo de safras verificadas,
veem o AgroScore detalhado, a cadeia de rastreabilidade e demonstram interesse.

**Stack:** React 19, Vite, Tailwind CSS, React Router, **Recharts** (gráficos) e
`lucide-react` (ícones).

---

## Como rodar localmente

Cada componente roda de forma independente. Configure as variáveis de ambiente a
partir dos arquivos de exemplo (`.env.example` / `.env-example`)

### Backend (API Spring Boot)

Outras variáveis usadas pela aplicação (definidas por ambiente):

| Variável               | Propósito                                                  |
|------------------------|------------------------------------------------------------|
| `DB_HOST`              | Host do PostgreSQL (NeonDB)                                |
| `DB_USER`              | Usuário do banco                                           |
| `DB_PASSWORD`          | Senha do banco                                            |
| `JWT_SECRET`           | Segredo usado para assinar os tokens JWT                  |
| `PYTHON_SERVICE_URL`   | URL do microserviço GEE (padrão: `http://localhost:5000`) |
| `GEE_KEY_PATH`         | Caminho da chave de serviço do Google Earth Engine        |
| `CLOUDINARY_URL`       | Credencial do Cloudinary para upload de imagens           |
| `CORS_ALLOWED_ORIGINS` | Origens liberadas no CORS (URLs dos frontends)            |
| `PORT`                 | Porta do servidor (padrão `8080`)                         |


> O schema do banco vive nas migrations Flyway (`src/main/resources/db/migration/`).
> O Hibernate roda com `ddl-auto=validate`: toda mudança de schema precisa ser uma
> migration, nunca auto-DDL.

### Frontends (App do Produtor e Dashboard)

A partir da respectiva pasta do app:

---

## Resumo da stack

| Camada                | Tecnologias                                                       |
|-----------------------|-------------------------------------------------------------------|
| API principal         | Java 21, Spring Boot 3.4, Spring Security + JWT, JPA, Flyway      |
| Banco de dados        | PostgreSQL (NeonDB)                                               |
| Validação ambiental   | Python, Flask, Google Earth Engine                               |
| App do produtor       | React 19 + TypeScript, Vite, PWA, Dexie (IndexedDB), Tailwind    |
| Dashboard empresas    | React 19, Vite, Tailwind, Recharts                               |
| Imagens               | Cloudinary                                                       |

---

