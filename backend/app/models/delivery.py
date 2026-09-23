import uuid
from datetime import datetime
from enum import Enum
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.innings import Innings


class ExtraType(str, Enum):
    NONE = "NONE"
    WIDE = "WIDE"
    NO_BALL = "NO_BALL"
    BYE = "BYE"
    LEG_BYE = "LEG_BYE"


class WicketType(str, Enum):
    BOWLED = "BOWLED"
    CAUGHT = "CAUGHT"
    LBW = "LBW"
    RUN_OUT = "RUN_OUT"
    STUMPED = "STUMPED"
    HIT_WICKET = "HIT_WICKET"
    OTHER = "OTHER"


class Delivery(UUIDPkMixin, Base):
    __tablename__ = "deliveries"

    innings_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("innings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    over_number: Mapped[int] = mapped_column(Integer, nullable=False)
    ball_in_over: Mapped[int] = mapped_column(Integer, nullable=False)

    striker_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    non_striker_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    bowler_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )

    runs_off_bat: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    extra_type: Mapped[str] = mapped_column(String(10), default=ExtraType.NONE.value, nullable=False)
    extra_runs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_legal_ball: Mapped[bool] = mapped_column(Boolean, nullable=False)

    is_wicket: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    wicket_type: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    out_player_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("players.id", ondelete="SET NULL"), nullable=True
    )
    fielder_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        ForeignKey("players.id", ondelete="SET NULL"), nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    innings: Mapped["Innings"] = relationship(back_populates="deliveries")

    @property
    def total_runs(self) -> int:
        return self.runs_off_bat + self.extra_runs
