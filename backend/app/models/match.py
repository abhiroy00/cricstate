import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.innings import Innings
    from app.models.team import Team


class MatchType(str, Enum):
    T20 = "T20"
    ODI = "ODI"
    CUSTOM = "CUSTOM"


class MatchStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    LIVE = "LIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class TossDecision(str, Enum):
    BAT = "BAT"
    BOWL = "BOWL"


class Match(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "matches"

    tournament_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("tournaments.id", ondelete="SET NULL"), nullable=True
    )
    team_a_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    team_b_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    match_type: Mapped[str] = mapped_column(String(20), nullable=False)
    overs_limit: Mapped[int] = mapped_column(Integer, nullable=False)
    venue: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    scheduled_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=MatchStatus.SCHEDULED.value
    )
    toss_winner_team_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    toss_decision: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    winner_team_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("teams.id", ondelete="SET NULL"), nullable=True
    )
    result_summary: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    scorer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )

    innings: Mapped[List["Innings"]] = relationship(
        back_populates="match",
        cascade="all, delete-orphan",
        order_by="Innings.innings_number",
        lazy="selectin",
    )
    team_a: Mapped["Team"] = relationship(foreign_keys=[team_a_id], lazy="selectin")
    team_b: Mapped["Team"] = relationship(foreign_keys=[team_b_id], lazy="selectin")
