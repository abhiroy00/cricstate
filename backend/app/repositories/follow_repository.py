import uuid
from typing import List, Optional, Tuple

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.follow import Follow
from app.models.user import User


class FollowRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get(self, follower_id: uuid.UUID, following_id: uuid.UUID) -> Optional[Follow]:
        result = await self.db.execute(
            select(Follow).where(
                Follow.follower_id == follower_id, Follow.following_id == following_id
            )
        )
        return result.scalar_one_or_none()

    async def is_following(self, follower_id: uuid.UUID, following_id: uuid.UUID) -> bool:
        return await self.get(follower_id, following_id) is not None

    async def create(self, follower_id: uuid.UUID, following_id: uuid.UUID) -> Follow:
        follow = Follow(follower_id=follower_id, following_id=following_id)
        self.db.add(follow)
        await self.db.flush()
        return follow

    async def delete(self, follow: Follow) -> None:
        await self.db.delete(follow)
        await self.db.flush()

    async def count_followers(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Follow).where(Follow.following_id == user_id)
        )
        return result.scalar_one()

    async def count_following(self, user_id: uuid.UUID) -> int:
        result = await self.db.execute(
            select(func.count()).select_from(Follow).where(Follow.follower_id == user_id)
        )
        return result.scalar_one()

    async def list_followers(
        self, user_id: uuid.UUID, limit: int, offset: int
    ) -> Tuple[List[User], int]:
        total = await self.count_followers(user_id)
        result = await self.db.execute(
            select(User)
            .join(Follow, Follow.follower_id == User.id)
            .where(Follow.following_id == user_id)
            .order_by(Follow.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total

    async def list_following(
        self, user_id: uuid.UUID, limit: int, offset: int
    ) -> Tuple[List[User], int]:
        total = await self.count_following(user_id)
        result = await self.db.execute(
            select(User)
            .join(Follow, Follow.following_id == User.id)
            .where(Follow.follower_id == user_id)
            .order_by(Follow.created_at.desc())
            .limit(limit)
            .offset(offset)
        )
        return list(result.scalars().all()), total
