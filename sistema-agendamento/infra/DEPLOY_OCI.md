# Deploy — Sistema de agendamento interno (OCI)

Guia para Ubuntu 22.04/24.04 na Oracle Cloud (Ampere), com Docker Compose, HTTPS e backup.

## 1. DNS e firewall

- Crie um subdominio, ex.: `agenda.seudominio.com.br`, apontando para o IP publico da VM.
- Libere portas **80** e **443** no Security List do OCI e no `ufw` do servidor.

## 2. Clonar e configurar

```bash
git clone <URL> brmasso
cd brmasso/sistema-agendamento
cp .env.example .env
```

Edite `.env`:

- `SECRET_KEY`, `POSTGRES_PASSWORD` (evite `@` na senha)
- `APP_DOMAIN=agenda.seudominio.com.br`
- `FRONTEND_URL=https://agenda.seudominio.com.br`
- `DATABASE_URL` e credenciais das terapeutas

## 3. Subir em producao

```bash
docker compose -f infra/docker-compose.prod.yml up -d --build
docker compose -f infra/docker-compose.prod.yml ps
```

Teste HTTP: `http://agenda.seudominio.com.br/api/v1/health`

## 4. HTTPS (Let's Encrypt)

Com o nginx ja rodando (porta 80):

```bash
cd sistema-agendamento
docker compose -f infra/docker-compose.prod.yml run --rm certbot certonly \
  --webroot -w /var/www/certbot \
  -d agenda.seudominio.com.br \
  --email seu-email@dominio.com.br --agree-tos --no-eff-email
```

Ajuste `infra/nginx/default.ssl.conf` com o dominio correto e troque o mount no compose **ou** copie o conteudo para `default.conf`:

```bash
cp infra/nginx/default.ssl.conf infra/nginx/default.conf
# edite server_name e caminhos ssl se necessario
docker compose -f infra/docker-compose.prod.yml restart nginx
```

Renovacao (cron semanal no host):

```bash
0 3 * * 1 cd /caminho/sistema-agendamento && docker compose -f infra/docker-compose.prod.yml run --rm certbot renew && docker compose -f infra/docker-compose.prod.yml restart nginx
```

## 5. Backup automatico do Postgres

Script: `scripts/backup-postgres.sh`

```bash
chmod +x scripts/backup-postgres.sh
./scripts/backup-postgres.sh
```

Cron diario (exemplo 2h):

```bash
0 2 * * * /caminho/sistema-agendamento/scripts/backup-postgres.sh >> /var/log/br-agendamento-backup.log 2>&1
```

Para copiar backups para **OCI Object Storage**, instale o [OCI CLI](https://docs.oracle.com/en-us/iaas/Content/API/SDKDocs/cliinstall.htm), configure `~/.oci/config` e descomente a linha `oci os object put` no script.

## 6. Atualizacoes

```bash
git pull
docker compose -f infra/docker-compose.prod.yml up -d --build
```

## 7. Restore de backup

```bash
gunzip -c backups/br_agendamento_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i br-agendamento-postgres psql -U brmasso -d br_agendamento
```
