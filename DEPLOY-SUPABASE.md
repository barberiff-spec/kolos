# KOLOS — Vercel backend + Supabase

Самый простой путь без Railway/Render/Amvera:

```text
Frontend Vercel -> Backend Vercel (FastAPI) -> Supabase Postgres
```

## Сейчас

Backend можно запустить на Vercel с временной SQLite:

```env
DATABASE_URL=sqlite:////tmp/kolos.db
```

Это подходит для демо: данные могут сбрасываться при пересоздании serverless-инстанса.

## Постоянная база на Supabase

1. Откройте https://supabase.com
2. New project
3. Project Settings -> Database -> Connection string -> URI
4. Возьмите строку вида:

```env
postgresql://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
```

5. На Vercel в backend-проекте замените:

```env
DATABASE_URL=postgresql+psycopg2://postgres.xxxxx:PASSWORD@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Код уже умеет нормализовать `postgresql://` и `postgres://`, но `sslmode=require` для Supabase лучше оставить.

## Backend env

```env
APP_NAME=KOLOS
APP_VERSION=2.0.0
DEBUG=true
API_V1_PREFIX=/api/v1
DATABASE_URL=sqlite:////tmp/kolos.db
SECRET_KEY=replace-with-long-random-secret
CORS_ORIGINS=https://frontend-blond-one-25.vercel.app
FRONTEND_URL=https://frontend-blond-one-25.vercel.app
COOKIE_SECURE=true
COOKIE_SAMESITE=none
```

## Frontend env

```env
NEXT_PUBLIC_API_URL=https://YOUR-BACKEND.vercel.app/api/v1
```

