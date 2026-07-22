from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import Streak, User


def record_activity(db: Session, user: User) -> Streak:
    """Отмечает сегодняшнюю активность ученика и пересчитывает стрик.

    Значимые действия: прошёл урок, сдал фото на разбор. Дата — по UTC,
    без привязки к таймзоне ученика (MVP).
    """
    today = datetime.now(timezone.utc).date()

    streak = db.query(Streak).filter(Streak.user_id == user.id).first()
    if not streak:
        streak = Streak(user_id=user.id, current_streak=0, longest_streak=0)
        db.add(streak)

    if streak.last_active_date == today:
        return streak

    if streak.last_active_date == today - timedelta(days=1):
        streak.current_streak += 1
    else:
        streak.current_streak = 1

    streak.longest_streak = max(streak.longest_streak, streak.current_streak)
    streak.last_active_date = today

    db.commit()
    db.refresh(streak)
    return streak
