import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StreamCreate(BaseModel):
    match_id: uuid.UUID
    title: Optional[str] = Field(default=None, max_length=200)
    notes: Optional[str] = None


class StreamUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    status: Optional[str] = None
    playback_url: Optional[str] = Field(default=None, max_length=500)
    viewer_count: Optional[int] = Field(default=None, ge=0)
    notes: Optional[str] = None


class HeartbeatRequest(BaseModel):
    viewer_count: int = Field(ge=0)


class StreamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    match_id: uuid.UUID
    title: Optional[str] = None
    status: str
    playback_url: Optional[str] = None
    stream_key_hint: Optional[str] = None
    viewer_count: int
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime


class StreamCreateOut(StreamOut):
    # Returned once at creation so the scorer can configure OBS/mediamtx.
    stream_key: Optional[str] = None
