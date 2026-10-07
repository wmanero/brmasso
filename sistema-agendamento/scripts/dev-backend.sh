#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/backend"

if [[ ! -d .venv ]]; then
  echo "Ambiente virtual nao encontrado. Rode primeiro:"
  echo "  cd $ROOT/backend && python3.12 -m venv .venv && source .venv/bin/activate && pip install -U pip && pip install ."
  exit 1
fi

# shellcheck source=/dev/null
source .venv/bin/activate

# Desenvolvimento local: SQLite (ignore POSTGRES do .env de producao/Docker)
export DATABASE_URL="sqlite:///./agendamento.db"

echo "API em http://127.0.0.1:8000 (docs: http://127.0.0.1:8000/docs)"
exec uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
