import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.models.delivery import ExtraType, WicketType
from app.schemas.player import PlayerOut


class DeliveryCreate(BaseModel):
    runs_off_bat: int = Field(default=0, ge=0, le=6)
    extra_type: ExtraType = ExtraType.NONE
    extra_runs: int = Field(default=0, ge=0)
    is_wicket: bool = False
    wicket_type: Optional[WicketType] = None
    out_player_id: Optional[uuid.UUID] = None
    fielder_id: Optional[uuid.UUID] = None
    # Required only when a wicket falls and a new batsman comes in mid-over:
    next_batsman_id: Optional[uuid.UUID] = None


class DeliveryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    over_number: int
    ball_in_over: int
    striker_id: uuid.UUID
    non_striker_id: uuid.UUID
    bowler_id: uuid.UUID
    runs_off_bat: int
    extra_type: str
    extra_runs: int
    is_legal_ball: bool
    is_wicket: bool
    wicket_type: Optional[str] = None
    out_player_id: Optional[uuid.UUID] = None
    fielder_id: Optional[uuid.UUID] = None
    created_at: datetime


class NewBowlerRequest(BaseModel):
    bowler_id: uuid.UUID


class InningsOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    match_id: uuid.UUID
    innings_number: int
    batting_team_id: uuid.UUID
    bowling_team_id: uuid.UUID
    total_runs: int
    total_wickets: int
    legal_balls_bowled: int
    overs_display: str
    target: Optional[int] = None
    status: str
    current_striker_id: Optional[uuid.UUID] = None
    current_non_striker_id: Optional[uuid.UUID] = None
    current_bowler_id: Optional[uuid.UUID] = None


class LiveStateOut(BaseModel):
    match_id: uuid.UUID
    match_status: str
    innings: Optional[InningsOut] = None
    striker: Optional[PlayerOut] = None
    striker_runs: int = 0
    striker_balls: int = 0
    non_striker: Optional[PlayerOut] = None
    non_striker_runs: int = 0
    non_striker_balls: int = 0
    bowler: Optional[PlayerOut] = None
    bowler_wickets: int = 0
    bowler_runs_conceded: int = 0
    bowler_overs: str = "0.0"
    current_over_balls: List[str] = []
    run_rate: float = 0.0
    required_run_rate: Optional[float] = None
    runs_needed: Optional[int] = None
    balls_remaining: Optional[int] = None
    recent_deliveries: List[DeliveryOut] = []


class BattingCardEntry(BaseModel):
    player: PlayerOut
    runs: int
    balls_faced: int
    fours: int
    sixes: int
    strike_rate: float
    is_out: bool
    dismissal: Optional[str] = None


class BowlingCardEntry(BaseModel):
    player: PlayerOut
    overs: str
    balls_bowled: int
    runs_conceded: int
    wickets: int
    economy: float


class FallOfWicketEntry(BaseModel):
    wicket_number: int
    score_at_fall: int
    over_at_fall: str
    player: PlayerOut


class InningsScorecard(BaseModel):
    innings: InningsOut
    batting: List[BattingCardEntry]
    bowling: List[BowlingCardEntry]
    fall_of_wickets: List[FallOfWicketEntry]


class MatchScorecardOut(BaseModel):
    match_id: uuid.UUID
    status: str
    result_summary: Optional[str] = None
    innings: List[InningsScorecard]
