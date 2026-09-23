import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.team_invite import TeamInvite


class TeamInviteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_team_id(self, team_id: uuid.UUID) -> Optional[TeamInvite]:
        result = await self.db.execute(
            select(TeamInvite).where(TeamInvite.team_id == team_id)
        )
        return result.scalar_one_or_none()

    async def get_by_code(self, code: str) -> Optional[TeamInvite]:
        result = await self.db.execute(select(TeamInvite).where(TeamInvite.code == code))
        return result.scalar_one_or_none()

    async def create(self, invite: TeamInvite) -> TeamInvite:
        self.db.add(invite)
        await self.db.flush()
        return invite
