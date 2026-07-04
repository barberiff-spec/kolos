#!/usr/bin/env bash
# Держит KOLOS доступным в интернете (Docker + localtunnel)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VERCEL="$ROOT/node_modules/.bin/vercel"
LOG="$ROOT/.tunnel.log"

cd "$ROOT"
docker compose up -d

echo "KOLOS backend: http://localhost:8001/health"
echo "Запуск туннеля..."

while true; do
  npx --yes localtunnel --port 8001 2>&1 | tee "$LOG" &
  LT_PID=$!
  sleep 8
  URL=$(grep -oE 'https://[a-z0-9-]+\.loca\.lt' "$LOG" | tail -1 || true)
  if [ -n "$URL" ]; then
    echo ""
    echo "API URL: $URL/api/v1"
    echo "Сайт: https://frontend-blond-one-25.vercel.app"
    if [ -x "$VERCEL" ]; then
      printf '%s/api/v1\n' "$URL" | "$VERCEL" env rm NEXT_PUBLIC_API_URL production -y 2>/dev/null || true
      printf '%s/api/v1\n' "$URL" | "$VERCEL" env add NEXT_PUBLIC_API_URL production 2>/dev/null || true
      NEXT_PUBLIC_API_URL="$URL/api/v1" "$VERCEL" --prod --yes 2>/dev/null && echo "Vercel обновлён" || true
    fi
  fi
  wait "$LT_PID" || true
  echo "Туннель упал, переподключение через 5 сек..."
  sleep 5
done
