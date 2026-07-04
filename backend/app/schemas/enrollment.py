from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class EnrollmentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: int
    progress_percent: float
    enrolled_at: datetime


class EnrollmentWithCourse(EnrollmentRead):
    course_title: str
    course_slug: str
    course_image_url: str | None
    lessons_count: int = 0
    completed_lessons: int = 0


class PaymentCreate(BaseModel):
    course_id: int
    payment_method: str = "auto"
    promo_code: str | None = None


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: int
    amount: float
    discount_amount: float = 0
    promo_code: str | None = None
    status: PaymentStatus
    payment_method: str
    external_id: str | None
    payment_url: str | None = None
    created_at: datetime


class LessonProgressUpdate(BaseModel):
    completed: bool = True


class LessonProgressRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    lesson_id: int
    completed: bool
    completed_at: datetime | None
    updated_at: datetime
