import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from app.models.match import MatchType, TossDecision
from app.schemas.team import TeamOut


class MatchCreate(BaseModel):
    team_a_id: uuid.UUID
    team_b_id: uuid.UUID
    match_type: MatchType
    overs_limit: int
    venue: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    tournament_id: Optional[uuid.UUID] = None


class MatchUpdate(BaseModel):
    venue: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    overs_limit: Optional[int] = None
    scorer_id: Optional[uuid.UUID] = None


class TossRequest(BaseModel):
    toss_winner_team_id: uuid.UUID
    toss_decision: TossDecision


class StartMatchRequest(BaseModel):
    striker_id: uuid.UUID
    non_striker_id: uuid.UUID
    bowler_id: uuid.UUID


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tournament_id: Optional[uuid.UUID] = None
    team_a: TeamOut
    team_b: TeamOut
    match_type: str
    overs_limit: int
    venue: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    status: str
    toss_winner_team_id: Optional[uuid.UUID] = None
    toss_decision: Optional[str] = None
    winner_team_id: Optional[uuid.UUID] = None
    result_summary: Optional[str] = None
    created_by: uuid.UUID
    scorer_id: Optional[uuid.UUID] = None
    created_at: datetime
