#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/node_modules/.bin"
VERCEL="$CLI/vercel"
RAILWAY="$CLI/railway"

API_URL="${NEXT_PUBLIC_API_URL:-}"
if [ -z "$API_URL" ]; then
  echo "Укажите URL API Railway:"
  echo "  NEXT_PUBLIC_API_URL=https://xxx.up.railway.app/api/v1 $0"
  exit 1
fi

if ! "$VERCEL" whoami &>/dev/null; then
  echo "Сначала: $VERCEL login"
  exit 1
fi

# Обновить CORS на Railway
FRONTEND_ORIGIN="${API_URL%/api/v1}"
FRONTEND_ORIGIN="${FRONTEND_ORIGIN%/*}"
# Vercel URL задаётся после деплоя — обновим вручную если нужно

cd "$ROOT/frontend"
echo "=== KOLOS: деплой frontend на Vercel ==="
echo "API: $API_URL"

NEXT_PUBLIC_API_URL="$API_URL" "$VERCEL" --prod --yes \
  --env "NEXT_PUBLIC_API_URL=$API_URL"

echo ""
echo "=== Готово! ==="
echo "Откройте URL выше (vercel.app)"
echo ""
echo "Обновите CORS на Railway — подставьте ваш vercel.app URL:"
echo "  cd backend && ../node_modules/.bin/railway variables set CORS_ORIGINS=https://ВАШ.vercel.app FRONTEND_URL=https://ВАШ.vercel.app"
