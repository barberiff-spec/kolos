# KOLOS в интернете — с нуля, бесплатно

У вас нет сервера и домена — это нормально. Нужны только **email (Gmail)** и **30–60 минут**.

Получите две ссылки:
- `https://kolos-xxx.vercel.app` — сайт
- `https://kolos-api-xxx.railway.app` — API

---

## Что понадобится

| Нужно | Зачем |
|-------|-------|
| Gmail | Регистрация на Railway и Vercel |
| Docker на Mac | Уже установлен |
| Node.js | Уже установлен |

Деньги: **0 ₽** на старте. Бесплатные тарифы могут «засыпать» — для демо и первых клиентов хватит.

---

## Быстрый деплой (скрипты в проекте)

CLI уже установлены локально в проект (`npm install` в корне kolos).

### Шаг 0. Войти в аккаунты (один раз)

В терминале Cursor:

```bash
cd ~/Projects/kolos
./node_modules/.bin/railway login
./node_modules/.bin/vercel login
```

Откроется браузер — войдите через GitHub или Google.

### Шаг 1. Backend

```bash
./scripts/deploy-backend.sh
```

В [railway.app](https://railway.app) → проект **kolos-api** → сервис backend → **Settings → Networking → Generate Domain**.

Скопируйте URL, например: `https://kolos-api-production-xxxx.up.railway.app`

### Шаг 2. Frontend

```bash
NEXT_PUBLIC_API_URL=https://ВАШ-URL.up.railway.app/api/v1 ./scripts/deploy-frontend.sh
```

### Шаг 3. CORS

Подставьте ваш vercel.app URL:

```bash
cd backend
../node_modules/.bin/railway variables set \
  CORS_ORIGINS=https://kolos-xxx.vercel.app \
  FRONTEND_URL=https://kolos-xxx.vercel.app
```

---

## Подробный деплoy вручную

### 1. Регистрация
1. Откройте [railway.app](https://railway.app)
2. **Login with GitHub** или Google (если нет GitHub — создайте на [github.com](https://github.com), это 2 минуты)

### 2. Установите CLI
```bash
brew install railway
railway login
```

### 3. Запустите backend
```bash
cd ~/Projects/kolos/backend
railway init
# Назовите проект: kolos

railway add --database postgres
# Railway создаст PostgreSQL и переменную DATABASE_URL
```

### 4. Переменные окружения
В [railway.app](https://railway.app) → ваш проект → backend-сервис → **Variables**:

```
SECRET_KEY=любая-длинная-случайная-строка-минимум-32-символа
DEBUG=true
CORS_ORIGINS=https://placeholder.vercel.app
FRONTEND_URL=https://placeholder.vercel.app
```

(`placeholder` замените после деплоя frontend — см. часть 2)

### 5. Деплой
```bash
cd ~/Projects/kolos/backend
railway up
```

Railway даст URL вида: `https://kolos-production-xxxx.up.railway.app`

Проверка: откройте `https://ВАШ-URL/docs` — должна открыться Swagger-документация.

**Сохраните URL backend** — он нужен для frontend.

---

## Часть 2. Frontend (Vercel)

### 1. Регистрация
[vercel.com](https://vercel.com) → Sign Up (через GitHub удобнее всего)

### 2. Установите CLI
```bash
npm i -g vercel
```

### 3. Деплой
```bash
cd ~/Projects/kolos/frontend
vercel
```

На вопросы отвечайте:
- Set up and deploy? **Y**
- Which scope? — ваш аккаунт
- Link to existing project? **N**
- Project name? **kolos**
- Directory? **./** (Enter)

### 4. URL API
```bash
vercel env add NEXT_PUBLIC_API_URL
# Вставьте: https://ВАШ-RAILWAY-URL/api/v1
# Environments: Production, Preview, Development — все три
```

Пересоберите:
```bash
vercel --prod
```

Vercel даст URL: `https://kolos-xxx.vercel.app`

### 5. Обновите CORS на Railway
В Railway → Variables, замените:
```
CORS_ORIGINS=https://kolos-xxx.vercel.app
FRONTEND_URL=https://kolos-xxx.vercel.app
```
Перезапустите backend (Redeploy в Railway).

---

## Проверка

1. Откройте `https://kolos-xxx.vercel.app` — лендинг KOLOS
2. Курсы → страница курса → регистрация → тестовая оплата
3. Админка: `admin@kolos.bar` / `admin123` — **смените пароль после первого входа**

---

## Если что-то не работает

| Проблема | Решение |
|----------|---------|
| «Курсы не загружаются» | Проверьте `NEXT_PUBLIC_API_URL` на Vercel и CORS на Railway |
| 502 на Railway | Подождите 1–2 мин после деплоя, проверьте логи в Railway |
| Ошибка при `railway up` | Убедитесь, что вы в папке `backend/` |
| Нет `brew` | Установите Homebrew: [brew.sh](https://brew.sh) |

---

## Когда пойдут продажи — что купить

| Что | Цена | Зачем |
|-----|------|-------|
| Домен `.ru` | ~200–500 ₽/год | `kolos-academy.ru` вместо vercel.app |
| VPS или платный Railway | ~300–700 ₽/мес | Сайт не засыпает, быстрее |
| ЮKassa | бесплатно подключение | Реальные платежи |

Подробнее: [LAUNCH.md](./LAUNCH.md)

---

## Альтернатива: только посмотреть у себя

Без регистраций нигде — только на вашем Mac:

```bash
cd ~/Projects/kolos
docker compose up -d
cd frontend && npm run dev
```

→ http://localhost:3001 (это **не** интернет, только ваш компьютер)
