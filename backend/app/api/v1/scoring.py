import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.match import Match
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.match import MatchOut, StartMatchRequest
from app.schemas.scoring import DeliveryCreate, DeliveryOut, InningsOut, LiveStateOut, MatchScorecardOut, NewBowlerRequest
from app.services.scoring_service import ScoringService

router = APIRouter(prefix="/scoring", tags=["scoring"])


@router.post("/{match_id}/deliveries")
async def record_delivery(
    match_id: uuid.UUID,
    payload: DeliveryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    delivery = await service.record_delivery(current_user, match_id, payload)
    return success_response(DeliveryOut.model_validate(delivery).model_dump(), message="Delivery recorded")


@router.delete("/{match_id}/deliveries/last")
async def undo_last_delivery(
    match_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    await service.undo_last_delivery(current_user, match_id)
    return success_response(None, message="Last delivery undone")


@router.post("/{match_id}/next-over")
async def select_next_bowler(
    match_id: uuid.UUID,
    payload: NewBowlerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    innings = await service.select_next_bowler(current_user, match_id, payload)
    return success_response(InningsOut.model_validate(innings).model_dump(), message="Bowler selected")


@router.post("/{match_id}/next-innings")
async def start_next_innings(
    match_id: uuid.UUID,
    payload: StartMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    innings = await service.start_next_innings(current_user, match_id, payload)
    return success_response(InningsOut.model_validate(innings).model_dump(), message="Next innings started")


@router.post("/{match_id}/end")
async def end_match(
    match_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    match: Match = await service.end_match(current_user, match_id)
    return success_response(MatchOut.model_validate(match).model_dump(), message="Match ended")


@router.get("/{match_id}/live")
async def get_live_state(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = ScoringService(db)
    state = await service.get_live_state(match_id)
    return success_response(state.model_dump())


@router.get("/{match_id}/scorecard")
async def get_scorecard(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = ScoringService(db)
    scorecard = await service.get_scorecard(match_id)
    return success_response(scorecard.model_dump())
