import uuid
from typing import List, Optional, Tuple

from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.team import Team, TeamPlayer


class TeamRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, team: Team) -> Team:
        self.db.add(team)
        await self.db.flush()
        return team

    async def get_by_id(self, team_id: uuid.UUID) -> Optional[Team]:
        result = await self.db.execute(select(Team).where(Team.id == team_id))
        return result.scalar_one_or_none()

    async def list(
        self,
        search: Optional[str],
        limit: int,
        offset: int,
        created_by: Optional[uuid.UUID] = None,
    ) -> Tuple[List[Team], int]:
        query = select(Team)
        count_query = select(func.count()).select_from(Team)
        if search:
            like = f"%{search}%"
            query = query.where(Team.name.ilike(like))
            count_query = count_query.where(Team.name.ilike(like))
        if created_by:
            query = query.where(Team.created_by == created_by)
            count_query = count_query.where(Team.created_by == created_by)

        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(query.order_by(Team.name).limit(limit).offset(offset))
        return list(result.scalars().all()), total

    async def list_for_user(
        self, user_id: uuid.UUID, player_id: Optional[uuid.UUID] = None
    ) -> List[Team]:
        """Teams the user owns plus teams their linked player is on. Backs the
        MyCricket "Your teams" tab."""
        conditions = [Team.created_by == user_id]
        if player_id:
            roster_teams = select(TeamPlayer.team_id).where(
                TeamPlayer.player_id == player_id
            )
            conditions.append(Team.id.in_(roster_teams))
        result = await self.db.execute(
            select(Team).where(or_(*conditions)).order_by(Team.name)
        )
        return list(result.scalars().all())

    async def list_opponents(self, created_by: uuid.UUID) -> List[Team]:
        from app.models.match import Match

        own_ids = select(Team.id).where(Team.created_by == created_by)
        result = await self.db.execute(
            select(Team)
            .join(Match, (Match.team_a_id == Team.id) | (Match.team_b_id == Team.id))
            .where(
                Team.id.notin_(own_ids),
                Match.team_a_id.in_(own_ids) | Match.team_b_id.in_(own_ids),
            )
            .distinct()
            .order_by(Team.name)
        )
        return list(result.scalars().all())

    async def get_team_player(self, team_id: uuid.UUID, player_id: uuid.UUID) -> Optional[TeamPlayer]:
        result = await self.db.execute(
            select(TeamPlayer).where(
                TeamPlayer.team_id == team_id, TeamPlayer.player_id == player_id
            )
        )
        return result.scalar_one_or_none()

    async def add_player(self, team_player: TeamPlayer) -> TeamPlayer:
        self.db.add(team_player)
        await self.db.flush()
        return team_player

    async def remove_player(self, team_player: TeamPlayer) -> None:
        await self.db.delete(team_player)
        await self.db.flush()
