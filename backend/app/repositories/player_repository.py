import uuid
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player import Player


class PlayerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, player: Player) -> Player:
        self.db.add(player)
        await self.db.flush()
        return player

    async def get_by_id(self, player_id: uuid.UUID) -> Optional[Player]:
        result = await self.db.execute(select(Player).where(Player.id == player_id))
        return result.scalar_one_or_none()

    async def get_by_user_id(self, user_id: uuid.UUID) -> Optional[Player]:
        result = await self.db.execute(select(Player).where(Player.user_id == user_id))
        return result.scalar_one_or_none()

    async def list(
        self, search: Optional[str], role: Optional[str], limit: int, offset: int
    ) -> Tuple[List[Player], int]:
        query = select(Player)
        count_query = select(func.count()).select_from(Player)

        if search:
            like = f"%{search}%"
            query = query.where(Player.full_name.ilike(like))
            count_query = count_query.where(Player.full_name.ilike(like))
        if role:
            query = query.where(Player.role == role)
            count_query = count_query.where(Player.role == role)

        total = (await self.db.execute(count_query)).scalar_one()
        result = await self.db.execute(
            query.order_by(Player.full_name).limit(limit).offset(offset)
        )
        return list(result.scalars().all()), total
