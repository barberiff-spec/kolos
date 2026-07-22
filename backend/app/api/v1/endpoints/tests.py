from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.models import Module, Test, TestOption, TestQuestion, User
from app.schemas.test import (
    TestCreate,
    TestOptionCreate,
    TestOptionRead,
    TestOptionUpdate,
    TestQuestionCreate,
    TestQuestionRead,
    TestQuestionUpdate,
    TestRead,
    TestUpdate,
)

router = APIRouter(tags=["Tests"])


def _load_test(db: Session, test_id: int) -> Test:
    test = (
        db.query(Test)
        .options(joinedload(Test.questions).joinedload(TestQuestion.options))
        .filter(Test.id == test_id)
        .first()
    )
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    return test


# ---- Tests ------------------------------------------------------------------


@router.get("/tests", response_model=list[TestRead])
def list_tests(module_id: int | None = None, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    query = db.query(Test).options(joinedload(Test.questions).joinedload(TestQuestion.options))
    if module_id:
        query = query.filter(Test.module_id == module_id)
    return query.all()


@router.get("/tests/{test_id}", response_model=TestRead)
def get_test(test_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    return _load_test(db, test_id)


@router.post("/tests", response_model=TestRead, status_code=status.HTTP_201_CREATED)
def create_test(payload: TestCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    if not db.get(Module, payload.module_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Module not found")
    if db.query(Test).filter(Test.module_id == payload.module_id).first():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Module already has a test")

    test = Test(**payload.model_dump())
    db.add(test)
    db.commit()
    db.refresh(test)
    return test


@router.patch("/tests/{test_id}", response_model=TestRead)
def update_test(
    test_id: int, payload: TestUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    test = db.get(Test, test_id)
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(test, key, value)

    db.commit()
    return _load_test(db, test_id)


@router.delete("/tests/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(test_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    test = db.get(Test, test_id)
    if not test:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")
    db.delete(test)
    db.commit()


# ---- Questions ----------------------------------------------------------------


@router.post("/test-questions", response_model=TestQuestionRead, status_code=status.HTTP_201_CREATED)
def create_question(
    payload: TestQuestionCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    if not db.get(Test, payload.test_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Test not found")

    question = TestQuestion(**payload.model_dump())
    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@router.patch("/test-questions/{question_id}", response_model=TestQuestionRead)
def update_question(
    question_id: int,
    payload: TestQuestionUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    question = db.get(TestQuestion, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, key, value)

    db.commit()
    db.refresh(question)
    return question


@router.delete("/test-questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(question_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    question = db.get(TestQuestion, question_id)
    if not question:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")
    db.delete(question)
    db.commit()


# ---- Options ------------------------------------------------------------------


@router.post("/test-options", response_model=TestOptionRead, status_code=status.HTTP_201_CREATED)
def create_option(payload: TestOptionCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    if not db.get(TestQuestion, payload.question_id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Question not found")

    option = TestOption(**payload.model_dump())
    db.add(option)
    db.commit()
    db.refresh(option)
    return option


@router.patch("/test-options/{option_id}", response_model=TestOptionRead)
def update_option(
    option_id: int, payload: TestOptionUpdate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)
):
    option = db.get(TestOption, option_id)
    if not option:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Option not found")

    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(option, key, value)

    db.commit()
    db.refresh(option)
    return option


@router.delete("/test-options/{option_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_option(option_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    option = db.get(TestOption, option_id)
    if not option:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Option not found")
    db.delete(option)
    db.commit()
