import secrets
from datetime import datetime, timezone

from sqlalchemy.orm import Session, joinedload

from app.models import Certificate, Course, Enrollment, Module
from app.services.email_service import send_certificate_email


def generate_certificate_code() -> str:
    return f"KOLOS-{secrets.token_hex(4).upper()}-{secrets.token_hex(2).upper()}"


def issue_certificate_if_completed(db: Session, user_id: int, course_id: int) -> Certificate | None:
    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if not enrollment or enrollment.progress_percent < 100:
        return None

    existing = (
        db.query(Certificate)
        .filter(Certificate.user_id == user_id, Certificate.course_id == course_id)
        .first()
    )
    if existing:
        return existing

    course = db.get(Course, course_id)
    from app.models import User

    user = db.get(User, user_id)
    if not course or not user:
        return None

    cert = Certificate(
        user_id=user_id,
        course_id=course_id,
        certificate_code=generate_certificate_code(),
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)

    send_certificate_email(user.email, user.full_name, course.title, cert.certificate_code)
    return cert
