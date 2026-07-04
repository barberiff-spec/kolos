from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models import PromoCode


def validate_promo(db: Session, code: str, course_price: float) -> tuple[PromoCode, float]:
    promo = db.query(PromoCode).filter(PromoCode.code == code.upper().strip()).first()
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Промокод не найден")
    if not promo.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Промокод неактивен")
    if promo.expires_at and promo.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Промокод истёк")
    if promo.max_uses is not None and promo.used_count >= promo.max_uses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Промокод исчерпан")

    discount = 0.0
    if promo.discount_percent > 0:
        discount = round(course_price * promo.discount_percent / 100, 2)
    elif promo.discount_amount > 0:
        discount = min(promo.discount_amount, course_price)

    final_price = max(round(course_price - discount, 2), 0.0)
    return promo, final_price


def apply_promo(db: Session, promo: PromoCode) -> None:
    promo.used_count += 1
    db.commit()
