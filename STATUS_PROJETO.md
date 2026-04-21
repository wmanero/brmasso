# Status do Projeto

Ultima atualizacao: 2026-04-16

## Resumo

Projeto full stack da `@b.r.massoterapia` estruturado com:

- frontend em React + Vite
- backend em FastAPI
- banco PostgreSQL
- deploy inicial funcionando no OCI Ampere via Docker Compose

## O que foi entregue

- Estrutura do projeto criada em `br-massoterapia-app`
- `.venv` configurado para desenvolvimento Python local
- Backend FastAPI com:
  - autenticacao via `/api/v1/auth/login`
  - dashboard
  - clientes
  - anamneses
  - agendamentos
  - pagamentos
  - seed inicial de dados
- Frontend React com:
  - tela de login administrativo
  - dashboard operacional
  - formulario de cadastro de cliente
  - formulario de cadastro de agendamento
  - formulario de cadastro de pagamento
  - leitura de dados da API
- Docker:
  - `docker-compose.yml` para uso local
  - `infra/docker-compose.prod.yml` para producao
  - `nginx` reverso para frontend e API
- Documentacao inicial de deploy no OCI

## Validacoes concluidas

- Build do frontend validada localmente com `npm run build`
- Smoke test do backend validado localmente
- Deploy no OCI funcionando por IP publico
- Endpoint `/api/v1/health` respondendo corretamente
- Login pela API validado com `curl`
- Login pelo frontend validado apos ajuste do base URL da API

## Ajustes tecnicos realizados durante a implantacao

- Instalacao do Node.js local para build do frontend
- Correcao do frontend para usar `/api/v1` em producao por tras do `nginx`
- Troca do hash de senha para `pbkdf2_sha256` no backend para compatibilidade estavel
- Correcao de problema no OCI com `docker.socket` e `docker.service`
- Correcao de senha do Postgres no `.env` do servidor para evitar `@` na URL de conexao

## Estado atual em producao

- Servidor OCI: Ubuntu 24.04
- Deploy operacional por IP publico
- Containers esperados:
  - `br-massoterapia-postgres`
  - `br-massoterapia-backend`
  - `br-massoterapia-frontend`
  - `br-massoterapia-nginx`

## Credenciais e operacao

Observacao: nao registrar senhas reais neste arquivo.

Credenciais administrativas devem ser lidas do `.env` do servidor:

- `FIRST_SUPERUSER_EMAIL`
- `FIRST_SUPERUSER_PASSWORD`

Variaveis sensiveis atualmente usadas no projeto:

- `SECRET_KEY`
- `POSTGRES_PASSWORD`
- `PIX_KEY`
- futuras credenciais do Google
- futuras credenciais de pagamento

## Pendencias priorizadas

### Bloco funcional

- Integracao real com Google Calendar
- Integracao real com Google Forms
- Integracao real com pagamentos
- protecao/autorizacao real no frontend usando token armazenado

### Bloco de infraestrutura

- Criar dominio
- Apontar DNS para o OCI
- Configurar HTTPS com Certbot
- Revisar politica de backup do PostgreSQL
- Endurecer configuracoes de producao

### Bloco de produto

- Revisar layout para alinhar com a identidade visual do Instagram
- Melhorar UX de formularios e estados de carregamento
- Definir fluxo de sessao avulsa versus pacote

## Checklist de retomada

Quando voltar ao projeto:

1. Confirmar se o servidor OCI segue respondendo no IP publico.
2. Verificar containers:
   - `sudo docker compose --env-file .env -f infra/docker-compose.prod.yml ps`
3. Verificar logs se necessario:
   - `sudo docker compose --env-file .env -f infra/docker-compose.prod.yml logs --tail=100`
4. Confirmar login no frontend.
5. Escolher o proximo bloco:
   - Google Calendar
   - Google Forms
   - pagamentos
   - dominio e HTTPS
   - layout

## Comandos uteis

### Local

```powershell
cd c:\Users\Riartts\Documents\github\br-massoterapia-app
.\.venv\Scripts\Activate.ps1
pip install -e .\backend
cd frontend
npm install
npm run dev
```

### Deploy OCI

```bash
cd ~/brmasso
git pull
sudo docker compose --env-file .env -f infra/docker-compose.prod.yml up -d --build
sudo docker compose --env-file .env -f infra/docker-compose.prod.yml ps
```

### Logs OCI

```bash
sudo docker compose --env-file .env -f infra/docker-compose.prod.yml logs --tail=120
```

## Proximo passo recomendado

Na retomada, com acesso ao e-mail e conta Google disponiveis:

1. configurar Google Calendar real
2. testar criacao de eventos reais a partir do agendamento
3. depois integrar Google Forms
4. por fim revisar layout conforme a identidade visual da marca
