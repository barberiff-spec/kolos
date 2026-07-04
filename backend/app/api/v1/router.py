from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    certificates,
    comments,
    content,
    courses,
    enrollments,
    lessons,
    modules,
    payments,
    progress,
    promos,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(courses.router)
api_router.include_router(modules.router)
api_router.include_router(lessons.router)
api_router.include_router(enrollments.router)
api_router.include_router(payments.router)
api_router.include_router(progress.router)
api_router.include_router(certificates.router)
api_router.include_router(comments.router)
api_router.include_router(promos.router)
api_router.include_router(content.router)
