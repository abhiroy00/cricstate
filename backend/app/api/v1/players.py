import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.player import PlayerRole
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.player import PlayerCareerStatsOut, PlayerCreate, PlayerOut, PlayerUpdate
from app.services.player_service import PlayerService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/players", tags=["players"])


@router.post("")
async def create_player(
    payload: PlayerCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PlayerService(db)
    player = await service.create_player(current_user, payload)
    return success_response(PlayerOut.model_validate(player).model_dump(), message="Player created")


@router.get("")
async def list_players(
    search: str | None = Query(default=None),
    role: PlayerRole | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = PlayerService(db)
    page = await service.list_players(
        search, role.value if role else None, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.get("/me")
async def get_my_player(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PlayerService(db)
    player = await service.get_player_by_user_id_or_404(current_user.id)
    return success_response(PlayerOut.model_validate(player).model_dump())


@router.get("/{player_id}")
async def get_player(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = PlayerService(db)
    player = await service.get_player_or_404(player_id)
    return success_response(PlayerOut.model_validate(player).model_dump())


@router.get("/{player_id}/stats")
async def get_player_stats(player_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = PlayerService(db)
    stats = await service.get_career_stats(player_id)
    return success_response(stats.model_dump())


@router.patch("/{player_id}")
async def update_player(
    player_id: uuid.UUID,
    payload: PlayerUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = PlayerService(db)
    player = await service.update_player(current_user, player_id, payload)
    return success_response(PlayerOut.model_validate(player).model_dump(), message="Player updated")
