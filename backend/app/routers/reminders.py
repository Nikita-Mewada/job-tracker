from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, auth_utils
from ..database import get_db

router = APIRouter(prefix="/reminders", tags=["reminders"])


@router.get("/needs-followup")
def needs_followup(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    """
    Returns applications stuck in 'applied' status for 7+ days —
    surfaced as a follow-up badge on the dashboard.
    """
    cutoff = datetime.utcnow() - timedelta(days=7)
    stale = (
        db.query(models.Application)
        .filter(
            models.Application.user_id == current_user.id,
            models.Application.status == models.StatusEnum.applied,
            models.Application.last_update < cutoff,
        )
        .all()
    )
    return [{"id": a.id, "company_name": a.company_name, "role_title": a.role_title} for a in stale]


@router.get("/upcoming")
def upcoming_steps(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    """
    Returns applications with a next_step_date in the past (overdue)
    or within the next 3 days (upcoming) — powers the dashboard's Today panel.
    """
    now = datetime.utcnow()
    soon = now + timedelta(days=3)
    apps = (
        db.query(models.Application)
        .filter(
            models.Application.user_id == current_user.id,
            models.Application.next_step_date.isnot(None),
            models.Application.next_step_date <= soon,
        )
        .order_by(models.Application.next_step_date.asc())
        .all()
    )
    return [
        {
            "id": a.id,
            "company_name": a.company_name,
            "role_title": a.role_title,
            "next_step_date": a.next_step_date,
            "overdue": a.next_step_date < now,
        }
        for a in apps
    ]
