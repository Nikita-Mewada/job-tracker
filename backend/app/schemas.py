from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from .models import StatusEnum, RoundStatusEnum


# ---------- Auth ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ---------- Applications ----------
class ApplicationBase(BaseModel):
    company_name: str
    role_title: str
    job_link: Optional[str] = None
    status: StatusEnum = StatusEnum.applied
    notes: Optional[str] = None
    resume_version: Optional[str] = None
    location: Optional[str] = None
    ctc_offered: Optional[str] = None
    ctc_expected: Optional[str] = None
    skills_asked: Optional[str] = None  # comma-separated, e.g. "Python, React, SQL"
    next_step_date: Optional[datetime] = None


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    job_link: Optional[str] = None
    status: Optional[StatusEnum] = None
    notes: Optional[str] = None
    resume_version: Optional[str] = None
    location: Optional[str] = None
    ctc_offered: Optional[str] = None
    ctc_expected: Optional[str] = None
    skills_asked: Optional[str] = None
    next_step_date: Optional[datetime] = None


class ApplicationResponse(ApplicationBase):
    id: int
    date_applied: datetime
    last_update: datetime
    resume_filename: Optional[str] = None

    class Config:
        from_attributes = True


# ---------- Interview rounds ----------
class InterviewRoundBase(BaseModel):
    round_name: str
    round_date: Optional[datetime] = None
    status: RoundStatusEnum = RoundStatusEnum.scheduled
    notes: Optional[str] = None


class InterviewRoundCreate(InterviewRoundBase):
    pass


class InterviewRoundUpdate(BaseModel):
    round_name: Optional[str] = None
    round_date: Optional[datetime] = None
    status: Optional[RoundStatusEnum] = None
    notes: Optional[str] = None


class InterviewRoundResponse(InterviewRoundBase):
    id: int
    round_number: int
    application_id: int

    class Config:
        from_attributes = True


# ---------- Stats ----------
class StatsSummary(BaseModel):
    total: int
    applied: int
    oa: int
    interview: int
    offer: int
    rejected: int


# ---------- AI JD parser ----------
class JDParseRequest(BaseModel):
    jd_text: str


class JDParseResponse(BaseModel):
    company_name: Optional[str] = None
    role_title: Optional[str] = None
    key_skills: List[str] = []
