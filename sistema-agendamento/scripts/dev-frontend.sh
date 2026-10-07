#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"

if [[ ! -d node_modules ]]; then
  echo "Instalando dependencias do frontend..."
  npm install
fi

echo "App em http://localhost:5173"
exec npm run dev
