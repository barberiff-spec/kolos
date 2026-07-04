from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class VideoType(str, Enum):
    YOUTUBE = "youtube"
    VK = "vk"
    NONE = "none"


class LessonBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    content: str | None = None
    video_url: str | None = None
    video_type: VideoType = VideoType.NONE
    order: int = 0
    duration_minutes: int = 0


class LessonCreate(LessonBase):
    module_id: int


class LessonUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    content: str | None = None
    video_url: str | None = None
    video_type: VideoType | None = None
    order: int | None = None
    duration_minutes: int | None = None
    module_id: int | None = None


class LessonRead(LessonBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    module_id: int
    created_at: datetime
    completed: bool | None = None


class ModuleBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    order: int = 0


class ModuleCreate(ModuleBase):
    course_id: int


class ModuleUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    order: int | None = None
    course_id: int | None = None


class ModuleRead(ModuleBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    course_id: int
    created_at: datetime
    lessons: list[LessonRead] = []


class CourseBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    short_description: str | None = Field(default=None, max_length=500)
    price: float = Field(ge=0)
    image_url: str | None = None
    is_published: bool = False


class CourseCreate(CourseBase):
    slug: str | None = None
    instructor_id: int | None = None


class CourseUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = None
    description: str | None = None
    short_description: str | None = None
    price: float | None = Field(default=None, ge=0)
    image_url: str | None = None
    is_published: bool | None = None
    instructor_id: int | None = None


class CourseRead(CourseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    instructor_id: int
    created_at: datetime
    updated_at: datetime
    modules: list[ModuleRead] = []
    lessons_count: int | None = None
    is_enrolled: bool | None = None
    progress_percent: float | None = None


class CourseListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    slug: str
    short_description: str | None
    price: float
    image_url: str | None
    is_published: bool
    lessons_count: int = 0
