"""Эндпоинты для Kolos Bot (Telegram).

Все роуты требуют сервисный JWT (get_service_caller), а не обычный
пользовательский токен. Специально вынесены в отдельный namespace
/telegram/*, чтобы:
  1) не пересекаться путями с публичными /courses, /lessons и т.д.
     (у тех — своя авторизация через get_current_user/get_optional_user);
  2) на уровне nginx/файрвола можно было ограничить доступ к /api/v1/telegram/*
     только с IP бота, не трогая остальной API.

Бот всегда идентифицирует пользователя по telegram_id, а не по внутреннему
user_id — эндпоинт сам резолвит telegram_id -> User и 404-ит, если аккаунт
не привязан. Так сервисный токен не даёт доступа к "любому user_id", только
к уже легитимно связанным аккаунтам.
"""

import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload

from app.core.config import get_settings
from app.core.deps import get_service_caller
from app.core.security import verify_token
from app.db.session import get_db
from app.models import (
    Course,
    Enrollment,
    Lesson,
    LessonProgress,
    Module,
    Payment,
    PaymentStatus,
    Streak,
    Submission,
    Test,
    TestAttempt,
    TestQuestion,
    User,
)
from app.schemas.telegram import (
    BotAccessResponse,
    BotLessonRead,
    BotModuleItem,
    BotModuleLessonItem,
    BotProgressResponse,
    BotTestOption,
    BotTestQuestion,
    BotTestRead,
    BotTestResultItem,
    BotTestSubmit,
    BotTestSubmitResponse,
    PhotoUploadResponse,
    SubmissionCreate,
    SubmissionRead,
    TelegramLinkRequest,
    TelegramLinkResponse,
)
from app.services.course_service import get_module_test_map, get_passed_test_ids, is_module_passed, user_has_enrollment
from app.services.streak_service import record_activity

router = APIRouter(tags=["Telegram Bot"], dependencies=[Depends(get_service_caller)])

PHOTO_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_PHOTO_SIZE = 8 * 1024 * 1024  # 8 MB — с запасом под фото с телефона


def _get_linked_user(db: Session, telegram_id: int) -> User:
    user = db.query(User).filter(User.telegram_id == telegram_id).first()
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Telegram account not linked")
    return user


def _completed_lesson_ids(db: Session, user_id: int, lesson_ids: list[int]) -> set[int]:
    if not lesson_ids:
        return set()
    rows = (
        db.query(LessonProgress.lesson_id)
        .filter(
            LessonProgress.user_id == user_id,
            LessonProgress.lesson_id.in_(lesson_ids),
            LessonProgress.completed.is_(True),
        )
        .all()
    )
    return {row[0] for row in rows}


# ---- Связка аккаунта ------------------------------------------------------


@router.post("/telegram/link", response_model=TelegramLinkResponse)
def link_telegram_account(payload: TelegramLinkRequest, db: Session = Depends(get_db)):
    token_payload = verify_token(payload.link_token, "telegram_link")
    if not token_payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired link token")

    user = db.get(User, int(token_payload["sub"]))
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    existing = db.query(User).filter(User.telegram_id == payload.telegram_id).first()
    if existing and existing.id != user.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="This Telegram account is already linked")

    user.telegram_id = payload.telegram_id
    db.commit()
    db.refresh(user)
    return TelegramLinkResponse(user_id=user.id, full_name=user.full_name, email=user.email)


# ---- Курс / модули / уроки -------------------------------------------------


@router.get("/telegram/courses/{course_id}/modules", response_model=list[BotModuleItem])
def get_course_modules(course_id: int, telegram_id: int, db: Session = Depends(get_db)):
    user = _get_linked_user(db, telegram_id)

    if not user_has_enrollment(db, user.id, course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    course = (
        db.query(Course)
        .options(joinedload(Course.modules).joinedload(Module.lessons))
        .filter(Course.id == course_id)
        .first()
    )
    if not course:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    all_lesson_ids = [lesson.id for module in course.modules for lesson in module.lessons]
    completed_ids = _completed_lesson_ids(db, user.id, all_lesson_ids)

    module_ids = [module.id for module in course.modules]
    test_by_module = get_module_test_map(db, module_ids)
    passed_test_ids = get_passed_test_ids(db, user.id, [test.id for test in test_by_module.values()])

    modules = sorted(course.modules, key=lambda m: m.order)
    result: list[BotModuleItem] = []
    current_taken = False
    for module in modules:
        lessons = sorted(module.lessons, key=lambda lesson: lesson.order)
        is_done = is_module_passed(module, completed_ids, test_by_module, passed_test_ids)
        if is_done:
            state = "done"
        elif not current_taken:
            state = "current"
            current_taken = True
        else:
            state = "locked"
        result.append(
            BotModuleItem(
                id=module.id,
                title=module.title,
                order=module.order,
                status=state,
                lessons=[
                    BotModuleLessonItem(
                        id=lesson.id,
                        title=lesson.title,
                        order=lesson.order,
                        completed=lesson.id in completed_ids,
                    )
                    for lesson in lessons
                ],
            )
        )
    return result


@router.get("/telegram/lessons/{lesson_id}", response_model=BotLessonRead)
def get_lesson_for_bot(lesson_id: int, telegram_id: int, db: Session = Depends(get_db)):
    user = _get_linked_user(db, telegram_id)

    lesson = db.query(Lesson).options(joinedload(Lesson.module)).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    if not user_has_enrollment(db, user.id, lesson.module.course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    progress = (
        db.query(LessonProgress)
        .filter(LessonProgress.user_id == user.id, LessonProgress.lesson_id == lesson_id)
        .first()
    )
    return BotLessonRead(
        id=lesson.id,
        module_id=lesson.module_id,
        title=lesson.title,
        content=lesson.content,
        video_url=lesson.video_url,
        duration_minutes=lesson.duration_minutes,
        completed=bool(progress and progress.completed),
    )


# ---- Прогресс и доступ ------------------------------------------------------


@router.get("/telegram/users/{telegram_id}/progress", response_model=BotProgressResponse)
def get_user_progress(telegram_id: int, db: Session = Depends(get_db)):
    user = _get_linked_user(db, telegram_id)

    enrollment = db.query(Enrollment).filter(Enrollment.user_id == user.id).order_by(Enrollment.enrolled_at).first()

    passed_modules = 0
    total_modules = 0
    course_id = None
    if enrollment:
        course_id = enrollment.course_id
        course = (
            db.query(Course)
            .options(joinedload(Course.modules).joinedload(Module.lessons))
            .filter(Course.id == course_id)
            .first()
        )
        if course:
            total_modules = len(course.modules)
            all_lesson_ids = [lesson.id for module in course.modules for lesson in module.lessons]
            completed_ids = _completed_lesson_ids(db, user.id, all_lesson_ids)
            module_ids = [module.id for module in course.modules]
            test_by_module = get_module_test_map(db, module_ids)
            passed_test_ids = get_passed_test_ids(db, user.id, [test.id for test in test_by_module.values()])
            for module in course.modules:
                if is_module_passed(module, completed_ids, test_by_module, passed_test_ids):
                    passed_modules += 1

    submissions_count = db.query(Submission).filter(Submission.user_id == user.id).count()
    avg_score = db.query(func.avg(Submission.overall)).filter(Submission.user_id == user.id).scalar()

    streak = db.query(Streak).filter(Streak.user_id == user.id).first()

    return BotProgressResponse(
        course_id=course_id,
        passed_modules=passed_modules,
        total_modules=total_modules,
        streak_days=streak.current_streak if streak else 0,
        submissions_count=submissions_count,
        avg_score=round(avg_score, 1) if avg_score is not None else None,
    )


@router.get("/telegram/users/{telegram_id}/access", response_model=BotAccessResponse)
def get_user_access(telegram_id: int, db: Session = Depends(get_db)):
    user = _get_linked_user(db, telegram_id)

    has_paid = (
        db.query(Payment)
        .filter(Payment.user_id == user.id, Payment.status == PaymentStatus.COMPLETED)
        .first()
        is not None
    )
    if has_paid:
        return BotAccessResponse(tier="pro", daily_submission_limit=None)

    settings = get_settings()
    return BotAccessResponse(tier="free", daily_submission_limit=settings.default_daily_submission_limit)


# ---- Домашка (фото + AI-разбор) --------------------------------------------


@router.post("/telegram/uploads/submission-photo", response_model=PhotoUploadResponse)
async def upload_submission_photo(request: Request, file: UploadFile = File(...)):
    ext = PHOTO_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Разрешены только изображения JPEG, PNG или WebP",
        )

    contents = await file.read()
    if len(contents) > MAX_PHOTO_SIZE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Файл слишком большой (максимум 8 МБ)")

    settings = get_settings()
    upload_dir = Path(settings.upload_dir) / "submissions"
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    (upload_dir / filename).write_bytes(contents)

    host = request.headers.get("host", request.url.hostname or "")
    scheme = "http" if ("localhost" in host or "127.0.0.1" in host) else "https"
    return PhotoUploadResponse(url=f"{scheme}://{host}/uploads/submissions/{filename}")


@router.post("/telegram/submissions", response_model=SubmissionRead, status_code=status.HTTP_201_CREATED)
def create_submission(payload: SubmissionCreate, db: Session = Depends(get_db)):
    user = _get_linked_user(db, payload.telegram_id)

    if payload.lesson_id is not None and not db.get(Lesson, payload.lesson_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    submission = Submission(
        user_id=user.id,
        lesson_id=payload.lesson_id,
        photo_url=payload.photo_url,
        scores=payload.scores.model_dump(),
        overall=payload.overall,
        strengths=payload.strengths,
        issues=[issue.model_dump() for issue in payload.issues],
        priority_next_step=payload.priority_next_step,
        verdict=payload.verdict,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)

    record_activity(db, user)

    return submission


# ---- Тесты модуля -----------------------------------------------------------


@router.get("/telegram/modules/{module_id}/test", response_model=BotTestRead)
def get_module_test_for_bot(module_id: int, telegram_id: int, db: Session = Depends(get_db)):
    user = _get_linked_user(db, telegram_id)

    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    if not user_has_enrollment(db, user.id, module.course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    test = (
        db.query(Test)
        .options(joinedload(Test.questions).joinedload(TestQuestion.options))
        .filter(Test.module_id == module_id)
        .first()
    )
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found for this module")

    return BotTestRead(
        id=test.id,
        module_id=test.module_id,
        title=test.title,
        passing_score=test.passing_score,
        questions=[
            BotTestQuestion(
                id=question.id,
                text=question.text,
                order=question.order,
                options=[
                    BotTestOption(id=option.id, text=option.text, order=option.order)
                    for option in sorted(question.options, key=lambda option: option.order)
                ],
            )
            for question in sorted(test.questions, key=lambda question: question.order)
        ],
    )


@router.post("/telegram/tests/{test_id}/submit", response_model=BotTestSubmitResponse)
def submit_test(test_id: int, payload: BotTestSubmit, db: Session = Depends(get_db)):
    user = _get_linked_user(db, payload.telegram_id)

    test = (
        db.query(Test)
        .options(joinedload(Test.questions).joinedload(TestQuestion.options), joinedload(Test.module))
        .filter(Test.id == test_id)
        .first()
    )
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    if not user_has_enrollment(db, user.id, test.module.course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    questions = sorted(test.questions, key=lambda question: question.order)
    answer_by_question = {answer.question_id: answer.option_id for answer in payload.answers}
    if answer_by_question.keys() != {question.id for question in questions}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Answers must cover every question exactly once"
        )

    results: list[BotTestResultItem] = []
    correct_count = 0
    for question in questions:
        selected_option = next(
            (option for option in question.options if option.id == answer_by_question[question.id]), None
        )
        if not selected_option:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid option for question {question.id}",
            )
        correct_option = next((option for option in question.options if option.is_correct), None)
        if selected_option.is_correct:
            correct_count += 1
        results.append(
            BotTestResultItem(
                question_id=question.id,
                question_text=question.text,
                selected_option_id=selected_option.id,
                correct_option_id=correct_option.id if correct_option else -1,
                is_correct=selected_option.is_correct,
            )
        )

    score = round((correct_count / len(questions)) * 100) if questions else 0
    passed = score >= test.passing_score

    attempt = TestAttempt(
        user_id=user.id,
        test_id=test.id,
        score=score,
        passed=passed,
        answers=[answer.model_dump() for answer in payload.answers],
    )
    db.add(attempt)
    db.commit()

    if passed:
        record_activity(db, user)

    return BotTestSubmitResponse(score=score, passed=passed, passing_score=test.passing_score, results=results)


# ---- Заглушки будущих фаз ---------------------------------------------------


@router.get("/telegram/knowledge/search", status_code=status.HTTP_501_NOT_IMPLEMENTED)
def search_knowledge(query: str):
    # TODO Фаза 3: RAG по базе знаний через pgvector
    raise HTTPException(status_code=status.HTTP_501_NOT_IMPLEMENTED, detail="Knowledge search: Фаза 3")
