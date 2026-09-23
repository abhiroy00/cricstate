import uuid
from enum import Enum
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.delivery import Delivery
    from app.models.match import Match


class InningsStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"


class Innings(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "innings"

    match_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), nullable=False
    )
    innings_number: Mapped[int] = mapped_column(Integer, nullable=False)
    batting_team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )
    bowling_team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False
    )

    total_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    total_wickets: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    legal_balls_bowled: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    target: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=InningsStatus.IN_PROGRESS.value
    )

    current_striker_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("players.id", ondelete="SET NULL"), nullable=True
    )
    current_non_striker_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("players.id", ondelete="SET NULL"), nullable=True
    )
    current_bowler_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("players.id", ondelete="SET NULL"), nullable=True
    )

    match: Mapped["Match"] = relationship(back_populates="innings")
    deliveries: Mapped[List["Delivery"]] = relationship(
        back_populates="innings",
        cascade="all, delete-orphan",
        order_by="Delivery.created_at",
    )

    @property
    def overs_display(self) -> str:
        return f"{self.legal_balls_bowled // 6}.{self.legal_balls_bowled % 6}"
