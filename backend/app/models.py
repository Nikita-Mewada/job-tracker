import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Enum, ForeignKey, Boolean
)
from sqlalchemy.orm import relationship
from .database import Base


class StatusEnum(str, enum.Enum):
    applied = "applied"
    oa = "oa"
    interview = "interview"
    offer = "offer"
    rejected = "rejected"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    applications = relationship(
        "Application", back_populates="owner", cascade="all, delete-orphan"
    )


class RoundStatusEnum(str, enum.Enum):
    scheduled = "scheduled"
    completed = "completed"
    passed = "passed"
    failed = "failed"


class Application(Base):
    __tablename__ = "applications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    company_name = Column(String(150), nullable=False)
    role_title = Column(String(150), nullable=False)
    job_link = Column(String(500), nullable=True)
    status = Column(Enum(StatusEnum), default=StatusEnum.applied)
    date_applied = Column(DateTime, default=datetime.utcnow)
    last_update = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes = Column(Text, nullable=True)
    resume_version = Column(String(255), nullable=True)

    # New fields
    location = Column(String(150), nullable=True)
    ctc_offered = Column(String(50), nullable=True)
    ctc_expected = Column(String(50), nullable=True)
    resume_filename = Column(String(255), nullable=True)
    skills_asked = Column(String(500), nullable=True)  # comma-separated tags
    next_step_date = Column(DateTime, nullable=True)

    owner = relationship("User", back_populates="applications")
    reminders = relationship(
        "Reminder", back_populates="application", cascade="all, delete-orphan"
    )
    interview_rounds = relationship(
        "InterviewRound",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="InterviewRound.round_number",
    )


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    remind_at = Column(DateTime, default=datetime.utcnow)
    message = Column(String(255), nullable=True)
    is_sent = Column(Boolean, default=False)

    application = relationship("Application", back_populates="reminders")


class InterviewRound(Base):
    __tablename__ = "interview_rounds"

    id = Column(Integer, primary_key=True, index=True)
    application_id = Column(Integer, ForeignKey("applications.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    round_name = Column(String(150), nullable=False)  # e.g. "Technical Round 1", "HR"
    round_date = Column(DateTime, nullable=True)
    status = Column(Enum(RoundStatusEnum), default=RoundStatusEnum.scheduled)
    notes = Column(Text, nullable=True)

    application = relationship("Application", back_populates="interview_rounds")
