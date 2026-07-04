from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_user
from app.db.session import get_db
from app.models import Course, Lesson, LessonProgress, Module, User
from app.schemas.enrollment import LessonProgressRead, LessonProgressUpdate
from app.services.certificate_service import issue_certificate_if_completed
from app.services.course_service import recalculate_course_progress, user_has_enrollment

router = APIRouter(prefix="/progress", tags=["Progress"])


@router.get("/course/{course_id}", response_model=list[LessonProgressRead])
def course_progress(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not user_has_enrollment(db, current_user.id, course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.lessons))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    lesson_ids = [lesson.id for module in course.modules for lesson in module.lessons]
    if not lesson_ids:
        return []

    return (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id.in_(lesson_ids))
        .all()
    )


@router.put("/lesson/{lesson_id}", response_model=LessonProgressRead)
def update_lesson_progress(
    lesson_id: int,
    payload: LessonProgressUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).options(joinedload(Lesson.module)).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course_id = lesson.module.course_id
    if not user_has_enrollment(db, current_user.id, course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == current_user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    if not progress:
        progress = LessonProgress(user_id=current_user.id, lesson_id=lesson_id)
        db.add(progress)

    progress.completed = payload.completed
    progress.completed_at = datetime.now(timezone.utc) if payload.completed else None
    db.commit()
    db.refresh(progress)

    recalculate_course_progress(db, current_user.id, course_id)
    if payload.completed:
        issue_certificate_if_completed(db, current_user.id, course_id)
    return progress
