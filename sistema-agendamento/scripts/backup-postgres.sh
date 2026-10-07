#!/usr/bin/env bash
# Backup do Postgres do agendamento (Docker). Agende no cron do servidor OCI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CONTAINER="${POSTGRES_CONTAINER:-br-agendamento-postgres}"
DB_USER="${POSTGRES_USER:-brmasso}"
DB_NAME="${POSTGRES_DB:-br_agendamento}"
BACKUP_DIR="${BACKUP_DIR:-$ROOT/backups}"
STAMP="$(date +%Y%m%d_%H%M%S)"
FILE="$BACKUP_DIR/${DB_NAME}_${STAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

docker exec "$CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" | gzip > "$FILE"

echo "Backup salvo em $FILE"

# Opcional: enviar para OCI Object Storage (descomente e configure o profile OCI CLI)
# oci os object put --bucket-name SEU_BUCKET --file "$FILE" --name "agendamento/$(basename "$FILE")"

# Manter ultimos 14 arquivos locais
ls -1t "$BACKUP_DIR"/${DB_NAME}_*.sql.gz 2>/dev/null | tail -n +15 | xargs -r rm --
