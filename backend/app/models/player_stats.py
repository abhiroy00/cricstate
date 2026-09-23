import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPkMixin


class PlayerMatchStats(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "player_stats"
    __table_args__ = (UniqueConstraint("player_id", "match_id", name="uq_player_match_stats"),)

    player_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), nullable=False, index=True
    )
    match_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True
    )

    runs_scored: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    balls_faced: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    fours: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    sixes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    was_out: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    wickets_taken: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    balls_bowled: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    runs_conceded: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    catches: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    stumpings: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    run_outs: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
