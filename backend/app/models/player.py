import uuid
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.team import TeamPlayer
    from app.models.user import User


class PlayerRole(str, Enum):
    BATSMAN = "BATSMAN"
    BOWLER = "BOWLER"
    ALL_ROUNDER = "ALL_ROUNDER"
    WICKET_KEEPER = "WICKET_KEEPER"


class Player(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "players"

    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), unique=True, nullable=True
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    role: Mapped[str] = mapped_column(String(20), nullable=False)
    batting_style: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    bowling_style: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    profile_photo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    user: Mapped[Optional["User"]] = relationship(foreign_keys=[user_id])
    team_links: Mapped[List["TeamPlayer"]] = relationship(
        back_populates="player", cascade="all, delete-orphan"
    )
