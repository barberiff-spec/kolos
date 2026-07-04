from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Course, PromoCode, User
from app.schemas.extras import (
    PromoCodeCreate,
    PromoCodeRead,
    PromoCodeUpdate,
    PromoValidateRequest,
    PromoValidateResponse,
)
from app.services.promo_service import validate_promo

router = APIRouter(prefix="/promos", tags=["Promo Codes"])


@router.post("/validate", response_model=PromoValidateResponse)
def validate_promo_code(payload: PromoValidateRequest, db: Session = Depends(get_db)):
    course = db.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    promo, final_price = validate_promo(db, payload.code, course.price)
    discount = round(course.price - final_price, 2)
    return PromoValidateResponse(
        code=promo.code,
        original_price=course.price,
        discount=discount,
        final_price=final_price,
    )


@router.get("", response_model=list[PromoCodeRead])
def list_promos(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(PromoCode).order_by(PromoCode.created_at.desc()).all()


@router.post("", response_model=PromoCodeRead, status_code=status.HTTP_201_CREATED)
def create_promo(payload: PromoCodeCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    if db.query(PromoCode).filter(PromoCode.code == payload.code.upper()).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Code already exists")
    promo = PromoCode(
        code=payload.code.upper(),
        discount_percent=payload.discount_percent,
        discount_amount=payload.discount_amount,
        max_uses=payload.max_uses,
        is_active=payload.is_active,
    )
    db.add(promo)
    db.commit()
    db.refresh(promo)
    return promo


@router.patch("/{promo_id}", response_model=PromoCodeRead)
def update_promo(
    promo_id: int,
    payload: PromoCodeUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    promo = db.get(PromoCode, promo_id)
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promo not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(promo, key, value)
    db.commit()
    db.refresh(promo)
    return promo


@router.delete("/{promo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_promo(promo_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    promo = db.get(PromoCode, promo_id)
    if not promo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Promo not found")
    db.delete(promo)
    db.commit()
