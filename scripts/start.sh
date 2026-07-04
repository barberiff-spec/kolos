#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

MODE="${1:-dev}"

if [ "$MODE" = "prod" ]; then
  if [ ! -f backend/.env.production ]; then
    echo "Создайте backend/.env.production из backend/.env.production.example"
    exit 1
  fi
  export $(grep -v '^#' .env.production 2>/dev/null | xargs) || true
  docker compose -f docker-compose.prod.yml up -d --build
  echo ""
  echo "KOLOS production запущен:"
  echo "  Frontend: http://localhost:${FRONTEND_PORT:-3001}"
  echo "  Backend:  http://localhost:${BACKEND_PORT:-8001}/docs"
  exit 0
fi

docker compose up -d --build

if [ ! -d frontend/node_modules ]; then
  (cd frontend && npm install)
fi

if [ ! -f frontend/.env.local ]; then
  cp frontend/.env.example frontend/.env.local
fi

echo ""
echo "KOLOS dev:"
echo "  Backend:  http://localhost:8001/docs"
echo "  Frontend: cd frontend && npm run dev  →  http://localhost:3001"
