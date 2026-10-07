# Planejamento — Sistema de agendamento interno

Última revisão: 2026-10-07

## 1. Objetivo do produto

| Necessidade | Comportamento esperado |
|-------------|------------------------|
| **Login** | Apenas usuários internos (2 massoterapeutas; opcionalmente 1 admin). Sessão segura, logout, troca de senha. |
| **Anamnese** | Cadastro de cliente + ficha de anamnese (histórico, dores, contraindicações). Consulta rápida antes da sessão. |
| **Agendamentos** | Criar, editar, cancelar e marcar como realizado. |
| **Agenda compartilhada** | Calendário único onde **ambas veem todos os horários**, com indicação clara de **quem atende** cada slot (evitar choque de sala/horário). |

Fora do escopo inicial (fase 2+): pagamentos, pacotes, integração Google Calendar/Forms, área do cliente final.

---

## 2. Contexto no repositório `brmasso`

Já existe na raiz:

- **Backend** FastAPI + PostgreSQL + JWT (`backend/`)
- **Frontend React** em `frontend_bkp/` (painel admin parcial)
- **Deploy OCI** documentado em `infra/DEPLOY_OCI.md` (Docker Compose, nginx, Certbot)

O modelo atual de `Appointment` **não** associa agendamento a massoterapeuta — será necessário `therapist_id` (ou equivalente) no novo sistema.

**Duas estratégias possíveis:**

| Abordagem | Prós | Contras |
|-----------|------|---------|
| **A — Evoluir `backend/` + novo `sistema-agendamento/frontend`** | Menos duplicação; reaproveita auth e CRUD | Acoplamento ao monólito; migração de schema no mesmo banco |
| **B — Monorepo isolado em `sistema-agendamento/` (backend + frontend próprios)** | Escopo claro, deploy independente, schema enxuto | Duplicar boilerplate (auth, Docker) |

**Recomendação:** **B** para este produto interno — pasta autônoma, banco e containers separados (ex.: subdomínio `agenda.seudominio.com.br`), copiando **padrões** do backend existente (FastAPI, JWT, SQLAlchemy) sem arrastar pagamentos/planos na v1.

---

## 3. Stack recomendada (alinhada ao OCI Ampere)

Oracle Cloud Instance (Ampere ARM) + Ubuntu + Docker é o cenário já validado no projeto. Todas as opções abaixo rodam bem em **linux/arm64**.

### 3.1 Backend

| Camada | Escolha | Motivo |
|--------|---------|--------|
| Linguagem | **Python 3.12+** (3.13 se preferir paridade com `backend/`) | Equipe já usa; imagens Docker multi-arch |
| Framework | **FastAPI** | OpenAPI, async, tipagem; mesmo do repo |
| ORM | **SQLAlchemy 2.x** | Maduro, migrations com **Alembic** |
| Banco | **PostgreSQL 16** (container ou OCI PostgreSQL managed) | Relacional, JSONB se precisar campos flexíveis na anamnese |
| Auth | **JWT** (access + refresh opcional) + **passlib** (`pbkdf2_sha256`, já usado em prod) | Stateless, simples atrás do nginx |
| Validação | **Pydantic v2** | Integrado ao FastAPI |
| Servidor | **Uvicorn** | Padrão FastAPI |

Alternativa descartada na v1: Supabase/Firebase — adiciona vendor lock-in e complica LGPD/dados de saúde sem ganho claro para 2 usuárias.

### 3.2 Frontend

| Camada | Escolha | Motivo |
|--------|---------|--------|
| Framework | **React 19 + TypeScript** | Consistente com `frontend_bkp/` |
| Build | **Vite** | Build rápido, bundle pequeno |
| HTTP | **fetch** ou **TanStack Query** | Cache, retry e estados de loading na agenda |
| UI | **Tailwind CSS + shadcn/ui** (ou Radix + tokens próprios) | Painel limpo, mobile-friendly (uso no celular na clínica) |
| Calendário | **FullCalendar** (`@fullcalendar/react`) ou **react-big-calendar** | Visão dia/semana/mês; eventos coloridos por profissional |
| Forms | **React Hook Form + Zod** | Anamnese longa com validação |
| Roteamento | **React Router** | Login, agenda, clientes, detalhe anamnese |

Alternativa: Next.js — útil se no futuro houver SEO público; para app **100% interno**, SPA + Vite é mais simples no nginx estático.

### 3.3 Infraestrutura (OCI)

| Componente | Escolha |
|------------|---------|
| Orquestração | **Docker Compose** (1 VM Ampere) — mesmo padrão de `infra/docker-compose.prod.yml` |
| Proxy | **nginx** — `/api` → backend, `/` → frontend estático |
| TLS | **Let's Encrypt + Certbot** |
| Secrets | `.env` no servidor (nunca commitar); `SECRET_KEY`, `POSTGRES_PASSWORD` sem `@` na URL |
| Backup | `pg_dump` cron diário → Object Storage OCI (fase infra logo após MVP) |

**Recursos mínimos sugeridos:** 1 OCPU / 6 GB RAM na VM já comporta Postgres + API + nginx + frontend com folga para 2 usuárias concurrentes.

**Imagem Docker:** usar `platform: linux/arm64` ou builds nativos no Ampere; imagens oficiais `postgres:16-alpine`, `python:3.12-slim`, `nginx:alpine` suportam ARM.

---

## 4. Modelo de dados (v1)

```mermaid
erDiagram
    User ||--o{ Appointment : performs
    Client ||--o{ Anamnesis : has
    Client ||--o{ Appointment : books
    User {
        int id PK
        string full_name
        string email UK
        string hashed_password
        bool is_active
        string role "therapist|admin"
    }
    Client {
        int id PK
        string full_name
        string phone
        string email optional
        text notes optional
    }
    Anamnesis {
        int id PK
        int client_id FK
        text summary
        text pain_points
        text contraindications
        datetime submitted_at
        int created_by_user_id FK optional
    }
    Appointment {
        int id PK
        int client_id FK
        int therapist_id FK
        datetime starts_at
        int duration_minutes
        string status
        text notes optional
    }
```

**Regras de negócio importantes:**

1. **Agenda compartilhada:** listagem/calendário retorna appointments de **todos** os `therapist_id`; filtro opcional “só minha agenda”.
2. **Conflito de sala:** na v1, validar no backend se já existe appointment **no mesmo intervalo** (independente da profissional) **ou** permitir sobreposição só se forem profissionais diferentes — **decisão de produto** (recomendação: bloquear sobreposição total de horário na mesma sala = um slot por vez).
3. **Anamnese:** permitir várias fichas por cliente (histórico); exibir a mais recente em destaque.
4. **LGPD:** dados sensíveis de saúde — HTTPS obrigatório, acesso só autenticado, log mínimo, política de retenção documentada.

---

## 5. API (esboço REST)

Prefixo sugerido: `/api/v1`

| Área | Endpoints |
|------|-----------|
| Auth | `POST /auth/login`, `POST /auth/refresh` (opcional), `GET /auth/me` |
| Usuários | `GET /users` (admin), seed das 2 terapeutas via env |
| Clientes | CRUD `/clients` |
| Anamnese | `POST /clients/{id}/anamneses`, `GET /clients/{id}/anamneses` |
| Agenda | `GET /appointments?from=&to=`, CRUD `/appointments` |

OpenAPI em `/docs` apenas em desenvolvimento ou protegido em produção.

---

## 6. UX — telas v1

1. **Login**
2. **Agenda** (default após login) — semana/dia, legenda de cores por profissional
3. **Novo/editar agendamento** — modal ou drawer (cliente, profissional, horário, serviço, notas)
4. **Clientes** — lista + busca
5. **Cliente detalhe** — dados + timeline de anamneses + próximos agendamentos
6. **Nova anamnese** — formulário estruturado (campos alinhados ao que vocês já usam na clínica)

---

## 7. Segurança

- Senhas com hash forte (pbkdf2 ou bcrypt consistente com prod atual)
- JWT curto (15–60 min) + refresh em cookie httpOnly (opcional, mais seguro que localStorage)
- CORS restrito ao domínio do frontend
- Rate limit no login (nginx ou middleware)
- Sem exposição do Postgres na internet (só rede Docker)

---

## 8. Fases de entrega

| Fase | Entrega |
|------|---------|
| **0** | Aprovar este plano + campos exatos da ficha de anamnese |
| **1** | Backend: auth, users seed, clients, appointments com `therapist_id`, testes de conflito |
| **2** | Frontend: login + calendário compartilhado + CRUD agendamento |
| **3** | Anamnese completa + histórico por cliente |
| **4** | Docker Compose local + doc deploy OCI dedicada em `sistema-agendamento/infra/` |
| **5** | HTTPS, backup Postgres, hardening |

---

## 9. Decisões confirmadas (2026-10-07)

1. **Abordagem B** — monorepo isolado em `sistema-agendamento/`.
2. **Conflito de horário** — apenas para a **mesma profissional** (HTTP 409 na API).
3. **Anamnese** — versão simples (`summary`, `pain_points`, `contraindications`).
4. **UX** — **mobile-first** com suporte desktop (nav inferior no celular, grade semanal no desktop).
5. **Domínio OCI** — a definir na fase de deploy (subdomínio recomendado).

---

## 10. Resumo executivo da stack

```
[ Browser SPA: React + Vite + TS + FullCalendar ]
                    │ HTTPS
              [ nginx ]
                 /     \
        [ static ]   [ FastAPI + Uvicorn ]
                         │
                   [ PostgreSQL 16 ]
                         │
              [ OCI Ampere VM + Docker Compose ]
```

Stack única, previsível, já parcialmente provada no `brmasso`, adequada a servidor Oracle (OCI) com Docker e baixo custo operacional para duas usuárias.
