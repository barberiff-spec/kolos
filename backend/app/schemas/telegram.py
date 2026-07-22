from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TelegramLinkRequest(BaseModel):
    link_token: str
    telegram_id: int


class TelegramLinkResponse(BaseModel):
    user_id: int
    full_name: str
    email: str


class BotModuleLessonItem(BaseModel):
    id: int
    title: str
    order: int
    completed: bool


class BotModuleItem(BaseModel):
    id: int
    title: str
    order: int
    status: str  # "done" | "current" | "locked"
    lessons: list[BotModuleLessonItem]


class BotLessonRead(BaseModel):
    id: int
    module_id: int
    title: str
    content: str | None
    video_url: str | None
    duration_minutes: int
    completed: bool


class BotProgressResponse(BaseModel):
    course_id: int | None
    passed_modules: int
    total_modules: int
    streak_days: int
    submissions_count: int
    avg_score: float | None


class BotAccessResponse(BaseModel):
    tier: str  # "free" | "pro"
    daily_submission_limit: int | None  # None = безлимит


class SubmissionScores(BaseModel):
    fade: int = Field(ge=1, le=10)
    symmetry: int = Field(ge=1, le=10)
    lineup: int = Field(ge=1, le=10)
    blend: int = Field(ge=1, le=10)
    cleanliness: int = Field(ge=1, le=10)
    shape: int = Field(ge=1, le=10)


class SubmissionIssue(BaseModel):
    what: str
    why: str
    fix: str


class SubmissionCreate(BaseModel):
    telegram_id: int
    lesson_id: int | None = None
    photo_url: str
    scores: SubmissionScores
    overall: float = Field(ge=1, le=10)
    strengths: list[str]
    issues: list[SubmissionIssue]
    priority_next_step: str
    verdict: str


class SubmissionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    lesson_id: int | None
    photo_url: str
    scores: dict
    overall: float
    strengths: list[str]
    issues: list[dict]
    priority_next_step: str
    verdict: str
    created_at: datetime


class PhotoUploadResponse(BaseModel):
    url: str


# ---- Тесты (бот-сторона: без is_correct — правильный ответ ученику не отдаём) ----


class BotTestOption(BaseModel):
    id: int
    text: str
    order: int


class BotTestQuestion(BaseModel):
    id: int
    text: str
    order: int
    options: list[BotTestOption]


class BotTestRead(BaseModel):
    id: int
    module_id: int
    title: str
    passing_score: int
    questions: list[BotTestQuestion]


class BotTestAnswer(BaseModel):
    question_id: int
    option_id: int


class BotTestSubmit(BaseModel):
    telegram_id: int
    answers: list[BotTestAnswer]


class BotTestResultItem(BaseModel):
    question_id: int
    question_text: str
    selected_option_id: int
    correct_option_id: int
    is_correct: bool


class BotTestSubmitResponse(BaseModel):
    score: int
    passed: bool
    passing_score: int
    results: list[BotTestResultItem]


class BotDailyTip(BaseModel):
    id: int
    text: str
