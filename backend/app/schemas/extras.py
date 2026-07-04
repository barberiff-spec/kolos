from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CertificateRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    course_id: int
    certificate_code: str
    issued_at: datetime
    course_title: str | None = None
    user_name: str | None = None


class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=2000)


class CommentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    lesson_id: int
    content: str
    created_at: datetime
    user_name: str | None = None
    user_role: str | None = None


class PromoCodeCreate(BaseModel):
    code: str = Field(min_length=3, max_length=50)
    discount_percent: float = Field(default=0, ge=0, le=100)
    discount_amount: float = Field(default=0, ge=0)
    max_uses: int | None = None
    is_active: bool = True


class PromoCodeUpdate(BaseModel):
    discount_percent: float | None = Field(default=None, ge=0, le=100)
    discount_amount: float | None = Field(default=None, ge=0)
    max_uses: int | None = None
    is_active: bool | None = None


class PromoCodeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    discount_percent: float
    discount_amount: float
    max_uses: int | None
    used_count: int
    is_active: bool
    expires_at: datetime | None
    created_at: datetime


class PromoValidateRequest(BaseModel):
    code: str
    course_id: int


class PromoValidateResponse(BaseModel):
    code: str
    original_price: float
    discount: float
    final_price: float


class ReviewCreate(BaseModel):
    author_name: str = Field(min_length=2, max_length=255)
    author_role: str | None = None
    rating: int = Field(default=5, ge=1, le=5)
    text: str = Field(min_length=10)
    avatar_url: str | None = None
    is_published: bool = True


class ReviewUpdate(BaseModel):
    author_name: str | None = None
    author_role: str | None = None
    rating: int | None = Field(default=None, ge=1, le=5)
    text: str | None = None
    avatar_url: str | None = None
    is_published: bool | None = None


class ReviewRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    author_name: str
    author_role: str | None
    rating: int
    text: str
    avatar_url: str | None
    is_published: bool
    created_at: datetime


class FAQCreate(BaseModel):
    question: str = Field(min_length=5, max_length=500)
    answer: str = Field(min_length=5)
    order: int = 0
    is_published: bool = True


class FAQUpdate(BaseModel):
    question: str | None = Field(default=None, min_length=5, max_length=500)
    answer: str | None = None
    order: int | None = None
    is_published: bool | None = None


class FAQRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question: str
    answer: str
    order: int
    is_published: bool
    created_at: datetime
