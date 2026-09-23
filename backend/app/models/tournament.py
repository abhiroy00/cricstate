import uuid
from datetime import date, datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.team import Team


class TournamentFormat(str, Enum):
    KNOCKOUT = "KNOCKOUT"
    LEAGUE = "LEAGUE"


class TournamentStatus(str, Enum):
    UPCOMING = "UPCOMING"
    ONGOING = "ONGOING"
    COMPLETED = "COMPLETED"


class RegistrationStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class Tournament(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "tournaments"

    name: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    format: Mapped[str] = mapped_column(String(20), nullable=False)
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    end_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    logo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    organizer_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=TournamentStatus.UPCOMING.value
    )

    team_links: Mapped[List["TournamentTeam"]] = relationship(
        back_populates="tournament", cascade="all, delete-orphan", lazy="selectin"
    )


class TournamentTeam(Base):
    __tablename__ = "tournament_teams"

    tournament_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tournaments.id", ondelete="CASCADE"), primary_key=True
    )
    team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=RegistrationStatus.PENDING.value
    )
    registered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    tournament: Mapped["Tournament"] = relationship(back_populates="team_links")
    team: Mapped["Team"] = relationship(lazy="selectin")
