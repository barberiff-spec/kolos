from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Course, Enrollment, LessonProgress, Module, User
from app.schemas.enrollment import EnrollmentRead, EnrollmentWithCourse
from app.services.course_service import count_course_lessons

router = APIRouter(prefix="/enrollments", tags=["Enrollments"])


@router.get("/me", response_model=list[EnrollmentWithCourse])
def my_enrollments(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    enrollments = (
        db.query(Enrollment)
        .options(joinedload(Enrollment.course).joinedload(Course.modules).joinedload(Module.lessons))
        .filter(Enrollment.user_id == current_user.id)
        .order_by(Enrollment.enrolled_at.desc())
        .all()
    )

    result = []
    for enrollment in enrollments:
        course = enrollment.course
        lesson_ids = [lesson.id for module in course.modules for lesson in module.lessons]
        completed = 0
        if lesson_ids:
            completed = (
                db.query(LessonProgress)
                .filter(
                    LessonProgress.user_id == current_user.id,
                    LessonProgress.lesson_id.in_(lesson_ids),
                    LessonProgress.completed.is_(True),
                )
                .count()
            )

        result.append(
            EnrollmentWithCourse(
                id=enrollment.id,
                user_id=enrollment.user_id,
                course_id=enrollment.course_id,
                progress_percent=enrollment.progress_percent,
                enrolled_at=enrollment.enrolled_at,
                course_title=course.title,
                course_slug=course.slug,
                course_image_url=course.image_url,
                lessons_count=count_course_lessons(course),
                completed_lessons=completed,
            )
        )
    return result


@router.get("", response_model=list[EnrollmentRead])
def list_enrollments(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return db.query(Enrollment).order_by(Enrollment.enrolled_at.desc()).all()


@router.get("/{enrollment_id}", response_model=EnrollmentRead)
def get_enrollment(
    enrollment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    enrollment = db.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    if current_user.role.value != "admin" and enrollment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    return enrollment


@router.delete("/{enrollment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_enrollment(enrollment_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    enrollment = db.get(Enrollment, enrollment_id)
    if not enrollment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()
