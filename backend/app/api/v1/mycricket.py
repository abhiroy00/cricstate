from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import success_response
from app.services.mycricket_service import MyCricketService

router = APIRouter(prefix="/mycricket", tags=["mycricket"])


@router.get("")
async def get_my_cricket(
    limit: int = Query(default=20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """One call for the mobile MyCricket home: the user's matches (Your /
    Played / Live), tournaments (organized / participating), teams, career
    stats and highlights."""
    service = MyCricketService(db)
    overview = await service.get_overview(current_user, limit=limit)
    return success_response(overview, message="MyCricket overview")
