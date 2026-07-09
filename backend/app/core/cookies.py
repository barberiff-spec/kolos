from datetime import datetime, timedelta, timezone

from fastapi import Response

from app.core.config import get_settings
from app.core.deps import ACCESS_COOKIE, REFRESH_COOKIE

settings = get_settings()


def _cookie_kwargs() -> dict:
    kwargs = {
        "httponly": True,
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
        "path": "/",
    }
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    return kwargs


def set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    access_max_age = settings.access_token_expire_minutes * 60
    refresh_max_age = settings.refresh_token_expire_days * 24 * 60 * 60
    kwargs = _cookie_kwargs()
    response.set_cookie(ACCESS_COOKIE, access_token, max_age=access_max_age, **kwargs)
    response.set_cookie(REFRESH_COOKIE, refresh_token, max_age=refresh_max_age, **kwargs)


def clear_auth_cookies(response: Response) -> None:
    kwargs = {
        "path": "/",
        "secure": settings.cookie_secure,
        "samesite": settings.cookie_samesite,
    }
    if settings.cookie_domain:
        kwargs["domain"] = settings.cookie_domain
    response.delete_cookie(ACCESS_COOKIE, **kwargs)
    response.delete_cookie(REFRESH_COOKIE, **kwargs)


def refresh_token_expiry() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
