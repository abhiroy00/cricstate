import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.tournament import TournamentFormat
from app.schemas.team import TeamOut


class TournamentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    format: TournamentFormat
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None


class TournamentUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    status: Optional[str] = None


class TournamentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    description: Optional[str] = None
    format: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    logo_url: Optional[str] = None
    organizer_id: uuid.UUID
    status: str
    team_count: int = 0
    created_at: datetime


class TournamentTeamOut(BaseModel):
    team: TeamOut
    status: str
    registered_at: datetime


class RegisterTeamRequest(BaseModel):
    team_id: uuid.UUID


class UpdateRegistrationRequest(BaseModel):
    status: str  # APPROVED / REJECTED


class PointsTableRow(BaseModel):
    team: TeamOut
    played: int
    won: int
    lost: int
    tied: int
    points: int
    net_run_rate: float
