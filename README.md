# BR Massoterapia App

Aplicacao full stack para a `@b.r.massoterapia` com React, FastAPI e PostgreSQL.

## Estrutura

- `frontend/`: painel React responsivo
- `backend/`: API, modelos, autenticacao e servicos
- `infra/`: suporte a containers e proxy

## Fluxos cobertos

- Dashboard com metricas operacionais
- Cadastro de clientes e historico de anamnese
- Agenda com status e observacoes
- Planos de atendimento, pacotes e saldo
- Pagamentos com Pix e cartao
- Atalhos para Google Forms e Google Calendar

## Execucao local

1. Copie `.env.example` para `.env`.
2. Ative `.\.venv\Scripts\Activate.ps1`.
3. Instale o backend com `pip install -e .\backend`.
4. Rode `uvicorn app.main:app --reload --app-dir backend`.
5. No frontend, rode `npm install` e `npm run dev`.

## Containers

`docker compose up --build`

## Deploy OCI

Guia de producao em [infra/DEPLOY_OCI.md](/c:/Users/Riartts/Documents/github/br-massoterapia-app/infra/DEPLOY_OCI.md).
