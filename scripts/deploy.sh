#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/node_modules/.bin"

echo "=== KOLOS Deploy ==="
echo ""

if [ ! -f "$CLI/railway" ]; then
  echo "Устанавливаю CLI..."
  cd "$ROOT" && npm install @railway/cli vercel
fi

case "${1:-help}" in
  login)
    echo "1/2 Railway — откроется браузер для входа"
    "$CLI/railway" login
    echo ""
    echo "2/2 Vercel — откроется браузер для входа"
    "$CLI/vercel" login
    ;;
  backend)
    cd "$ROOT/backend"
    echo "Деплой backend на Railway..."
    "$CLI/railway" up --detach
    echo ""
    echo "URL backend:"
    "$CLI/railway" domain 2>/dev/null || "$CLI/railway" status
    ;;
  frontend)
    API_URL="${NEXT_PUBLIC_API_URL:-}"
    if [ -z "$API_URL" ]; then
      echo "Укажите URL API Railway:"
      echo "  NEXT_PUBLIC_API_URL=https://xxx.up.railway.app/api/v1 ./scripts/deploy.sh frontend"
      exit 1
    fi
    cd "$ROOT/frontend"
    echo "Деплoy frontend на Vercel (API: $API_URL)..."
    NEXT_PUBLIC_API_URL="$API_URL" "$CLI/vercel" --prod --yes \
      --env "NEXT_PUBLIC_API_URL=$API_URL"
    ;;
  all)
    "$0" login
    echo ""
    echo "=== Backend ==="
    cd "$ROOT/backend"
    if ! "$CLI/railway" status &>/dev/null; then
      "$CLI/railway" init --name kolos-api
      "$CLI/railway" add --database postgres 2>/dev/null || true
    fi
    "$CLI/railway" variables set SECRET_KEY="$(openssl rand -hex 32)" DEBUG=true 2>/dev/null || true
    "$0" backend
    ;;
  *)
    echo "Использование:"
    echo "  ./scripts/deploy.sh login     — войти в Railway и Vercel"
    echo "  ./scripts/deploy.sh backend   — задеплоить API"
    echo "  ./scripts/deploy.sh frontend  — задеплоить сайт (нужен NEXT_PUBLIC_API_URL)"
    echo ""
    echo "Полный цикл:"
    echo "  ./scripts/deploy.sh login"
    echo "  cd backend && ../node_modules/.bin/railway init"
    echo "  ../node_modules/.bin/railway add --database postgres"
    echo "  ../scripts/deploy.sh backend"
    echo "  NEXT_PUBLIC_API_URL=https://ВАШ-URL.up.railway.app/api/v1 ../scripts/deploy.sh frontend"
    ;;
esac
