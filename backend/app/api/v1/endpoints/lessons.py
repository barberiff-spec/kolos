from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Lesson, Module, User
from app.schemas.course import LessonCreate, LessonRead, LessonUpdate
from app.services.course_service import user_has_enrollment

router = APIRouter(prefix="/lessons", tags=["Lessons"])


@router.get("", response_model=list[LessonRead])
def list_lessons(module_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Lesson)
    if module_id:
        query = query.filter(Lesson.module_id == module_id)
    return query.order_by(Lesson.order).all()


@router.get("/{lesson_id}", response_model=LessonRead)
def get_lesson(
    lesson_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course_id = lesson.module.course_id
    if current_user.role.value != "admin" and not user_has_enrollment(db, current_user.id, course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    return lesson


@router.post("", response_model=LessonRead, status_code=status.HTTP_201_CREATED)
def create_lesson(payload: LessonCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    if not db.get(Module, payload.module_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    lesson = Lesson(**payload.model_dump())
    db.add(lesson)
    db.commit()
    db.refresh(lesson)
    return lesson


@router.patch("/{lesson_id}", response_model=LessonRead)
def update_lesson(
    lesson_id: int,
    payload: LessonUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    data = payload.model_dump(exclude_unset=True)
    if "module_id" in data and not db.get(Module, data["module_id"]):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    for key, value in data.items():
        setattr(lesson, key, value)

    db.commit()
    db.refresh(lesson)
    return lesson


@router.delete("/{lesson_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lesson(lesson_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    lesson = db.get(Lesson, lesson_id)
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
