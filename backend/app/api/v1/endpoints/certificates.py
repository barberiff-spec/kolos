from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Certificate, Course, User
from app.schemas.extras import CertificateRead

router = APIRouter(prefix="/certificates", tags=["Certificates"])


@router.get("/me", response_model=list[CertificateRead])
def my_certificates(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    certs = (
        db.query(Certificate)
        .filter(Certificate.user_id == current_user.id)
        .order_by(Certificate.issued_at.desc())
        .all()
    )
    result = []
    for cert in certs:
        course = db.get(Course, cert.course_id)
        result.append(
            CertificateRead(
                id=cert.id,
                user_id=cert.user_id,
                course_id=cert.course_id,
                certificate_code=cert.certificate_code,
                issued_at=cert.issued_at,
                course_title=course.title if course else None,
                user_name=current_user.full_name,
            )
        )
    return result


@router.get("/verify/{code}", response_model=CertificateRead)
def verify_certificate(code: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.certificate_code == code.upper()).first()
    if not cert:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Certificate not found")
    course = db.get(Course, cert.course_id)
    user = db.get(User, cert.user_id)
    return CertificateRead(
        id=cert.id,
        user_id=cert.user_id,
        course_id=cert.course_id,
        certificate_code=cert.certificate_code,
        issued_at=cert.issued_at,
        course_title=course.title if course else None,
        user_name=user.full_name if user else None,
    )


@router.get("", response_model=list[CertificateRead])
def list_certificates(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    certs = db.query(Certificate).order_by(Certificate.issued_at.desc()).all()
    result = []
    for cert in certs:
        course = db.get(Course, cert.course_id)
        user = db.get(User, cert.user_id)
        result.append(
            CertificateRead(
                id=cert.id,
                user_id=cert.user_id,
                course_id=cert.course_id,
                certificate_code=cert.certificate_code,
                issued_at=cert.issued_at,
                course_title=course.title if course else None,
                user_name=user.full_name if user else None,
            )
        )
    return result
