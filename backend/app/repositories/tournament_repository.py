import uuid
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.tournament import Tournament, TournamentTeam


class TournamentRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, tournament: Tournament) -> Tournament:
        self.db.add(tournament)
        await self.db.flush()
        return tournament

    async def get_by_id(self, tournament_id: uuid.UUID) -> Optional[Tournament]:
        result = await self.db.execute(
            select(Tournament).where(Tournament.id == tournament_id)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        status: Optional[str],
        limit: int,
        offset: int,
        organizer_id: Optional[uuid.UUID] = None,
    ) -> Tuple[List[Tournament], int]:
        query = select(Tournament)
        count_query = select(func.count()).select_from(Tournament)
        if status:
            query = query.where(Tournament.status == status)
            count_query = count_query.where(Tournament.status == status)
        if organizer_id:
            query = query.where(Tournament.organizer_id == organizer_id)
            count_query = count_query.where(Tournament.organizer_id == organizer_id)

        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(
            query.order_by(Tournament.created_at.desc()).limit(limit).offset(offset)
        )
        return list(result.scalars().all()), total

    async def get_registration(
        self, tournament_id: uuid.UUID, team_id: uuid.UUID
    ) -> Optional[TournamentTeam]:
        result = await self.db.execute(
            select(TournamentTeam).where(
                TournamentTeam.tournament_id == tournament_id,
                TournamentTeam.team_id == team_id,
            )
        )
        return result.scalar_one_or_none()

    async def register_team(self, registration: TournamentTeam) -> TournamentTeam:
        self.db.add(registration)
        await self.db.flush()
        return registration
