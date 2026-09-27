import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.match import Match
    from app.models.player import Player


class MatchLineup(UUIDPkMixin, TimestampMixin, Base):
    """A player named in a team's squad for a specific match.

    Backs the Start A Match 'Select squad' step and the Playing XI
    confirmation. ``is_playing_xi`` distinguishes the confirmed XI from
    squad members who are only on standby.
    """

    __tablename__ = "match_lineups"
    __table_args__ = (
        UniqueConstraint("match_id", "team_id", "player_id", name="uq_match_lineup"),
    )

    match_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), nullable=False, index=True
    )
    team_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("teams.id", ondelete="CASCADE"), nullable=False, index=True
    )
    player_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("players.id", ondelete="CASCADE"), nullable=False
    )
    is_playing_xi: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=True, server_default="1"
    )

    match: Mapped["Match"] = relationship(back_populates="lineups")
    player: Mapped["Player"] = relationship(lazy="selectin")
