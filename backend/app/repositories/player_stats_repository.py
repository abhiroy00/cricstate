import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.player_stats import PlayerMatchStats


class PlayerStatsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_for_player_match(
        self, player_id: uuid.UUID, match_id: uuid.UUID
    ) -> Optional[PlayerMatchStats]:
        result = await self.db.execute(
            select(PlayerMatchStats).where(
                PlayerMatchStats.player_id == player_id,
                PlayerMatchStats.match_id == match_id,
            )
        )
        return result.scalar_one_or_none()

    async def upsert(self, stats: PlayerMatchStats) -> PlayerMatchStats:
        self.db.add(stats)
        await self.db.flush()
        return stats

    async def list_for_player(self, player_id: uuid.UUID) -> List[PlayerMatchStats]:
        result = await self.db.execute(
            select(PlayerMatchStats).where(PlayerMatchStats.player_id == player_id)
        )
        return list(result.scalars().all())
