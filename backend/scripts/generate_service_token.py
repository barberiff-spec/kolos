"""Генерирует сервисный JWT для Kolos Bot.

Запуск из backend/:  python -m scripts.generate_service_token

Токен подписан отдельным секретом SERVICE_JWT_SECRET (см. .env),
живёт SERVICE_TOKEN_EXPIRE_DAYS дней (по умолчанию 365).
Значение вставить в .env бота как KOLOS_SERVICE_TOKEN.
"""

from app.core.security import create_service_token

if __name__ == "__main__":
    print(create_service_token())
