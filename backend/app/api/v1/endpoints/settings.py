from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.models import SiteSettings, User
from app.schemas.extras import SiteSettingsRead, SiteSettingsUpdate

router = APIRouter(prefix="/settings", tags=["Settings"])

SETTINGS_ID = 1


def _get_or_create(db: Session) -> SiteSettings:
    settings = db.get(SiteSettings, SETTINGS_ID)
    if not settings:
        settings = SiteSettings(id=SETTINGS_ID)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.get("", response_model=SiteSettingsRead)
def get_settings_values(db: Session = Depends(get_db)):
    return _get_or_create(db)


@router.put("", response_model=SiteSettingsRead)
def update_settings_values(
    payload: SiteSettingsUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    settings = _get_or_create(db)
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
