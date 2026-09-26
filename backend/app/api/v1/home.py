from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user_optional
from app.core.database import get_db
from app.models.match import Match
from app.models.player import Player
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.user import User
from app.schemas.common import success_response
from app.services.match_service import MatchService
from app.services.player_service import PlayerService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/home", tags=["home"])


@router.get("/feed")
async def get_home_feed(
    db: AsyncSession = Depends(get_db),
    viewer: User | None = Depends(get_current_user_optional),
):
    """Backs web Home + mobile HomeScreen.

    Returns live / upcoming / recent matches plus suggested cricketers to
    follow. All list endpoints already exist - this is a single-call
    convenience wrapper so the UI in the screenshot can render without
    N+1 requests.
    """
    match_service = MatchService(db)
    live = await match_service.list_matches("LIVE", None, None, PageParams(limit=5, offset=0))
    upcoming = await match_service.list_matches(
        "SCHEDULED", None, None, PageParams(limit=5, offset=0)
    )
    recent = await match_service.list_matches(
        "COMPLETED", None, None, PageParams(limit=5, offset=0)
    )

    player_service = PlayerService(db)
    players_page = await player_service.list_players(None, None, PageParams(limit=10, offset=0))

    counts = {}
    for label, model in (
        ("live_matches", Match),
        ("teams", Team),
        ("tournaments", Tournament),
        ("players", Player),
    ):
        if label == "live_matches":
            q = select(func.count()).select_from(model).where(model.status == "LIVE")
        else:
            q = select(func.count()).select_from(model)
        counts[label] = (await db.execute(q)).scalar_one()

    _ = viewer  # feed is public for now; personalization (following) is a next step
    return success_response(
        {
            "live_matches": live["items"],
            "upcoming_matches": upcoming["items"],
            "recent_results": recent["items"],
            "suggested_cricketers": players_page["items"],
            "counts": counts,
        }
    )
