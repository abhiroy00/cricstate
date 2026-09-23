import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.schemas.player import PlayerOut


class TeamCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    home_ground: Optional[str] = None


class TeamUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    home_ground: Optional[str] = None


class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    logo_url: Optional[str] = None
    home_ground: Optional[str] = None
    created_by: uuid.UUID
    player_count: int = 0
    created_at: datetime


class TeamRosterEntryOut(BaseModel):
    player: PlayerOut
    is_captain: bool
    is_vice_captain: bool
    jersey_number: Optional[int] = None


class AddPlayerToTeamRequest(BaseModel):
    player_id: Optional[uuid.UUID] = None
    # If player_id is omitted, a new roster-only player is created inline:
    new_player_full_name: Optional[str] = None
    new_player_role: Optional[str] = None
    jersey_number: Optional[int] = None


class UpdateTeamPlayerRequest(BaseModel):
    is_captain: Optional[bool] = None
    is_vice_captain: Optional[bool] = None
    jersey_number: Optional[int] = None
