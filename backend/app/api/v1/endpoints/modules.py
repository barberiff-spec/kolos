from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.models import Course, Module, User
from app.schemas.course import ModuleCreate, ModuleRead, ModuleUpdate

router = APIRouter(prefix="/modules", tags=["Modules"])


@router.get("", response_model=list[ModuleRead])
def list_modules(course_id: int | None = None, db: Session = Depends(get_db)):
    query = db.query(Module)
    if course_id:
        query = query.filter(Module.course_id == course_id)
    return query.order_by(Module.order).all()


@router.get("/{module_id}", response_model=ModuleRead)
def get_module(module_id: int, db: Session = Depends(get_db)):
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    return module


@router.post("", response_model=ModuleRead, status_code=status.HTTP_201_CREATED)
def create_module(payload: ModuleCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    if not db.get(Course, payload.course_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    module = Module(**payload.model_dump())
    db.add(module)
    db.commit()
    db.refresh(module)
    return module


@router.patch("/{module_id}", response_model=ModuleRead)
def update_module(
    module_id: int,
    payload: ModuleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")

    data = payload.model_dump(exclude_unset=True)
    if "course_id" in data and not db.get(Course, data["course_id"]):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Course not found")

    for key, value in data.items():
        setattr(module, key, value)

    db.commit()
    db.refresh(module)
    return module


@router.delete("/{module_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_module(module_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    module = db.get(Module, module_id)
    if not module:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    db.delete(module)
    db.commit()
