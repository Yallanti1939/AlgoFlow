from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import (
    CheckConstraint,
    ForeignKey,
    Index,
    JSON,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, Timestamped, UUIDPrimaryKey


class Problem(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "problems"
    __table_args__ = (
        UniqueConstraint("slug", name="uq_problems_slug"),
        CheckConstraint(
            "difficulty IN ('easy', 'medium', 'hard')",
            name="ck_problems_difficulty",
        ),
        Index("ix_problems_difficulty", "difficulty"),
        Index("ix_problems_category", "category"),
    )

    slug: Mapped[str] = mapped_column(String(160), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(16), nullable=False)
    category: Mapped[str | None] = mapped_column(String(100))
    constraints: Mapped[str | None] = mapped_column(Text)
    examples: Mapped[list[dict[str, str]] | None] = mapped_column(JSON)
    starter_code: Mapped[str | None] = mapped_column(Text)
    is_published: Mapped[bool] = mapped_column(
        nullable=False,
        default=False,
        server_default="false",
    )

    submissions: Mapped[list[Submission]] = relationship(
        back_populates="problem",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    bookmarks: Mapped[list[Bookmark]] = relationship(
        back_populates="problem",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class Submission(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "submissions"
    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'accepted', 'wrong_answer', 'runtime_error', "
            "'time_limit_exceeded', 'compile_error', 'error')",
            name="ck_submissions_status",
        ),
        Index("ix_submissions_user_submitted", "user_id", "submitted_at"),
        Index("ix_submissions_problem_submitted", "problem_id", "submitted_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    problem_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
    )
    language: Mapped[str] = mapped_column(String(32), nullable=False)
    source_code: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(
        String(24),
        nullable=False,
        default="pending",
        server_default="pending",
    )
    result_details: Mapped[dict[str, object] | None] = mapped_column(JSON)
    execution_time_ms: Mapped[int | None]
    memory_used_kb: Mapped[int | None]
    submitted_at: Mapped[datetime] = mapped_column(
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped[User] = relationship(back_populates="submissions")
    problem: Mapped[Problem] = relationship(back_populates="submissions")


class Bookmark(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "bookmarks"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "problem_id",
            name="uq_bookmarks_user_problem",
        ),
        Index("ix_bookmarks_problem_id", "problem_id"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    problem_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("problems.id", ondelete="CASCADE"),
        nullable=False,
    )

    user: Mapped[User] = relationship(back_populates="bookmarks")
    problem: Mapped[Problem] = relationship(back_populates="bookmarks")
