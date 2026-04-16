# Deploy no OCI Ampere

Este guia assume:

- Ubuntu 22.04 ou 24.04 no OCI
- acesso SSH como usuario com `sudo`
- dominio apontando para o IP publico do servidor
- portas `80` e `443` liberadas no OCI e no firewall do sistema

## 1. Preparar o servidor

Atualize o sistema:

```bash
sudo apt update && sudo apt upgrade -y
```

Instale pacotes basicos:

```bash
sudo apt install -y ca-certificates curl git ufw
```

Libere SSH, HTTP e HTTPS:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

## 2. Instalar Docker no OCI

Instale Docker:

```bash
curl -fsSL https://get.docker.com | sudo sh
```

Adicione seu usuario ao grupo Docker:

```bash
sudo usermod -aG docker $USER
newgrp docker
```

Valide:

```bash
docker --version
docker compose version
```

## 3. Subir o projeto no servidor

Clone o repositorio:

```bash
git clone <URL_DO_REPOSITORIO> br-massoterapia-app
cd br-massoterapia-app
```

Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

Edite `.env` e ajuste no minimo:

```env
SECRET_KEY=troque-por-uma-chave-forte
FIRST_SUPERUSER_EMAIL=seu-email-admin
FIRST_SUPERUSER_PASSWORD=uma-senha-forte
POSTGRES_DB=br_massoterapia
POSTGRES_USER=brmasso
POSTGRES_PASSWORD=troque-esta-senha
APP_DOMAIN=seu-dominio.com.br
FRONTEND_URL=https://seu-dominio.com.br
GOOGLE_CALENDAR_ID=primary
GOOGLE_FORM_URL=https://forms.gle/seu-formulario
PIX_KEY=sua-chave-pix
PAYMENT_PROVIDER=mock
```

## 4. Build e subida inicial

Suba a stack de producao:

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
```

Cheque os containers:

```bash
docker compose -f infra/docker-compose.prod.yml ps
```

Cheque logs se preciso:

```bash
docker compose -f infra/docker-compose.prod.yml logs -f
```

## 5. SSL com Certbot

Com o dominio ja apontado para o servidor, gere o certificado:

```bash
docker compose -f infra/docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d seu-dominio.com.br -d www.seu-dominio.com.br \
  --email seu-email@dominio.com.br --agree-tos --no-eff-email
```

Depois ajuste o `nginx` para HTTPS. O arquivo atual ja atende o bootstrap em HTTP; apos emitir o certificado, vale criar uma versao TLS com redirecionamento de `80` para `443`.

## 6. Atualizacoes futuras

Quando alterar o projeto:

```bash
git pull
docker compose -f infra/docker-compose.prod.yml up -d --build
```

## 7. Backup minimo do banco

Dump manual:

```bash
docker exec br-massoterapia-postgres pg_dump -U brmasso br_massoterapia > backup.sql
```

Restore:

```bash
cat backup.sql | docker exec -i br-massoterapia-postgres psql -U brmasso -d br_massoterapia
```

## 8. Pendencias para entrar em producao real

- substituir `PAYMENT_PROVIDER=mock` por Mercado Pago, Asaas ou Stripe
- configurar credenciais reais do Google Calendar
- configurar ingestao real do Google Forms
- adicionar HTTPS definitivo no nginx
- definir rotina automatica de backup
