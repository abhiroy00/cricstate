import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin, UUIDPkMixin


class StreamStatus(str, Enum):
    SCHEDULED = "SCHEDULED"
    LIVE = "LIVE"
    OFFLINE = "OFFLINE"
    ENDED = "ENDED"


class Stream(UUIDPkMixin, TimestampMixin, Base):
    """Live-video metadata only — FastAPI never touches video bytes.

    The pipeline (Camera/OBS → RTMP ingest → transcoder → HLS → CDN) runs
    outside this service; here we record which match is streaming, where the
    HLS playlist lives (playback_url) and how many are watching.
    One stream per match.
    """

    __tablename__ = "streams"

    match_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("matches.id", ondelete="CASCADE"), unique=True, index=True, nullable=False
    )
    title: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default=StreamStatus.SCHEDULED.value, index=True
    )
    # HLS playlist URL served by the CDN (set once the pipeline is live).
    playback_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    # Ingest secret for OBS/mediamtx — returned once at creation, never listed.
    stream_key: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    stream_key_hint: Mapped[Optional[str]] = mapped_column(String(12), nullable=True)
    viewer_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
