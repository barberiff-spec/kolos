#!/usr/bin/env bash
# Подготовка push backend на Amvera (после создания проекта kolos-api в личном кабинете)
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
AMVERA_USER="${1:-}"

if [ -z "$AMVERA_USER" ]; then
  echo "Использование: $0 ВАШ-ЛОГИН-AMVERA"
  echo ""
  echo "1. Зарегистрируйтесь на https://amvera.ru"
  echo "2. Создайте проект «kolos-api» (Docker)"
  echo "3. Создайте проект PostgreSQL, скопируйте DATABASE_URL"
  echo "4. Запустите: $0 ваш-логин"
  exit 1
fi

cd "$ROOT"
git remote remove amvera 2>/dev/null || true
git remote add amvera "https://git.amvera.ru/${AMVERA_USER}/kolos-api"
echo "Push на Amvera..."
git push amvera main:master 2>/dev/null || git push amvera main:main 2>/dev/null || git push amvera HEAD:master

echo ""
echo "Готово. В панели Amvera задайте переменные:"
echo "  DATABASE_URL, SECRET_KEY, CORS_ORIGINS, FRONTEND_URL"
