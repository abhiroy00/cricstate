import uuid
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.role import Role, UserRole


class RoleRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_name(self, name: str) -> Optional[Role]:
        result = await self.db.execute(select(Role).where(Role.name == name))
        return result.scalar_one_or_none()

    async def assign_role_to_user(self, user_id: uuid.UUID, role_id: uuid.UUID) -> UserRole:
        user_role = UserRole(user_id=user_id, role_id=role_id)
        self.db.add(user_role)
        await self.db.flush()
        return user_role

    async def get_user_role(self, user_id: uuid.UUID, role_id: uuid.UUID) -> Optional[UserRole]:
        result = await self.db.execute(
            select(UserRole).where(UserRole.user_id == user_id, UserRole.role_id == role_id)
        )
        return result.scalar_one_or_none()

    async def revoke_role_from_user(self, user_role: UserRole) -> None:
        await self.db.delete(user_role)
        await self.db.flush()
