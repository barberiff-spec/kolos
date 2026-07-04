#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/node_modules/.bin"
RAILWAY="$CLI/railway"
VERCEL="$CLI/vercel"

cd "$ROOT"
[ -x "$RAILWAY" ] || { echo "Запустите: cd $ROOT && npm install"; exit 1; }

echo "=== KOLOS: деплой backend на Railway ==="

if ! "$RAILWAY" whoami &>/dev/null; then
  echo ""
  echo "Сначала войдите в Railway (откроется браузер):"
  echo "  $RAILWAY login"
  exit 1
fi

cd "$ROOT/backend"

if [ ! -f .railway/config.json ] 2>/dev/null && [ ! -f railway.toml ]; then
  :
fi

if ! "$RAILWAY" status &>/dev/null 2>&1; then
  echo "Создаю проект kolos-api..."
  "$RAILWAY" init --name kolos-api
fi

echo "Добавляю PostgreSQL (если ещё нет)..."
"$RAILWAY" add --database postgres 2>/dev/null || true

SECRET=$(openssl rand -hex 32 2>/dev/null || head -c 32 /dev/urandom | xxd -p)
"$RAILWAY" variables set \
  SECRET_KEY="$SECRET" \
  DEBUG=true \
  CORS_ORIGINS="https://kolos.vercel.app" \
  FRONTEND_URL="https://kolos.vercel.app" \
  2>/dev/null || "$RAILWAY" variables --set "SECRET_KEY=$SECRET" --set "DEBUG=true"

echo "Деплой backend..."
"$RAILWAY" up --detach

echo ""
echo "=== Backend задеплоен ==="
"$RAILWAY" status 2>/dev/null || true
echo ""
echo "Публичный URL (Settings → Networking → Generate Domain в railway.app):"
echo "  railway.app → проект kolos-api → backend → Settings → Generate Domain"
echo ""
echo "После получения URL запустите frontend:"
echo "  NEXT_PUBLIC_API_URL=https://ВАШ-URL.up.railway.app/api/v1 $ROOT/scripts/deploy-frontend.sh"
