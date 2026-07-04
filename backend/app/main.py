from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.services.seed import seed_database

settings = get_settings()


def custom_openapi(app: FastAPI):
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=settings.app_name,
        version=settings.app_version,
        description="""
## KOLOS API

Premium barber education platform.

### Features
- JWT authentication with httpOnly cookies + refresh tokens
- Role-based access (admin / student)
- Full CRUD for courses, modules, lessons
- Mock payments (YooKassa-ready)
- Lesson progress tracking
        """.strip(),
        routes=app.routes,
    )
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    app.openapi_schema = openapi_schema
    return app.openapi_schema


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        docs_url="/docs",
        redoc_url="/redoc",
        openapi_url="/openapi.json",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.get("/health", tags=["Health"])
    def health():
        return {"status": "ok", "app": settings.app_name, "version": settings.app_version}

    @app.on_event("startup")
    def on_startup():
        seed_database()

    app.openapi = lambda: custom_openapi(app)
    return app


app = create_app()
