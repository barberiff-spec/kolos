from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin
from app.db.session import get_db
from app.models import FAQ, Review, User
from app.schemas.extras import FAQCreate, FAQRead, FAQUpdate, ReviewCreate, ReviewRead, ReviewUpdate

router = APIRouter(prefix="/content", tags=["Content"])


@router.get("/reviews", response_model=list[ReviewRead])
def list_reviews(published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(Review)
    if published_only:
        query = query.filter(Review.is_published.is_(True))
    return query.order_by(Review.created_at.desc()).all()


@router.post("/reviews", response_model=ReviewRead, status_code=status.HTTP_201_CREATED)
def create_review(payload: ReviewCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    review = Review(**payload.model_dump())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.patch("/reviews/{review_id}", response_model=ReviewRead)
def update_review(
    review_id: int,
    payload: ReviewUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(review, key, value)
    db.commit()
    db.refresh(review)
    return review


@router.delete("/reviews/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(review_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    review = db.get(Review, review_id)
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    db.delete(review)
    db.commit()


@router.get("/faq", response_model=list[FAQRead])
def list_faq(published_only: bool = True, db: Session = Depends(get_db)):
    query = db.query(FAQ)
    if published_only:
        query = query.filter(FAQ.is_published.is_(True))
    return query.order_by(FAQ.order).all()


@router.post("/faq", response_model=FAQRead, status_code=status.HTTP_201_CREATED)
def create_faq(payload: FAQCreate, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    faq = FAQ(**payload.model_dump())
    db.add(faq)
    db.commit()
    db.refresh(faq)
    return faq


@router.patch("/faq/{faq_id}", response_model=FAQRead)
def update_faq(
    faq_id: int,
    payload: FAQUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    faq = db.get(FAQ, faq_id)
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(faq, key, value)
    db.commit()
    db.refresh(faq)
    return faq


@router.delete("/faq/{faq_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faq(faq_id: int, db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    faq = db.get(FAQ, faq_id)
    if not faq:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="FAQ not found")
    db.delete(faq)
    db.commit()
