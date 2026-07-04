#!/usr/bin/env bash
# Временный публичный доступ к локальному backend (пока Mac включён)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "Запуск KOLOS локально..."
cd "$ROOT" && docker compose up -d

echo ""
echo "Туннель к API (скопируйте URL и обновите Vercel NEXT_PUBLIC_API_URL при смене):"
echo "  cd frontend && npx localtunnel --port 8001"
echo ""
echo "Сайт: https://frontend-blond-one-25.vercel.app"
echo "Backend локально: http://localhost:8001/docs"
