from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TestOptionBase(BaseModel):
    text: str = Field(min_length=1, max_length=500)
    is_correct: bool = False
    order: int = 0


class TestOptionCreate(TestOptionBase):
    question_id: int


class TestOptionUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1, max_length=500)
    is_correct: bool | None = None
    order: int | None = None


class TestOptionRead(TestOptionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    question_id: int


class TestQuestionBase(BaseModel):
    text: str = Field(min_length=1)
    order: int = 0


class TestQuestionCreate(TestQuestionBase):
    test_id: int


class TestQuestionUpdate(BaseModel):
    text: str | None = Field(default=None, min_length=1)
    order: int | None = None


class TestQuestionRead(TestQuestionBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    test_id: int
    options: list[TestOptionRead] = []


class TestBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    passing_score: int = Field(default=70, ge=1, le=100)


class TestCreate(TestBase):
    module_id: int


class TestUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    passing_score: int | None = Field(default=None, ge=1, le=100)


class TestRead(TestBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    created_at: datetime
    questions: list[TestQuestionRead] = []
