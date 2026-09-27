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
from app.websocket.manager import broadcast

router = APIRouter(prefix="/scoring", tags=["scoring"])


async def _push_live(match_id: uuid.UUID, db: AsyncSession):
    """Best-effort push - WS failures must never break the HTTP response.

    Returns the computed live state so mutation responses can embed it and the
    client can update in a single round trip instead of a follow-up GET /live.
    """
    try:
        state = await ScoringService(db).get_live_state(match_id)
        await broadcast(
            str(match_id),
            {
                "type": "live_update",
                "match_id": str(match_id),
                "live": state.model_dump(mode="json"),
            },
        )
        return state
    except Exception:
        return None


def _with_live(data: dict, live) -> dict:
    """Attach the live state to an existing response payload. The original
    fields stay at the top level, so older clients keep working unchanged."""
    if live is not None:
        data["live"] = live.model_dump(mode="json")
    return data


@router.post("/{match_id}/deliveries")
async def record_delivery(
    match_id: uuid.UUID,
    payload: DeliveryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    delivery = await service.record_delivery(current_user, match_id, payload)
    live = await _push_live(match_id, db)
    data = _with_live(DeliveryOut.model_validate(delivery).model_dump(), live)
    return success_response(data, message="Delivery recorded")


@router.delete("/{match_id}/deliveries/last")
async def undo_last_delivery(
    match_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    await service.undo_last_delivery(current_user, match_id)
    live = await _push_live(match_id, db)
    return success_response(_with_live({}, live), message="Last delivery undone")


@router.post("/{match_id}/next-over")
async def select_next_bowler(
    match_id: uuid.UUID,
    payload: NewBowlerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    innings = await service.select_next_bowler(current_user, match_id, payload)
    live = await _push_live(match_id, db)
    data = _with_live(InningsOut.model_validate(innings).model_dump(), live)
    return success_response(data, message="Bowler selected")


@router.post("/{match_id}/next-innings")
async def start_next_innings(
    match_id: uuid.UUID,
    payload: StartMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    innings = await service.start_next_innings(current_user, match_id, payload)
    live = await _push_live(match_id, db)
    data = _with_live(InningsOut.model_validate(innings).model_dump(), live)
    return success_response(data, message="Next innings started")


@router.post("/{match_id}/end")
async def end_match(
    match_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ScoringService(db)
    match: Match = await service.end_match(current_user, match_id)
    response = success_response(MatchOut.model_validate(match).model_dump(), message="Match ended")
    await _push_live(match_id, db)
    return response


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
