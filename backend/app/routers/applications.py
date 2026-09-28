import os
import shutil
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from .. import models, schemas, auth_utils
from ..database import get_db

router = APIRouter(prefix="/applications", tags=["applications"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads", "resumes")
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.get("/", response_model=List[schemas.ApplicationResponse])
def list_applications(
    status_filter: Optional[str] = None,
    sort: Optional[str] = "date_applied",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    query = db.query(models.Application).filter(
        models.Application.user_id == current_user.id
    )
    if status_filter:
        query = query.filter(models.Application.status == status_filter)
    if sort == "date_applied":
        query = query.order_by(models.Application.date_applied.desc())
    return query.all()


@router.post("/", response_model=schemas.ApplicationResponse)
def create_application(
    app_in: schemas.ApplicationCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    application = models.Application(**app_in.model_dump(), user_id=current_user.id)
    db.add(application)
    db.commit()
    db.refresh(application)
    return application


def _get_owned_application(app_id: int, db: Session, current_user: models.User):
    application = (
        db.query(models.Application)
        .filter(
            models.Application.id == app_id,
            models.Application.user_id == current_user.id,
        )
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    return application


@router.get("/{app_id}", response_model=schemas.ApplicationResponse)
def get_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    return _get_owned_application(app_id, db, current_user)


@router.put("/{app_id}", response_model=schemas.ApplicationResponse)
def update_application(
    app_id: int,
    app_in: schemas.ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    application = _get_owned_application(app_id, db, current_user)
    for field, value in app_in.model_dump(exclude_unset=True).items():
        setattr(application, field, value)
    db.commit()
    db.refresh(application)
    return application


@router.delete("/{app_id}")
def delete_application(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    application = _get_owned_application(app_id, db, current_user)
    db.delete(application)
    db.commit()
    return {"detail": "Deleted successfully"}


# ---------- Resume upload ----------
ALLOWED_RESUME_EXTENSIONS = {".pdf", ".doc", ".docx"}
MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


@router.post("/{app_id}/upload-resume", response_model=schemas.ApplicationResponse)
def upload_resume(
    app_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    application = _get_owned_application(app_id, db, current_user)

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_RESUME_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only PDF/DOC/DOCX files are allowed")

    file.file.seek(0, os.SEEK_END)
    size = file.file.tell()
    file.file.seek(0)
    if size > MAX_RESUME_SIZE_BYTES:
        raise HTTPException(status_code=400, detail="File too large (max 5MB)")

    stored_name = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(UPLOAD_DIR, stored_name)
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    application.resume_filename = file.filename
    application.resume_version = stored_name
    db.commit()
    db.refresh(application)
    return application


# ---------- Interview rounds ----------
def _get_owned_round(app_id: int, round_id: int, db: Session, current_user: models.User):
    _get_owned_application(app_id, db, current_user)  # ownership check
    round_obj = (
        db.query(models.InterviewRound)
        .filter(
            models.InterviewRound.id == round_id,
            models.InterviewRound.application_id == app_id,
        )
        .first()
    )
    if not round_obj:
        raise HTTPException(status_code=404, detail="Interview round not found")
    return round_obj


@router.get("/{app_id}/rounds", response_model=List[schemas.InterviewRoundResponse])
def list_rounds(
    app_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    _get_owned_application(app_id, db, current_user)
    return (
        db.query(models.InterviewRound)
        .filter(models.InterviewRound.application_id == app_id)
        .order_by(models.InterviewRound.round_number)
        .all()
    )


@router.post("/{app_id}/rounds", response_model=schemas.InterviewRoundResponse)
def create_round(
    app_id: int,
    round_in: schemas.InterviewRoundCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    _get_owned_application(app_id, db, current_user)
    existing_count = (
        db.query(models.InterviewRound)
        .filter(models.InterviewRound.application_id == app_id)
        .count()
    )
    round_obj = models.InterviewRound(
        **round_in.model_dump(),
        application_id=app_id,
        round_number=existing_count + 1,
    )
    db.add(round_obj)
    db.commit()
    db.refresh(round_obj)
    return round_obj


@router.put("/{app_id}/rounds/{round_id}", response_model=schemas.InterviewRoundResponse)
def update_round(
    app_id: int,
    round_id: int,
    round_in: schemas.InterviewRoundUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    round_obj = _get_owned_round(app_id, round_id, db, current_user)
    for field, value in round_in.model_dump(exclude_unset=True).items():
        setattr(round_obj, field, value)
    db.commit()
    db.refresh(round_obj)
    return round_obj


@router.delete("/{app_id}/rounds/{round_id}")
def delete_round(
    app_id: int,
    round_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_utils.get_current_user),
):
    round_obj = _get_owned_round(app_id, round_id, db, current_user)
    db.delete(round_obj)
    db.commit()
    return {"detail": "Deleted successfully"}
