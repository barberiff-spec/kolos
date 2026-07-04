import uuid

import httpx
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.models import Course, Payment, PaymentStatus, User
from app.services.payment_methods import get_yookassa_payment_method

settings = get_settings()
YOOKASSA_API = "https://api.yookassa.ru/v3/payments"


def create_yookassa_payment(
    db: Session,
    user: User,
    course: Course,
    amount: float,
    payment_method: str = "card",
    promo_code: str | None = None,
) -> Payment:
    idempotence_key = str(uuid.uuid4())
    return_url = f"{settings.frontend_url}/payment/success?course_id={course.id}&amount={amount:.2f}"

    payload: dict = {
        "amount": {"value": f"{amount:.2f}", "currency": "RUB"},
        "confirmation": {"type": "redirect", "return_url": return_url},
        "capture": True,
        "description": f"KOLOS: {course.title}",
        "metadata": {
            "user_id": str(user.id),
            "course_id": str(course.id),
            "promo_code": promo_code or "",
            "payment_method": payment_method,
        },
    }

    yookassa_type = get_yookassa_payment_method(payment_method)
    if yookassa_type:
        payload["payment_method_data"] = {"type": yookassa_type}

    with httpx.Client(timeout=30.0) as client:
        response = client.post(
            YOOKASSA_API,
            json=payload,
            auth=(settings.yookassa_shop_id, settings.yookassa_secret_key),
            headers={"Idempotence-Key": idempotence_key, "Content-Type": "application/json"},
        )
        response.raise_for_status()
        data = response.json()

    payment = Payment(
        user_id=user.id,
        course_id=course.id,
        amount=amount,
        promo_code=promo_code,
        status=PaymentStatus.PENDING,
        payment_method=payment_method,
        external_id=data["id"],
        payment_url=data["confirmation"]["confirmation_url"],
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment


def handle_yookassa_webhook(db: Session, event: dict) -> Payment | None:
    if event.get("event") != "payment.succeeded":
        return None

    obj = event.get("object", {})
    external_id = obj.get("id")
    if not external_id:
        return None

    payment = db.query(Payment).filter(Payment.external_id == external_id).first()
    if not payment or payment.status == PaymentStatus.COMPLETED:
        return payment

    payment.status = PaymentStatus.COMPLETED
    db.commit()
    db.refresh(payment)
    return payment
