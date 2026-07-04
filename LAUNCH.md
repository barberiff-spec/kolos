# Запуск KOLOS в production

## Как начать зарабатывать (пошагово)

### Шаг 1. Деплой за 1 день
1. Арендуйте VPS (Timeweb, Selectel, Hetzner) или используйте Vercel + VPS
2. Привяжите домен: `kolos.bar` → frontend, `api.kolos.bar` → backend
3. Заполните env-файлы и запустите: `./scripts/start.sh prod`
4. Смените пароль admin, выключите `DEBUG=false`

### Шаг 2. Подключите ЮKassa
1. Зарегистрируйтесь на [yookassa.ru](https://yookassa.ru)
2. Получите `YOOKASSA_SHOP_ID` и `YOOKASSA_SECRET_KEY`
3. Webhook: `https://api.your-domain.com/api/v1/payments/webhook/yookassa`
4. Пройдите тестовый платёж по каждому способу (карта, СБП)

### Шаг 3. Контент = деньги
1. Загрузите **реальные видеоуроки** через `/admin/courses/[id]`
2. Минимум один курс должен быть «флагманом» — полный, с ценностью
3. Используйте промокод `KOLOS10` в рекламе для первых клиентов

### Шаг 4. Трафик
| Канал | Действие |
|-------|----------|
| Instagram / VK | Reels со стрижкой + ссылка на курс |
| Барбер-чаты | Промокод KOLOS10 для первых 100 |
| Яндекс.Метрика | `NEXT_PUBLIC_YM_ID` — смотрите цель `purchase` |
| SEO | Публикуйте статьи «как сделать фейд» → ссылка на курс |

### Шаг 5. Доверие (уже встроено)
- Проверка сертификата: `/certificates/verify` — давайте ссылку работодателям
- Отзывы и FAQ на лендинге
- Блок «Безопасная оплата через ЮKassa» на странице курса

### Воронка продаж
```
Реклама → Лендинг → Каталог → Страница курса → Регистрация → Оплата → Обучение → Сертификат
```

Промокод вводится на странице курса. После регистрации пользователь возвращается на курс автоматически.

---

## Чеклист перед запуском

1. Скопируйте env-файлы и задайте секреты:
   ```bash
   cp .env.production.example .env.production
   cp backend/.env.production.example backend/.env.production
   cp frontend/.env.production.example frontend/.env.production
   ```
2. В `backend/.env.production`:
   - `SECRET_KEY` — длинная случайная строка (32+ символов)
   - `POSTGRES_PASSWORD` — совпадает с паролем в `DATABASE_URL`
   - `CORS_ORIGINS` и `FRONTEND_URL` — ваш домен
   - `COOKIE_SECURE=true` для HTTPS
3. В `.env.production`:
   - `NEXT_PUBLIC_API_URL` — публичный URL API (например `https://api.kolos.bar/api/v1`)
4. ЮKassa (опционально):
   - `YOOKASSA_SHOP_ID`, `YOOKASSA_SECRET_KEY`
   - Webhook: `POST https://api.your-domain.com/api/v1/payments/webhook/yookassa`
   - Return URL настраивается автоматически → `/payment/success`

## Docker (рекомендуется)

```bash
chmod +x scripts/start.sh
./scripts/start.sh prod
```

Сервисы:
| Сервис | Порт по умолчанию |
|--------|-------------------|
| Frontend | 3001 |
| Backend API | 8001 |
| PostgreSQL | только внутри сети Docker |

## Способы оплаты

При включённой ЮKassa доступны:
- Банковская карта (Visa, Mastercard, МИР)
- СБП
- SberPay
- ЮMoney

В режиме разработки (`DEBUG=true`) дополнительно доступна тестовая оплата.

## Демо-аккаунты (после seed)

| Роль | Email | Пароль |
|------|-------|--------|
| Admin | admin@kolos.bar | admin123 |
| Student | student@kolos.bar | student123 |

**Смените пароли admin перед публичным запуском.**

## Альтернатива: Vercel + VPS

- **Frontend** → Vercel (`frontend/`), переменная `NEXT_PUBLIC_API_URL`
- **Backend** → VPS с Docker (`backend/` + PostgreSQL)
- Nginx/Caddy: прокси `/api` → backend:8000

## Проверка после деплоя

1. Открыть лендинг — премиальный фон, отзывы и FAQ на русском
2. Войти как student → курс → выбрать способ оплаты → купить
3. Пройти урок → сертификат в `/certificates`
4. Админка `/admin` — редактирование курсов

## Обновление контента seed

При перезапуске backend seed автоматически обновляет тексты отзывов, FAQ и курсов на русский язык.
