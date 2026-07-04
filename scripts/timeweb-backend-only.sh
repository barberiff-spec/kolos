#!/usr/bin/env bash
# Timeweb: только backend + PostgreSQL (frontend на Vercel)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f backend/.env.production ]; then
  echo "Скопируйте backend/.env.production.example → backend/.env.production"
  exit 1
fi

docker compose -f docker-compose.backend-only.yml up -d --build

echo ""
echo "Backend: http://$(curl -s ifconfig.me 2>/dev/null || echo 'ВАШ_IP'):8001/docs"
echo "Обновите NEXT_PUBLIC_API_URL на Vercel:"
echo "  https://api.ваш-домен.ru/api/v1"
