from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_admin, get_current_user, get_optional_user
from app.db.session import get_db
from app.models import Course, Module, User
from app.schemas.course import CourseCreate, CourseListItem, CourseRead, CourseUpdate
from app.services.course_service import enrich_course_read, slugify, user_has_enrollment

router = APIRouter(prefix="/courses", tags=["Courses"])


def _unique_slug(db: Session, title: str, slug: str | None = None) -> str:
    base = slug or slugify(title)
    candidate = base
    counter = 1
    while db.query(Course).filter(Course.slug == candidate).first():
        candidate = f"{base}-{counter}"
        counter += 1
    return candidate


@router.get("", response_model=list[CourseListItem])
def list_courses(
    published_only: bool = True,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    query = db.query(Course).options(joinedload(Course.modules).joinedload(Module.lessons))
    if published_only and (not current_user or current_user.role.value != "admin"):
        query = query.filter(Course.is_published.is_(True))

    courses = query.order_by(Course.created_at.desc()).all()
    result = []
    for course in courses:
        item = CourseListItem.model_validate(course)
        item.lessons_count = sum(len(m.lessons) for m in course.modules)
        result.append(item)
    return result


@router.get("/{course_id}", response_model=CourseRead)
def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.lessons))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    if not course.is_published and (not current_user or current_user.role.value != "admin"):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    is_enrolled = False
    progress = None
    if current_user:
        is_enrolled = user_has_enrollment(db, current_user.id, course.id)
        if is_enrolled:
            from app.models import Enrollment

            enrollment = (
                db.query(Enrollment)
                .filter(Enrollment.user_id == current_user.id, Enrollment.course_id == course.id)
                .first()
            )
            progress = enrollment.progress_percent if enrollment else 0.0

    return enrich_course_read(
        course,
        is_enrolled=is_enrolled,
        progress_percent=progress,
        include_modules=True,
        user=current_user,
        db=db,
    )


@router.post("", response_model=CourseRead, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    course = Course(
        title=payload.title,
        slug=_unique_slug(db, payload.title, payload.slug),
        description=payload.description,
        short_description=payload.short_description,
        price=payload.price,
        image_url=payload.image_url,
        is_published=payload.is_published,
        instructor_id=payload.instructor_id or admin.id,
    )
    db.add(course)
    db.commit()
    db.refresh(course)
    return enrich_course_read(course, include_modules=True)


@router.patch("/{course_id}", response_model=CourseRead)
def update_course(
    course_id: int,
    payload: CourseUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.lessons))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    data = payload.model_dump(exclude_unset=True)
    if "slug" in data and data["slug"]:
        data["slug"] = _unique_slug(db, data.get("title", course.title), data["slug"])
    for key, value in data.items():
        setattr(course, key, value)

    db.commit()
    db.refresh(course)
    return enrich_course_read(course, include_modules=True)


@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    course = db.get(Course, course_id)
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")
    db.delete(course)
    db.commit()
