from __future__ import annotations

from datetime import datetime
from typing import Literal
import uuid

from sqlalchemy import (
    CheckConstraint,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, Timestamped, UUIDPrimaryKey

ProgressType = Literal["module", "algorithm", "data_structure"]


class LearningProgress(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "learning_progress"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "content_type",
            "content_key",
            name="uq_learning_progress_user_content",
        ),
        CheckConstraint(
            "content_type IN ('module', 'algorithm', 'data_structure')",
            name="ck_learning_progress_content_type",
        ),
        CheckConstraint(
            "status IN ('not_started', 'in_progress', 'completed')",
            name="ck_learning_progress_status",
        ),
        CheckConstraint(
            "progress_percent >= 0 AND progress_percent <= 100",
            name="ck_learning_progress_percent",
        ),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    content_type: Mapped[ProgressType] = mapped_column(String(32), nullable=False)
    content_key: Mapped[str] = mapped_column(String(160), nullable=False)
    status: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="not_started",
        server_default="not_started",
    )
    progress_percent: Mapped[float] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=0,
        server_default="0",
    )
    last_position: Mapped[int | None]
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="learning_progress")
