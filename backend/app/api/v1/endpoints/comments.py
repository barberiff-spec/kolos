from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Comment, Lesson, Module, User
from app.schemas.extras import CommentAdminRead, CommentCreate, CommentRead
from app.services.course_service import user_has_enrollment

router = APIRouter(prefix="/comments", tags=["Comments"])


@router.get("", response_model=list[CommentAdminRead])
def list_all_comments(db: Session = Depends(get_db), _: User = Depends(get_current_admin)):
    comments = (
        db.query(Comment)
        .options(joinedload(Comment.lesson).joinedload(Lesson.module).joinedload(Module.course))
        .order_by(Comment.created_at.desc())
        .all()
    )
    result = []
    for c in comments:
        user = db.get(User, c.user_id)
        lesson = c.lesson
        module = lesson.module if lesson else None
        course = module.course if module else None
        result.append(
            CommentAdminRead(
                id=c.id,
                user_id=c.user_id,
                lesson_id=c.lesson_id,
                content=c.content,
                created_at=c.created_at,
                user_name=user.full_name if user else None,
                user_role=user.role.value if user else None,
                lesson_title=lesson.title if lesson else None,
                course_id=course.id if course else None,
                course_title=course.title if course else None,
            )
        )
    return result


@router.get("/lesson/{lesson_id}", response_model=list[CommentRead])
def list_lesson_comments(lesson_id: int, db: Session = Depends(get_db)):
    comments = (
        db.query(Comment)
        .filter(Comment.lesson_id == lesson_id)
        .order_by(Comment.created_at.asc())
        .all()
    )
    result = []
    for c in comments:
        user = db.get(User, c.user_id)
        result.append(
            CommentRead(
                id=c.id,
                user_id=c.user_id,
                lesson_id=c.lesson_id,
                content=c.content,
                created_at=c.created_at,
                user_name=user.full_name if user else None,
                user_role=user.role.value if user else None,
            )
        )
    return result


@router.post("/lesson/{lesson_id}", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
def create_comment(
    lesson_id: int,
    payload: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    lesson = db.query(Lesson).options(joinedload(Lesson.module)).filter(Lesson.id == lesson_id).first()
    if not lesson:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lesson not found")

    course_id = lesson.module.course_id
    if current_user.role.value != "admin" and not user_has_enrollment(db, current_user.id, course_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Enrollment required")

    comment = Comment(user_id=current_user.id, lesson_id=lesson_id, content=payload.content)
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return CommentRead(
        id=comment.id,
        user_id=comment.user_id,
        lesson_id=comment.lesson_id,
        content=comment.content,
        created_at=comment.created_at,
        user_name=current_user.full_name,
        user_role=current_user.role.value,
    )


@router.delete("/{comment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_comment(
    comment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    comment = db.get(Comment, comment_id)
    if not comment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Comment not found")
    if current_user.role.value != "admin" and comment.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    db.delete(comment)
    db.commit()
