import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.player import PlayerRole


class PlayerCreate(BaseModel):
    full_name: str
    role: PlayerRole
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    profile_photo_url: Optional[str] = None
    user_id: Optional[uuid.UUID] = None


class PlayerUpdate(BaseModel):
    full_name: Optional[str] = None
    role: Optional[PlayerRole] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    profile_photo_url: Optional[str] = None


class PlayerOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: Optional[uuid.UUID] = None
    full_name: str
    role: str
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    profile_photo_url: Optional[str] = None
    created_at: datetime


class PlayerCareerStatsOut(BaseModel):
    player_id: uuid.UUID
    matches_played: int
    runs_scored: int
    balls_faced: int
    fours: int
    sixes: int
    batting_average: Optional[float] = None
    strike_rate: Optional[float] = None
    wickets_taken: int
    balls_bowled: int
    runs_conceded: int
    bowling_average: Optional[float] = None
    economy_rate: Optional[float] = None
