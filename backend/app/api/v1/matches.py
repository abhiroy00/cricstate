import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.match import MatchStatus
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.match import MatchCreate, MatchOut, MatchUpdate, StartMatchRequest, TossRequest
from app.schemas.scoring import InningsOut
from app.services.match_service import MatchService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/matches", tags=["matches"])


@router.post("")
async def create_match(
    payload: MatchCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MatchService(db)
    match = await service.create_match(current_user, payload)
    return success_response(MatchOut.model_validate(match).model_dump(), message="Match created")


@router.get("")
async def list_matches(
    status: MatchStatus | None = Query(default=None),
    team_id: uuid.UUID | None = Query(default=None),
    tournament_id: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = MatchService(db)
    page = await service.list_matches(
        status.value if status else None,
        team_id,
        tournament_id,
        PageParams(limit=limit, offset=offset),
    )
    return success_response(page)


@router.get("/{match_id}")
async def get_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = MatchService(db)
    match = await service.get_match_or_404(match_id)
    return success_response(MatchOut.model_validate(match).model_dump())


@router.patch("/{match_id}")
async def update_match(
    match_id: uuid.UUID,
    payload: MatchUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MatchService(db)
    match = await service.update_match(current_user, match_id, payload)
    return success_response(MatchOut.model_validate(match).model_dump(), message="Match updated")


@router.post("/{match_id}/toss")
async def record_toss(
    match_id: uuid.UUID,
    payload: TossRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MatchService(db)
    match = await service.record_toss(current_user, match_id, payload)
    return success_response(MatchOut.model_validate(match).model_dump(), message="Toss recorded")


@router.post("/{match_id}/start")
async def start_match(
    match_id: uuid.UUID,
    payload: StartMatchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MatchService(db)
    innings = await service.start_match(current_user, match_id, payload)
    return success_response(InningsOut.model_validate(innings).model_dump(), message="Match started")
