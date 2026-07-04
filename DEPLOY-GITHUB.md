# Деплой KOLOS через GitHub (рекомендуется)

Git работает — это самый надёжный путь. **Railway CLI не нужен**: всё через сайты Railway и Vercel.

---

## Шаг 1. GitHub-репозиторий

В терминале:

```bash
cd ~/Projects/kolos
git init
git add .
git commit -m "KOLOS: initial release"
```

На [github.com/new](https://github.com/new):
- Имя: `kolos`
- **Private** или Public — на ваш выбор
- **Не** добавляйте README (репозиторий уже с кодом)

Привязка и push (подставьте свой логин вместо `ВАШ-ЛОГИН`):

```bash
git remote add origin https://github.com/ВАШ-ЛОГИН/kolos.git
git branch -M main
git push -u origin main
```

> Vercel у вас уже привязан к аккаунту **barberiff-spec** — возможно, это ваш GitHub-логин.

---

## Шаг 2. Backend на Railway (через сайт)

1. Откройте [railway.app](https://railway.app) → **Login with GitHub**
2. **New Project** → **Deploy from GitHub repo** → выберите `kolos`
3. Railway создаст сервис — откройте его → **Settings**:
   - **Root Directory**: `backend`
   - **Start Command** (если спросит):  
     `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. **+ New** → **Database** → **PostgreSQL** (в том же проекте)
5. В сервисе **backend** → **Variables** → **Add Reference** → подключите `DATABASE_URL` из PostgreSQL
6. Добавьте переменные:

   ```
   SECRET_KEY=случайная-строка-32-символа
   DEBUG=true
   CORS_ORIGINS=https://placeholder.vercel.app
   FRONTEND_URL=https://placeholder.vercel.app
   ```

7. **Settings** → **Networking** → **Generate Domain**
8. Скопируйте URL, например: `https://kolos-production-xxxx.up.railway.app`
9. Проверка: откройте `https://ВАШ-URL/health` — должно быть `{"status":"ok",...}`

---

## Шаг 3. Frontend на Vercel (через сайт)

1. [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → `kolos`
2. **Root Directory**: `frontend` (Edit → указать папку)
3. **Environment Variables**:

   | Name | Value |
   |------|-------|
   | `NEXT_PUBLIC_API_URL` | `https://ВАШ-RAILWAY-URL/api/v1` |

4. **Deploy**

После деплоя получите URL: `https://kolos-xxx.vercel.app`

---

## Шаг 4. Обновить CORS на Railway

Railway → backend → **Variables**:

```
CORS_ORIGINS=https://kolos-xxx.vercel.app
FRONTEND_URL=https://kolos-xxx.vercel.app
```

Redeploy backend (или подождите автоперезапуск).

---

## Шаг 5. Проверка

1. `https://kolos-xxx.vercel.app` — лендинг и курсы
2. Регистрация → покупка курса
3. Admin: `admin@kolos.bar` / `admin123` — **смените пароль**

---

## Альтернатива: Vercel CLI (уже залогинены)

Если backend на Railway уже есть:

```bash
cd ~/Projects/kolos/frontend
NEXT_PUBLIC_API_URL=https://ВАШ-RAILWAY-URL/api/v1 \
  ../node_modules/.bin/vercel --prod --yes \
  --env "NEXT_PUBLIC_API_URL=https://ВАШ-RAILWAY-URL/api/v1"
```

---

## Обновления после изменений кода

```bash
git add .
git commit -m "описание изменений"
git push
```

Railway и Vercel пересоберут проект автоматически.
