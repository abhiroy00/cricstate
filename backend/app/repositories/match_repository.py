import uuid
from typing import List, Optional, Tuple

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.match import Match


class MatchRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, match: Match) -> Match:
        self.db.add(match)
        await self.db.flush()
        return match

    async def get_by_id(self, match_id: uuid.UUID) -> Optional[Match]:
        result = await self.db.execute(select(Match).where(Match.id == match_id))
        return result.scalar_one_or_none()

    async def list(
        self,
        status: Optional[str],
        team_id: Optional[uuid.UUID],
        tournament_id: Optional[uuid.UUID],
        limit: int,
        offset: int,
    ) -> Tuple[List[Match], int]:
        query = select(Match)
        count_query = select(func.count()).select_from(Match)

        if status:
            query = query.where(Match.status == status)
            count_query = count_query.where(Match.status == status)
        if team_id:
            team_filter = or_(Match.team_a_id == team_id, Match.team_b_id == team_id)
            query = query.where(team_filter)
            count_query = count_query.where(team_filter)
        if tournament_id:
            query = query.where(Match.tournament_id == tournament_id)
            count_query = count_query.where(Match.tournament_id == tournament_id)

        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(
            query.order_by(Match.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all()), total

    async def list_for_user(
        self,
        user_id: uuid.UUID,
        team_ids: List[uuid.UUID],
        limit: int,
        offset: int = 0,
    ) -> Tuple[List[Match], int]:
        """Matches the user is attached to: created/scored by them, or featuring
        one of their teams. Drives the MyCricket "Your" / "Played" tabs."""
        conditions = [Match.created_by == user_id, Match.scorer_id == user_id]
        if team_ids:
            conditions.append(Match.team_a_id.in_(team_ids))
            conditions.append(Match.team_b_id.in_(team_ids))
        user_filter = or_(*conditions)

        count_query = select(func.count()).select_from(Match).where(user_filter)
        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(
            select(Match)
            .where(user_filter)
            .order_by(Match.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def list_completed_for_tournament(self, tournament_id: uuid.UUID) -> List[Match]:
        result = await self.db.execute(
            select(Match).where(
                Match.tournament_id == tournament_id, Match.status == "COMPLETED"
            )
        )
        return list(result.scalars().all())
