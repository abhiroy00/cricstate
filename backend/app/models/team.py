import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.player import Player


class Team(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "teams"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    home_ground: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )

    player_links: Mapped[List["TeamPlayer"]] = relationship(
        back_populates="team", cascade="all, delete-orphan", lazy="selectin"
    )

    @property
    def player_count(self) -> int:
        return len(self.player_links)


class TeamPlayer(Base):
    __tablename__ = "team_players"

    team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), primary_key=True
    )
    is_captain: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_vice_captain: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    jersey_number: Mapped[Optional[int]] = mapped_column(nullable=True)
    joined_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    team: Mapped["Team"] = relationship(back_populates="player_links")
    player: Mapped["Player"] = relationship(back_populates="team_links", lazy="selectin")
