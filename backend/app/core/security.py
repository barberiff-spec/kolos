from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import uuid4

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
settings = get_settings()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def _create_token(
    subject: str,
    expires_delta: timedelta,
    token_type: str,
    extra: dict[str, Any] | None = None,
) -> str:
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_access_token(subject: str, role: str) -> str:
    return _create_token(
        subject=subject,
        expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        token_type="access",
        extra={"role": role},
    )


def create_refresh_token(subject: str) -> tuple[str, str]:
    jti = str(uuid4())
    token = _create_token(
        subject=subject,
        expires_delta=timedelta(days=settings.refresh_token_expire_days),
        token_type="refresh",
        extra={"jti": jti},
    )
    return token, jti


def create_telegram_link_token(user_id: str) -> str:
    """Одноразовый короткоживущий токен для deep-link связки Telegram (/start=<token>).

    Подписан обычным secret_key (это обычный пользовательский flow — токен
    выдаётся залогиненному на сайте пользователю), но с type="telegram_link",
    поэтому не пройдёт как access/refresh токен и не даёт доступа ни к чему,
    кроме самой привязки.
    """
    return _create_token(
        subject=user_id,
        expires_delta=timedelta(minutes=10),
        token_type="telegram_link",
    )


def create_service_token(subject: str = "kolos-bot") -> str:
    """Токен для service-to-service вызовов (например, Kolos Bot).

    Подписан отдельным секретом (service_jwt_secret), а не secret_key
    пользовательских токенов, и не проходит verify_token() для типов
    access/refresh — это исключает случайное принятие сервисного токена
    обычными user-эндпоинтами и наоборот.
    """
    now = datetime.now(timezone.utc)
    payload: dict[str, Any] = {
        "sub": subject,
        "type": "service",
        "iat": now,
        "exp": now + timedelta(days=settings.service_token_expire_days),
    }
    return jwt.encode(payload, settings.service_jwt_secret, algorithm=settings.algorithm)


def verify_service_token(token: str) -> dict[str, Any] | None:
    try:
        payload = jwt.decode(token, settings.service_jwt_secret, algorithms=[settings.algorithm])
        if payload.get("type") != "service":
            return None
        return payload
    except JWTError:
        return None


def decode_token(token: str) -> dict[str, Any]:
    return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])


def verify_token(token: str, expected_type: str) -> dict[str, Any] | None:
    try:
        payload = decode_token(token)
        if payload.get("type") != expected_type:
            return None
        return payload
    except JWTError:
        return None
