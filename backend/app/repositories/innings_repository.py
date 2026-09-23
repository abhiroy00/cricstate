import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.innings import Innings


class InningsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, innings: Innings) -> Innings:
        self.db.add(innings)
        await self.db.flush()
        return innings

    async def get_by_id(self, innings_id: uuid.UUID) -> Optional[Innings]:
        result = await self.db.execute(select(Innings).where(Innings.id == innings_id))
        return result.scalar_one_or_none()

    async def list_for_match(self, match_id: uuid.UUID) -> List[Innings]:
        result = await self.db.execute(
            select(Innings)
            .where(Innings.match_id == match_id)
            .order_by(Innings.innings_number)
        )
        return list(result.scalars().all())

    async def get_current(self, match_id: uuid.UUID) -> Optional[Innings]:
        result = await self.db.execute(
            select(Innings)
            .where(Innings.match_id == match_id, Innings.status == "IN_PROGRESS")
            .order_by(Innings.innings_number.desc())
        )
        return result.scalars().first()
