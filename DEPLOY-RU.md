# KOLOS — деплой в России (простые варианты)

Зарубежные Render/Railway/Fly.io часто требуют VPN, карту иностранного банка и OAuth-коды.  
**Для России проще три пути ниже.**

| Вариант | Сложность | Цена | Что нужно |
|---------|-----------|------|-----------|
| **A. Timeweb VPS** | ★☆☆ | ~300–500 ₽/мес | Карта РФ, 30 мин |
| **B. Amvera** | ★★☆ | от ~0 ₽ trial | Аккаунт amvera.ru |
| **C. Vercel + Amvera** | ★☆☆ | Vercel free + Amvera | Уже есть Vercel |

**Оплата курсов:** ЮKassa уже в проекте — идеально для РФ.

---

## Вариант A — Timeweb (рекомендуем: всё на одном сервере)

Один VPS = сайт + API + база. Без Render, без Railway, без туннелей.

### 1. Аренда сервера

1. [timeweb.cloud](https://timeweb.cloud) → регистрация
2. **Облачный сервер** → Ubuntu 22.04, 2 GB RAM, Москва
3. Запишите **IP** и root-пароль

### 2. Домен (опционально, но лучше для продаж)

На Timeweb или [reg.ru](https://reg.ru) купите `kolos-academy.ru`  
DNS: A-запись `@` и `api` → IP сервера

### 3. Установка на сервере (один раз)

Подключитесь по SSH (IP подставьте свой):

```bash
ssh root@ВАШ_IP
```

На сервере:

```bash
curl -fsSL https://get.docker.com | sh
git clone https://github.com/barberiff-spec/kolos.git /opt/kolos
cd /opt/kolos

cp .env.production.example .env.production
cp backend/.env.production.example backend/.env.production
```

Отредактируйте `.env.production`:

```env
POSTGRES_PASSWORD=ваш-сложный-пароль
NEXT_PUBLIC_API_URL=https://api.kolos-academy.ru/api/v1
```

Отредактируйте `backend/.env.production`:

```env
SECRET_KEY=случайная-строка-32-символа
DATABASE_URL=postgresql+psycopg2://kolos:ваш-сложный-пароль@db:5432/kolos_lms
CORS_ORIGINS=https://kolos-academy.ru
FRONTEND_URL=https://kolos-academy.ru
DEBUG=false
COOKIE_SECURE=true

# ЮKassa — когда подключите
YOOKASSA_SHOP_ID=
YOOKASSA_SECRET_KEY=
```

Запуск:

```bash
chmod +x scripts/start.sh
./scripts/start.sh prod
```

Сайт: `http://ВАШ_IP:3001`  
API: `http://ВАШ_IP:8001/docs`

### 4. HTTPS (Caddy, 2 минуты)

```bash
apt install -y caddy
nano /etc/caddy/Caddyfile
```

```
kolos-academy.ru {
    reverse_proxy localhost:3001
}
api.kolos-academy.ru {
    reverse_proxy localhost:8001
}
```

```bash
systemctl reload caddy
```

Готово — полноценный сайт в РФ без иностранных сервисов.

---

## Вариант B — Amvera (без VPS, через git push)

Российский PaaS: [amvera.ru](https://amvera.ru) — как Heroku, оплата в рублях.

### Шаг 1. PostgreSQL на Amvera

1. Личный кабинет → **Создать** → **PostgreSQL**
2. Дождитесь статуса «PostgreSQL запущен»
3. На вкладке **Инфо** скопируйте: хост, пользователь, пароль, имя БД

### Шаг 2. Backend на Amvera

1. **Создать** → **Приложение** → имя `kolos-api`
2. Привязать GitHub `barberiff-spec/kolos` **или** push через git Amvera:

```bash
cd ~/Projects/kolos
git remote add amvera https://git.amvera.ru/ВАШ-ЛОГИН/kolos-api
git subtree push --prefix backend amvera main
```

3. В проекте укажите **Dockerfile** = `backend/Dockerfile.prod`
4. Переменные окружения:

```
SECRET_KEY=случайная-строка
DATABASE_URL=postgresql+psycopg2://USER:PASS@HOST:5432/kolos_lms
DEBUG=false
CORS_ORIGINS=https://frontend-blond-one-25.vercel.app
FRONTEND_URL=https://frontend-blond-one-25.vercel.app
```

5. Получите URL вида `https://kolos-api-xxx.amvera.io`

### Шаг 3. Обновить frontend (Vercel)

```bash
cd ~/Projects/kolos/frontend
printf 'https://kolos-api-xxx.amvera.io/api/v1\n' | ../node_modules/.bin/vercel env add NEXT_PUBLIC_API_URL production
../node_modules/.bin/vercel --prod --yes
```

На Amvera обновите `CORS_ORIGINS` на ваш vercel.app URL.

---

## Вариант C — оставить Vercel, только API в России

**Уже работает:** https://frontend-blond-one-25.vercel.app  

Нужно только вынести backend с Mac на Amvera или Timeweb (шаги B или A без frontend-сервиса).

На Timeweb можно поднять **только backend + db**:

```yaml
# docker-compose.backend-only.yml — только db + backend
```

Или на Amvera — только проект `kolos-api` + PostgreSQL.

---

## Сравнение с тем, что пробовали

| Сервис | Проблема |
|--------|----------|
| Railway | OAuth-коды, таймауты |
| Render | Нужен GitHub + иногда карта |
| Fly.io | Карта для PostgreSQL |
| localtunnel | Работает только пока Mac включён |
| **Timeweb / Amvera** | Рубли, поддержка на русском, без VPN |

---

## ЮKassa (когда будете продавать)

1. [yookassa.ru](https://yookassa.ru) → регистрация ИП/ООО или самозанятость
2. В `backend/.env.production`:

```
YOOKASSA_SHOP_ID=...
YOOKASSA_SECRET_KEY=...
FRONTEND_URL=https://ваш-домен.ru
```

3. Webhook: `https://api.ваш-домен.ru/api/v1/payments/webhook/yookassa`

---

## Что выбрать

- **Хотите «нажал и работает»** → Timeweb VPS + `./scripts/start.sh prod`
- **Не хотите админить сервер** → Amvera (backend) + Vercel (frontend, уже есть)
- **Максимум контроля и .ru домен** → Timeweb + Caddy + ЮKassa

Код уже на GitHub: https://github.com/barberiff-spec/kolos
