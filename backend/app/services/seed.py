from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Course, FAQ, Lesson, Module, PromoCode, Review, User, UserRole, VideoType
from app.services.course_service import slugify

# Обновление текстов для уже существующей БД
CONTENT_PATCHES = {
    "reviews": [
        ("Hot towel", "Горячие полотенца"),
        ("fade", "фейду"),
        ("premium-академий", "премиальных академий"),
    ],
    "faq_payment": (
        "Оплата доступна банковской картой (Visa, Mastercard, МИР), через СБП, SberPay и ЮMoney. "
        "Все способы подключены через ЮKassa."
    ),
}


def _patch_existing_courses(db: Session) -> None:
    """Обновление текстов курсов при повторном запуске seed."""
    patches = {
        "fade": {
            "title": "Мужские стрижки: фейд и классика",
            "short_description": "Фейд, переходы и классика — от основ до мастерства",
            "description": (
                "Полный курс по мужским стрижкам: низкий, средний и высокий фейд, "
                "плавный переход, кроп, помpadour, пробор и классические формы."
            ),
        },
        "hot towel": {
            "title": "Бритьё и уход за бородой",
            "short_description": "Бритьё с горячими полотенцами и уход за бородой",
            "description": (
                "Опасное бритьё, горячие полотенца, работа с шейвером, "
                "контурирование бороды, масла, бальзамы и премиальный уход."
            ),
        },
        "beard grooming": {
            "title": "Бритьё и уход за бородой",
            "short_description": "Бритьё с горячими полотенцами и уход за бородой",
        },
        "tools": {
            "title": "Инструменты и укладка",
            "short_description": "Профессиональный набор и укладка",
        },
        "стайлинг": {
            "title": "Инструменты и укладка",
            "short_description": "Профессиональный набор и укладка",
        },
        "basics": {
            "title": "Основы барберинга",
            "short_description": "Старт карьеры барбера с нуля",
        },
    }

    lesson_patches = [
        ("Hot towel", "Горячие полотенца"),
        ("hot towel", "горячие полотенца"),
        ("Low fade", "Низкий фейд"),
        ("Side Part", "Пробор"),
        ("Fade", "Фейд"),
        ("fade", "фейд"),
        ("beard grooming", "уход за бородой"),
        ("Point cutting", "Точечная стрижка"),
        ("slide cut", "скользящий срез"),
        ("thinning", "филировка"),
    ]

    for course in db.query(Course).all():
        key = course.title.lower()
        for marker, data in patches.items():
            if marker in key or marker in (course.description or "").lower():
                for field, value in data.items():
                    setattr(course, field, value)
                break

        for module in course.modules:
            for lesson in module.lessons:
                for old, new in lesson_patches:
                    if old in lesson.title:
                        lesson.title = lesson.title.replace(old, new)
                    if old in (lesson.content or ""):
                        lesson.content = lesson.content.replace(old, new)

    db.flush()


def _patch_existing_content(db: Session) -> None:
    for review in db.query(Review).all():
        text = review.text
        for old, new in CONTENT_PATCHES["reviews"]:
            text = text.replace(old, new)
        if text != review.text:
            review.text = text

    faq_payment = db.query(FAQ).filter(FAQ.question.ilike("%оплат%")).first()
    if faq_payment:
        faq_payment.question = "Какие способы оплаты доступны?"
        faq_payment.answer = CONTENT_PATCHES["faq_payment"]

    for faq in db.query(FAQ).all():
        if "fade" in faq.answer.lower():
            faq.answer = faq.answer.replace("fade", "фейду").replace("Fade", "фейду")

    db.flush()


def _patch_course_images(db: Session) -> None:
    """Заменяет битые Unsplash-ссылки на локальные обложки с фронтенда."""
    image_by_title = {
        "Основы барберинга": "/courses/basics.jpg",
        "Мужские стрижки": "/courses/fade-classic.jpg",
        "Бритьё": "/courses/shave-beard.jpg",
        "Инструменты": "/courses/tools-styling.jpg",
    }

    for course in db.query(Course).all():
        if not course.image_url or "unsplash.com" not in course.image_url:
            continue
        for marker, url in image_by_title.items():
            if marker in course.title:
                course.image_url = url
                break

    db.flush()


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        if db.query(PromoCode).first() is None:
            db.add_all([
                PromoCode(code="KOLOS10", discount_percent=10, max_uses=100),
                PromoCode(code="BARBER500", discount_amount=500, max_uses=50),
                PromoCode(code="MASTER20", discount_percent=20, max_uses=20),
            ])

        if db.query(Review).first() is None:
            db.add_all([
                Review(
                    author_name="Алексей М.",
                    author_role="Барбер, Moscow Cuts",
                    rating=5,
                    text="Прошёл курс по фейду — через месяц уже принимаю клиентов. Структура уроков идеальная, всё по делу.",
                ),
                Review(
                    author_name="Дмитрий К.",
                    author_role="Владелец барбершопа",
                    rating=5,
                    text="Отправил всю команду на KOLOS. Качество контента на уровне премиальных академий, а цена адекватная.",
                ),
                Review(
                    author_name="Максим R.",
                    author_role="Начинающий барбер",
                    rating=5,
                    text="Начинал с нуля. Горячие полотенца и работа с бородой — отдельный кайф. Сертификат получил после 100% прогресса.",
                ),
            ])

        if db.query(FAQ).first() is None:
            db.add_all([
                FAQ(
                    order=0,
                    question="Нужен ли опыт для начала обучения?",
                    answer="Нет. Курс «Основы барберинга» создан для новичков. Для продвинутых есть отдельные программы по фейду и бритью.",
                ),
                FAQ(
                    order=1,
                    question="Как проходит обучение?",
                    answer="Вы покупаете курс, получаете доступ к видеоурокам и материалам. Проходите модули в своём темпе, отмечаете прогресс. После 100% — сертификат KOLOS.",
                ),
                FAQ(
                    order=2,
                    question="Какие способы оплаты доступны?",
                    answer=CONTENT_PATCHES["faq_payment"],
                ),
                FAQ(
                    order=3,
                    question="Выдаётся ли сертификат?",
                    answer="Да. После прохождения всех уроков курса вы автоматически получаете именной сертификат KOLOS с уникальным номером.",
                ),
                FAQ(
                    order=4,
                    question="Как использовать промокод?",
                    answer="На странице курса перед оплатой введите промокод — скидка применится автоматически.",
                ),
            ])
        else:
            _patch_existing_content(db)

        _patch_existing_courses(db)
        _patch_course_images(db)

        if db.query(User).first():
            db.commit()
            return

        admin = User(
            email="admin@kolos.bar",
            full_name="KOLOS Master",
            hashed_password=get_password_hash("admin123"),
            role=UserRole.ADMIN,
        )
        student = User(
            email="student@kolos.bar",
            full_name="Иван Барбер",
            hashed_password=get_password_hash("student123"),
            role=UserRole.STUDENT,
        )
        db.add_all([admin, student])
        db.flush()

        courses_data = [
            {
                "title": "Основы барберинга",
                "description": (
                    "Фундаментальный курс для начинающих барберов: история профессии, "
                    "этикет, гигиена, организация рабочего места и первые техники работы с клиентом."
                ),
                "short_description": "Старт карьеры барбера с нуля",
                "price": 12990.0,
                "image_url": "/courses/basics.jpg",
                "modules": [
                    {
                        "title": "Введение в профессию",
                        "lessons": [
                            {
                                "title": "Кто такой барбер сегодня",
                                "content": (
                                    "Современный барбер — мастер стиля, психолог и художник. "
                                    "Разберём роль барбера в премиальном сегменте и стандарты сервиса KOLOS."
                                ),
                                "video_type": VideoType.NONE,
                                "duration_minutes": 18,
                            },
                            {
                                "title": "Гигиена и стерилизация инструментов",
                                "content": (
                                    "Правила дезинфекции, барbacide, UV-стерилизаторы, "
                                    "одноразовые расходники и безопасность клиента."
                                ),
                                "video_type": VideoType.NONE,
                                "duration_minutes": 22,
                            },
                        ],
                    },
                    {
                        "title": "Рабочее место",
                        "lessons": [
                            {
                                "title": "Организация барбер-кресла",
                                "content": "Расположение инструментов, освещение, зеркала и порядок работы с клиентом.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 15,
                            },
                        ],
                    },
                ],
            },
            {
                "title": "Мужские стрижки: фейд и классика",
                "description": (
                    "Полный курс по мужским стрижкам: низкий, средний и высокий фейд, "
                    "плавный переход, кроп, помpadour, пробор и классические формы."
                ),
                "short_description": "Фейд, переходы и классика — от основ до мастерства",
                "price": 19990.0,
                "image_url": "/courses/fade-classic.jpg",
                "modules": [
                    {
                        "title": "Фейд — техника и инструменты",
                        "lessons": [
                            {
                                "title": "Низкий фейд: пошаговый разбор",
                                "content": (
                                    "Работа машинкой с насадками, открытые и закрытые переходы, "
                                    "выведение линии фейда и финальная доводка триммером."
                                ),
                                "video_url": "https://www.youtube.com/watch?v=AbTN0pTrXX8",
                                "video_type": VideoType.YOUTUBE,
                                "duration_minutes": 35,
                            },
                            {
                                "title": "Средний фейд и фейд под кожу",
                                "content": "Отличия среднего фейда от низкого, техника фейда под кожу без полос и артефактов.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 40,
                            },
                        ],
                    },
                    {
                        "title": "Классические формы",
                        "lessons": [
                            {
                                "title": "Пробор и помpadour",
                                "content": "Создание чёткого пробора, объём на макушке, укладка и фиксация.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 28,
                            },
                        ],
                    },
                ],
            },
            {
                "title": "Бритьё и уход за бородой",
                "description": (
                    "Опасное бритьё, горячие полотенца, работа с шейвером, "
                    "контурирование бороды, масла, бальзамы и премиальный уход."
                ),
                "short_description": "Бритьё с горячими полотенцами и уход за бородой",
                "price": 16990.0,
                "image_url": "/courses/shave-beard.jpg",
                "modules": [
                    {
                        "title": "Опасное бритьё",
                        "lessons": [
                            {
                                "title": "Ритуал с горячими полотенцами",
                                "content": (
                                    "Подготовка кожи, размягчение волос, нанесение пены, "
                                    "техника бритья по росту и против для идеальной гладкости."
                                ),
                                "video_type": VideoType.NONE,
                                "duration_minutes": 30,
                            },
                            {
                                "title": "Бритьё шейвером и триммером",
                                "content": "Когда использовать шейвер и опасную бритву, уход после бритья.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 25,
                            },
                        ],
                    },
                    {
                        "title": "Борода",
                        "lessons": [
                            {
                                "title": "Контурирование и форма бороды",
                                "content": (
                                    "Линии щёк и шеи, симметрия, работа триммером и ножницами, "
                                    "подбор формы под тип лица."
                                ),
                                "video_type": VideoType.NONE,
                                "duration_minutes": 32,
                            },
                        ],
                    },
                ],
            },
            {
                "title": "Инструменты и укладка",
                "description": (
                    "Машинки, насадки, ножницы, расчёски, pomade, clay, wax — "
                    "как выбрать инструмент и создать фирменный стиль клиента."
                ),
                "short_description": "Профессиональный набор и укладка",
                "price": 9990.0,
                "image_url": "/courses/tools-styling.jpg",
                "modules": [
                    {
                        "title": "Инструменты",
                        "lessons": [
                            {
                                "title": "Машинки: Wahl, Andis, Babyliss",
                                "content": "Сравнение моделей, мощность мотора, насадки и обслуживание.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 20,
                            },
                            {
                                "title": "Ножницы и текстурирование",
                                "content": "Точечная стрижка, скользящий срез, филировка — когда и как применять.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 24,
                            },
                        ],
                    },
                    {
                        "title": "Укладка",
                        "lessons": [
                            {
                                "title": "Pomade, clay, wax — выбор средства",
                                "content": "Матовый и глянцевый финиш, степень фиксации, рекомендации для домашнего ухода.",
                                "video_type": VideoType.NONE,
                                "duration_minutes": 18,
                            },
                        ],
                    },
                ],
            },
        ]

        for course_data in courses_data:
            modules_data = course_data.pop("modules")
            course = Course(
                **course_data,
                slug=slugify(course_data["title"]),
                is_published=True,
                instructor_id=admin.id,
            )
            db.add(course)
            db.flush()

            for m_idx, module_data in enumerate(modules_data):
                lessons_data = module_data.pop("lessons")
                module = Module(course_id=course.id, title=module_data["title"], order=m_idx)
                db.add(module)
                db.flush()

                for l_idx, lesson_data in enumerate(lessons_data):
                    lesson = Lesson(module_id=module.id, order=l_idx, **lesson_data)
                    db.add(lesson)

        db.commit()
    finally:
        db.close()
