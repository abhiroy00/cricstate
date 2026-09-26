from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import require_roles
from app.api.v1.users import ADMIN_ROLES
from app.core.database import get_db
from app.models.engagement import ContentReport, ReportStatus
from app.models.match import Match
from app.models.membership import Membership, MembershipStatus
from app.models.player import Player
from app.models.store import Order
from app.models.team import Team
from app.models.tournament import Tournament
from app.models.user import User
from app.schemas.common import success_response

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get(
    "/overview",
    dependencies=[Depends(require_roles(*ADMIN_ROLES))],
)
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    """Backs admin Dashboard cards - all counts are real DB queries now."""
    async def count(model, *filters) -> int:
        q = select(func.count()).select_from(model)
        for f in filters:
            q = q.where(f)
        return (await db.execute(q)).scalar_one()

    total_users = await count(User)
    active_users = await count(
        User, User.is_active.is_(True), User.is_blocked.is_(False), User.is_suspended.is_(False)
    )
    day_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    new_users_today = await count(User, User.created_at >= day_start)
    pro_users = await count(Membership, Membership.status == MembershipStatus.ACTIVE.value)
    total_matches = await count(Match)
    live_matches = await count(Match, Match.status == "LIVE")
    upcoming_matches = await count(Match, Match.status == "SCHEDULED")
    completed_matches = await count(Match, Match.status == "COMPLETED")
    total_tournaments = await count(Tournament)
    total_teams = await count(Team)
    total_players = await count(Player)
    orders_today = await count(Order, Order.created_at >= day_start)
    revenue = (
        await db.execute(select(func.coalesce(func.sum(Order.total), 0)).select_from(Order))
    ).scalar_one()
    reported_content = await count(
        ContentReport, ContentReport.status == ReportStatus.OPEN.value
    )

    return success_response(
        {
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_users_today,
            "pro_users": pro_users,
            "total_matches": total_matches,
            "live_matches": live_matches,
            "upcoming_matches": upcoming_matches,
            "completed_matches": completed_matches,
            "total_tournaments": total_tournaments,
            "total_teams": total_teams,
            "total_players": total_players,
            "live_viewers": 0,  # placeholder until streaming presence
            "orders_today": orders_today,
            "revenue": revenue,
            "reported_content": reported_content,
        }
    )
