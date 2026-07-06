import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, Request, UploadFile, status

from app.core.config import get_settings
from app.core.deps import get_current_admin
from app.models import User

router = APIRouter(prefix="/uploads", tags=["Uploads"])

ALLOWED_TYPES = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB


@router.post("/course-image")
async def upload_course_image(
    request: Request,
    file: UploadFile = File(...),
    _: User = Depends(get_current_admin),
):
    ext = ALLOWED_TYPES.get(file.content_type or "")
    if not ext:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Разрешены только изображения JPEG, PNG или WebP",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Файл слишком большой (максимум 5 МБ)",
        )

    settings = get_settings()
    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{ext}"
    (upload_dir / filename).write_bytes(contents)

    host = request.headers.get("host", request.url.hostname or "")
    scheme = "http" if ("localhost" in host or "127.0.0.1" in host) else "https"
    return {"url": f"{scheme}://{host}/uploads/{filename}"}
