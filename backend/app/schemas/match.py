import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.match import BallType, MatchType, TossDecision
from app.schemas.player import PlayerOut
from app.schemas.team import TeamOut


class MatchCreate(BaseModel):
    team_a_id: uuid.UUID
    team_b_id: uuid.UUID
    match_type: MatchType
    overs_limit: int
    venue: Optional[str] = None
    city: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    tournament_id: Optional[uuid.UUID] = None
    # Start A Match setup fields
    ball_type: Optional[BallType] = None
    overs_per_bowler: Optional[int] = None
    powerplay_overs: Optional[int] = None
    pitch_type: Optional[str] = None
    wagon_wheel: bool = False
    officials: Optional[str] = None


class MatchUpdate(BaseModel):
    venue: Optional[str] = None
    city: Optional[str] = None
    scheduled_at: Optional[datetime] = None
    overs_limit: Optional[int] = None
    scorer_id: Optional[uuid.UUID] = None
    ball_type: Optional[BallType] = None
    overs_per_bowler: Optional[int] = None
    powerplay_overs: Optional[int] = None
    pitch_type: Optional[str] = None
    wagon_wheel: Optional[bool] = None
    officials: Optional[str] = None


class TossRequest(BaseModel):
    toss_winner_team_id: uuid.UUID
    toss_decision: TossDecision


class StartMatchRequest(BaseModel):
    striker_id: uuid.UUID
    non_striker_id: uuid.UUID
    bowler_id: uuid.UUID


class LineupSetRequest(BaseModel):
    team_id: uuid.UUID
    players: List[uuid.UUID] = Field(default_factory=list)
    is_playing_xi: bool = True


class LineupEntryOut(BaseModel):
    team_id: uuid.UUID
    is_playing_xi: bool
    player: PlayerOut


class MatchOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tournament_id: Optional[uuid.UUID] = None
    team_a: TeamOut
    team_b: TeamOut
    match_type: str
    overs_limit: int
    ball_type: Optional[str] = None
    overs_per_bowler: Optional[int] = None
    powerplay_overs: Optional[int] = None
    pitch_type: Optional[str] = None
    wagon_wheel: bool = False
    officials: Optional[str] = None
    city: Optional[str] = None
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
