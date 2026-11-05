from __future__ import annotations

from datetime import datetime
import uuid

from sqlalchemy import (
    ForeignKey,
    Index,
    String,
    Text,
    UniqueConstraint,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, Timestamped, UUIDPrimaryKey


class Achievement(UUIDPrimaryKey, Timestamped, Base):
    __tablename__ = "achievements"
    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "achievement_key",
            name="uq_achievements_user_key",
        ),
        Index("ix_achievements_user_earned", "user_id", "earned_at"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    achievement_key: Mapped[str] = mapped_column(String(120), nullable=False)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    earned_at: Mapped[datetime] = mapped_column(
        nullable=False,
        server_default=func.now(),
    )

    user: Mapped[User] = relationship(back_populates="achievements")
