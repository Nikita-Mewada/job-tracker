from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/summary", response_model=schemas.StatsSummary)
def get_summary(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    rows = (
        db.query(models.Application.status, func.count(models.Application.id))
        .filter(models.Application.user_id == current_user.id)
        .group_by(models.Application.status)
        .all()
    )
    counts = {status.value if hasattr(status, "value") else status: count for status, count in rows}

    return schemas.StatsSummary(
        total=sum(counts.values()),
        applied=counts.get("applied", 0),
        oa=counts.get("oa", 0),
        interview=counts.get("interview", 0),
        offer=counts.get("offer", 0),
        rejected=counts.get("rejected", 0),
    )


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    rows = (
        db.query(models.Application.status, func.count(models.Application.id))
        .filter(models.Application.user_id == current_user.id)
        .group_by(models.Application.status)
        .all()
    )
    counts = {status.value if hasattr(status, "value") else status: count for status, count in rows}
    total = sum(counts.values())
    interview_plus = counts.get("interview", 0) + counts.get("offer", 0)
    offers = counts.get("offer", 0)

    def pct(numerator, denominator):
        return round((numerator / denominator) * 100, 1) if denominator else 0.0

    return {
        "total_applications": total,
        "interview_rate": pct(interview_plus, total),
        "offer_rate": pct(offers, total),
        "offer_rate_from_interviews": pct(offers, interview_plus),
    }
