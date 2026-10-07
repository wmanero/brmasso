# Sistema de agendamento interno — Barbará Rodrigues Massoterapia

Aplicação **interna** para as massoterapeutas: login, cadastro de clientes e anamnese, e agenda compartilhada (visibilidade dos horários de ambas).

Este diretório concentra o novo produto de forma isolada do site público (`frontend/`) e do app legado na raiz (`backend/`, `frontend_bkp/`).

## Documentação

- **[docs/PLANEJAMENTO.md](./docs/PLANEJAMENTO.md)** — stacks, arquitetura, modelo de dados, fases e deploy no OCI (Oracle Cloud).

## Decisões fechadas

- Projeto **isolado** nesta pasta (banco e deploy separados do app na raiz).
- **Conflito de horário** só para a **mesma profissional** (duas profissionais podem ter horários sobrepostos).
- **Anamnese simples** (resumo, dores, contraindicações).
- **Mobile-first**, com layout responsivo para desktop.

## Execução local (dev)

1. Copie `.env.example` para `.env` e ajuste senhas.
2. Backend (SQLite rápido, sem Docker) — exige **Python 3.12+** (o `python3` do macOS costuma ser 3.9 e não serve):

```bash
cd sistema-agendamento/backend
# Homebrew: brew install python@3.12  (se ainda não tiver)
python3.12 -m venv .venv && source .venv/bin/activate
python --version   # deve mostrar 3.12.x
pip install -U pip && pip install .
DATABASE_URL=sqlite:///./agendamento.db uvicorn app.main:app --reload --port 8000
```

Se você já criou `.venv` com Python 3.9, apague e recrie: `rm -rf .venv` antes do `python3.12 -m venv .venv`.

3. Subir a API — **no Terminal**, em **outra aba/janela** (nao e codigo para colar em arquivo):

```bash
cd sistema-agendamento/backend
source .venv/bin/activate
DATABASE_URL=sqlite:///./agendamento.db uvicorn app.main:app --reload --port 8000
```

- `DATABASE_URL=...` na frente do comando so define o banco **para essa execucao** (SQLite local em `backend/agendamento.db`).
- Deixe esse terminal **aberto** enquanto desenvolve; para parar: `Ctrl+C`.

Atalho (faz o mesmo):

```bash
./sistema-agendamento/scripts/dev-backend.sh
```

Teste: abra no navegador http://127.0.0.1:8000/api/v1/health — deve aparecer `{"status":"ok"}`.

### Erro 502 no login

Significa que o **frontend nao conseguiu falar com a API** (geralmente a API nao subiu de verdade).

1. Confira o terminal do backend: precisa aparecer `Uvicorn running on http://127.0.0.1:8000` **sem** traceback vermelho.
2. Use o app em **http://localhost:5173** (`npm run dev`), nao a porta **8081** (essa e so com Docker completo).
3. No `.env`, para dev local use `DATABASE_URL=sqlite:///./agendamento.db` (veja `.env.example`).
4. Reinicie o backend apos mudar o `.env`: `Ctrl+C` e suba de novo.

4. Subir o frontend — **terceira aba** do Terminal (ou use o atalho):

```bash
cd sistema-agendamento/frontend
npm install
npm run dev
# ou: ./sistema-agendamento/scripts/dev-frontend.sh
```

Abra http://localhost:5173 — o Vite encaminha `/api` para a API na porta 8000.

Usuárias seed: e-mails e senhas em `THERAPIST_1_*` e `THERAPIST_2_*` no `.env` (apenas na **primeira criação**). Depois, use **Conta → alterar senha** no app; reiniciar a API nao reseta a senha.

## Docker Compose

Na pasta `sistema-agendamento/`:

```bash
cp .env.example .env
docker compose up --build
```

- API: http://localhost:8001/api/v1/health  
- App: http://localhost:8081  

Producao OCI (HTTPS, backup): [infra/DEPLOY_OCI.md](./infra/DEPLOY_OCI.md)

## Funcionalidades recentes

- Toque em um agendamento na agenda: detalhe, editar, marcar realizado ou cancelar
- Menu **Conta**: alterar senha (nao depende mais so do `.env`)

## Estrutura

```
sistema-agendamento/
├── backend/
├── frontend/
├── docker-compose.yml
└── .env.example
```
