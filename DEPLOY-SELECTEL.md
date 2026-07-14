# Деплой на Selectel VPS (текущий прод)

Прод KOLOS развёрнут на одном VPS **Selectel**: frontend + backend + PostgreSQL в Docker,
HTTPS через Caddy с автоматическими сертификатами Let's Encrypt.

## Сервер

| | |
|---|---|
| Провайдер | Selectel (российский регион) |
| ОС | Ubuntu 24.04 LTS |
| Ресурсы | 4 ГБ RAM, ~50 ГБ диск |
| Каталог проекта | `/opt/kolos` |
| Доступ | SSH по ключу (`~/.ssh/kolos_vps_key`), алиас `kolos-vps` в `~/.ssh/config` |

## Домены

| Домен | Назначение |
|-------|-----------|
| `kolos-academy.ru`, `www.kolos-academy.ru` | frontend (Next.js) |
| `api.kolos-academy.ru` | backend (FastAPI) |

DNS ведётся в Cloudflare, но A-записи указывают **напрямую на IP сервера, без проксирования**
(`proxied=false`) — чтобы трафик не шёл через зарубежную инфраструктуру и не попадал под DPI.

## Стек на сервере

- **Docker** + `docker compose` (`docker-compose.prod.yml`)
- 3 контейнера: `kolos-frontend`, `kolos-backend`, `kolos-postgres` (PostgreSQL 16, реальная БД вместо SQLite)
- Все с `restart: unless-stopped` — переживают перезагрузку сервера
- **Caddy** (systemd-сервис) — реверс-прокси + автоматический HTTPS
- **ufw** — открыты только порты 22 / 80 / 443

## Переменные окружения

На сервере (в git не коммитятся):

- `/opt/kolos/.env.production` — корневой (POSTGRES_*, порты, `NEXT_PUBLIC_API_URL`)
- `/opt/kolos/backend/.env.production` — backend (SECRET_KEY, DATABASE_URL, CORS, cookie, SMTP, ЮKassa)

Шаблоны — `.env.production.example` и `backend/.env.production.example`.
`SECRET_KEY` и `POSTGRES_PASSWORD` сгенерированы случайно (`secrets.token_urlsafe`).

Ключевые значения прод-конфига:

```env
NEXT_PUBLIC_API_URL=https://api.kolos-academy.ru/api/v1
CORS_ORIGINS=https://kolos-academy.ru,https://www.kolos-academy.ru
FRONTEND_URL=https://kolos-academy.ru
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

## Caddyfile (`/etc/caddy/Caddyfile`)

```
kolos-academy.ru, www.kolos-academy.ru {
    reverse_proxy localhost:3001
}

api.kolos-academy.ru {
    reverse_proxy localhost:8001
}
```

## Первичный деплой (как разворачивалось)

```bash
# 1. Docker
ssh kolos-vps "curl -fsSL https://get.docker.com | sh"

# 2. Код в /opt/kolos (без node_modules/.git/.env)
rsync -az --exclude node_modules --exclude .git --exclude .next \
  --exclude '*.db' --exclude '.env*' ./ kolos-vps:/opt/kolos/

# 3. env-файлы (см. выше), затем сборка и запуск
ssh kolos-vps "cd /opt/kolos && \
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build"

# 4. Caddy + ufw, DNS в Cloudflare напрямую на IP (proxied=false)
```

## Обновление (redeploy)

```bash
# синхронизировать код и пересобрать
rsync -az --exclude node_modules --exclude .git --exclude .next \
  --exclude '*.db' --exclude '.env*' ./ kolos-vps:/opt/kolos/
ssh kolos-vps "cd /opt/kolos && \
  docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build"
```

## Проверка

```bash
ssh kolos-vps "docker ps"                                   # все 3 контейнера Up
curl -s https://api.kolos-academy.ru/health                 # {"status":"ok",...}
curl -s -o /dev/null -w '%{http_code}\n' https://kolos-academy.ru/   # 200
ssh kolos-vps "journalctl -u caddy -n 40 --no-pager"        # статус сертификатов
```

## Админка

`https://kolos-academy.ru/admin` → `admin@kolos.bar` / `admin123` (смените пароль после запуска).

## Заметки

- Старые площадки (Vercel-frontend, Amvera-backend) больше не используются, но не удалены.
- Реальных пользователей/платежей на старом бэкенде не было — переносить нечего.
