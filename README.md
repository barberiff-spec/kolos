# KOLOS — Barber Academy v2.0

Премиальная LMS-платформа для обучения барберов с полным набором функций для продакшена.

## Возможности v2.0

| Модуль | Описание |
|--------|----------|
| **Курсы** | Модули, уроки, YouTube/VK Video, CRUD в админке |
| **Оплата** | Карта, СБП, SberPay, ЮMoney (ЮKassa) + тестовая оплата в dev |
| **Промокоды** | Процент или фиксированная скидка, лимит использований |
| **Прогресс** | Отслеживание уроков, автоматический пересчёт % |
| **Сертификаты** | Автовыдача при 100%, уникальный код, email |
| **Комментарии** | Q&A под каждым уроком |
| **Email** | Welcome, покупка, сертификат (SMTP или mock в консоль) |
| **Контент** | Отзывы и FAQ на лендинге |
| **Админка** | Курсы, уроки, промокоды, пользователи |

## Быстрый старт

```bash
cd kolos
docker compose up -d --build

cd frontend && npm install && cp .env.example .env.local && npm run dev
```

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:3001 |
| Backend | http://localhost:8001 |
| Swagger | http://localhost:8001/docs |

## Демо-аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@kolos.bar | admin123 |
| Student | student@kolos.bar | student123 |

## Промокоды (seed)

- `KOLOS10` — скидка 10%
- `BARBER500` — скидка 500 ₽
- `MASTER20` — скидка 20%

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Лендинг + отзывы + FAQ |
| `/courses` | Каталог |
| `/course/[id]` | Курс + промокод + оплата |
| `/learn/[courseId]` | Плеер + комментарии |
| `/cabinet` | Личный кабинет |
| `/certificates` | Сертификаты |
| `/admin` | Админ-панель |
| `/admin/courses/[id]` | Редактор модулей/уроков |
| `/payment/success` | Успешная оплата (ЮKassa return) |

## API (новое)

```
POST /api/v1/payments/checkout          — оплата (карта, СБП, SberPay, ЮMoney, mock)
GET  /api/v1/payments/methods           — доступные способы оплаты
POST /api/v1/payments/webhook/yookassa  — webhook ЮKassa
POST /api/v1/promos/validate            — проверка промокода
GET  /api/v1/certificates/me            — мои сертификаты
GET  /api/v1/certificates/verify/{code} — проверка сертификата
GET  /api/v1/comments/lesson/{id}       — комментарии урока
POST /api/v1/comments/lesson/{id}       — добавить комментарий
GET  /api/v1/content/reviews            — отзывы
GET  /api/v1/content/faq                — FAQ
```

## ЮKassa

```env
YOOKASSA_SHOP_ID=your_shop_id
YOOKASSA_SECRET_KEY=your_secret_key
FRONTEND_URL=https://your-domain.com
```

Webhook URL: `https://your-api.com/api/v1/payments/webhook/yookassa`

Без ключей работает mock-оплата (мгновенный доступ).

## Production

См. [LAUNCH.md](./LAUNCH.md) — Docker prod, env-файлы, чеклист запуска.

```bash
./scripts/start.sh prod
```

## Email (SMTP)

```env
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASSWORD=your_password
SMTP_FROM=KOLOS <noreply@kolos.bar>
```

Без SMTP письма логируются в консоль backend.

## Миграции

```bash
cd backend
alembic upgrade head
```

При обновлении с v1: `docker compose down -v && docker compose up -d` (сброс БД + seed).

## Структура

```
kolos/
├── backend/app/
│   ├── api/v1/endpoints/   # auth, courses, payments, certificates, comments, promos, content
│   ├── services/           # email, yookassa, certificate, promo
│   └── models/             # + Certificate, Comment, PromoCode, Review, FAQ
└── frontend/src/
    ├── app/admin/courses/[id]/  # редактор уроков
    ├── app/certificates/
    ├── components/landing/      # FAQ, Reviews
    └── components/lesson/       # VideoPlayer, Comments
```

MIT
