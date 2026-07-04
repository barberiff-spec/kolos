from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Course, Enrollment, Payment, PaymentStatus, User
from app.schemas.enrollment import PaymentCreate, PaymentRead
from app.services.email_service import send_purchase_email
from app.services.payment_methods import list_payment_methods
from app.services.promo_service import apply_promo, validate_promo
from app.services.yookassa_service import create_yookassa_payment, handle_yookassa_webhook

router = APIRouter(prefix="/payments", tags=["Payments"])
settings = get_settings()


@router.get("/methods")
def get_payment_methods():
    """Доступные способы оплаты."""
    return list_payment_methods(include_mock=settings.debug or not settings.yookassa_enabled)


def _create_enrollment(db: Session, user_id: int, course_id: int) -> Enrollment:
    existing = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if existing:
        return existing
    enrollment = Enrollment(user_id=user_id, course_id=course_id, progress_percent=0.0)
    db.add(enrollment)
    db.flush()
    return enrollment


def _complete_payment(db: Session, payment: Payment, user: User, course: Course) -> Payment:
    payment.status = PaymentStatus.COMPLETED
    _create_enrollment(db, user.id, course.id)
    if payment.promo_code:
        from app.models import PromoCode

        promo = db.query(PromoCode).filter(PromoCode.code == payment.promo_code).first()
        if promo:
            apply_promo(db, promo)
    db.commit()
    db.refresh(payment)
    send_purchase_email(user.email, user.full_name, course.title, payment.amount)
    return payment


@router.post("/checkout", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def checkout(payload: PaymentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    course = db.get(Course, payload.course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if not course.is_published:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Course is not available")
    if (
        db.query(Enrollment)
        .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id)
        .first()
    ):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Already enrolled")

    final_price = course.price
    discount = 0.0
    promo_code_str = None
    if payload.promo_code:
        _, final_price = validate_promo(db, payload.promo_code, course.price)
        discount = round(course.price - final_price, 2)
        promo_code_str = payload.promo_code.upper().strip()

    if settings.yookassa_enabled and payload.payment_method not in ("mock",):
        payment = create_yookassa_payment(
            db, current_user, course, final_price, payload.payment_method, promo_code_str
        )
        payment.discount_amount = discount
        payment.promo_code = promo_code_str
        db.commit()
        db.refresh(payment)
        return payment

    payment = Payment(
        user_id=current_user.id,
        course_id=course.id,
        amount=final_price,
        discount_amount=discount,
        promo_code=promo_code_str,
        status=PaymentStatus.COMPLETED,
        payment_method=payload.payment_method if payload.payment_method != "auto" else "mock",
        external_id=f"mock_{uuid4().hex[:12]}",
    )
    db.add(payment)
    _complete_payment(db, payment, current_user, course)
    return payment


@router.post("/mock-checkout", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def mock_checkout(payload: PaymentCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    payload.payment_method = "mock"
    return checkout(payload, current_user, db)


@router.post("/webhook/yookassa")
async def yookassa_webhook(request: Request, db: Session = Depends(get_db)):
    event = await request.json()
    payment = handle_yookassa_webhook(db, event)
    if payment and payment.status == PaymentStatus.COMPLETED:
        user = db.get(User, payment.user_id)
        course = db.get(Course, payment.course_id)
        if user and course:
            _create_enrollment(db, user.id, course.id)
            if payment.promo_code:
                from app.models import PromoCode

                promo = db.query(PromoCode).filter(PromoCode.code == payment.promo_code).first()
                if promo:
                    apply_promo(db, promo)
            send_purchase_email(user.email, user.full_name, course.title, payment.amount)
    return {"status": "ok"}


@router.get("/me", response_model=list[PaymentRead])
def my_payments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(Payment)
        .filter(Payment.user_id == current_user.id)
        .order_by(Payment.created_at.desc())
        .all()
    )


@router.get("", response_model=list[PaymentRead])
def list_payments(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(Payment).order_by(Payment.created_at.desc()).all()


@router.get("/{payment_id}", response_model=PaymentRead)
def get_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.get(Payment, payment_id)
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment not found")
    if current_user.role.value != "admin" and payment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return payment
