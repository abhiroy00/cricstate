import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.user import UserUpdate


class UserService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.roles = RoleRepository(db)

    async def update_profile(self, user: User, payload: UserUpdate) -> User:
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(user, field, value)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def assign_role(self, user_id: uuid.UUID, role_name: str) -> User:
        user = await self.users.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        role = await self.roles.get_by_name(role_name)
        if not role:
            raise NotFoundError("Role not found")

        if await self.roles.get_user_role(user_id, role.id):
            raise ConflictError(f"User already has role {role_name}")

        await self.roles.assign_role_to_user(user_id, role.id)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def revoke_role(self, user_id: uuid.UUID, role_name: str) -> User:
        user = await self.users.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")

        role = await self.roles.get_by_name(role_name)
        if not role:
            raise NotFoundError("Role not found")

        user_role = await self.roles.get_user_role(user_id, role.id)
        if not user_role:
            raise NotFoundError(f"User does not have role {role_name}")

        await self.roles.revoke_role_from_user(user_role)
        await self.db.commit()
        await self.db.refresh(user)
        return user
