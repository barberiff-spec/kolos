from sqlalchemy.orm import Session, joinedload

from app.models import Course, Enrollment, Lesson, LessonProgress, Module, User


def slugify(text: str) -> str:
    import re

    slug = text.lower().strip()
    slug = re.sub(r"[^\w\s-]", "", slug)
    slug = re.sub(r"[\s_-]+", "-", slug)
    return slug[:255]


def count_course_lessons(course: Course) -> int:
    return sum(len(module.lessons) for module in course.modules)


def user_has_enrollment(db: Session, user_id: int, course_id: int) -> bool:
    return (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
        is not None
    )


def recalculate_course_progress(db: Session, user_id: int, course_id: int) -> float:
    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.lessons))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        return 0.0

    lesson_ids = [lesson.id for module in course.modules for lesson in module.lessons]
    if not lesson_ids:
        return 0.0

    completed = (
        db.query(LessonProgress)
        .filter(
            LessonProgress.user_id == user_id,
            LessonProgress.lesson_id.in_(lesson_ids),
            LessonProgress.completed.is_(True),
        )
        .count()
    )
    progress = round((completed / len(lesson_ids)) * 100, 2)

    enrollment = (
        db.query(Enrollment)
        .filter(Enrollment.user_id == user_id, Enrollment.course_id == course_id)
        .first()
    )
    if enrollment:
        enrollment.progress_percent = progress
        db.commit()

    return progress


def enrich_course_read(
    course: Course,
    *,
    is_enrolled: bool | None = None,
    progress_percent: float | None = None,
    include_modules: bool = True,
    user: User | None = None,
    db: Session | None = None,
) -> dict:
    data = {
        "id": course.id,
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "short_description": course.short_description,
        "price": course.price,
        "image_url": course.image_url,
        "is_published": course.is_published,
        "instructor_id": course.instructor_id,
        "created_at": course.created_at,
        "updated_at": course.updated_at,
        "lessons_count": count_course_lessons(course),
        "is_enrolled": is_enrolled,
        "progress_percent": progress_percent,
        "modules": [],
    }

    if include_modules:
        for module in sorted(course.modules, key=lambda m: m.order):
            module_data = {
                "id": module.id,
                "course_id": module.course_id,
                "title": module.title,
                "order": module.order,
                "created_at": module.created_at,
                "lessons": [],
            }
            for lesson in sorted(module.lessons, key=lambda l: l.order):
                lesson_data = {
                    "id": lesson.id,
                    "module_id": lesson.module_id,
                    "title": lesson.title,
                    "content": lesson.content if is_enrolled else None,
                    "video_url": lesson.video_url if is_enrolled else None,
                    "video_type": lesson.video_type,
                    "order": lesson.order,
                    "duration_minutes": lesson.duration_minutes,
                    "created_at": lesson.created_at,
                    "completed": None,
                }
                if user and db and is_enrolled:
                    progress = (
                        db.query(LessonProgress)
                        .filter(
                            LessonProgress.user_id == user.id,
                            LessonProgress.lesson_id == lesson.id,
                        )
                        .first()
                    )
                    lesson_data["completed"] = progress.completed if progress else False
                module_data["lessons"].append(lesson_data)
            data["modules"].append(module_data)

    return data
