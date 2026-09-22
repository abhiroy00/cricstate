import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.repositories.follow_repository import FollowRepository
from app.repositories.user_repository import UserRepository
from app.schemas.profile import FollowUserOut
from app.utils.pagination import PageParams, paginated_response


class FollowService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.follows = FollowRepository(db)
        self.users = UserRepository(db)

    async def follow(self, follower_id: uuid.UUID, target_user_id: uuid.UUID) -> None:
        if follower_id == target_user_id:
            raise AppError("You cannot follow yourself")

        target = await self.users.get_by_id(target_user_id)
        if not target:
            raise NotFoundError("User not found")

        if await self.follows.is_following(follower_id, target_user_id):
            raise ConflictError("Already following this user")

        await self.follows.create(follower_id, target_user_id)
        await self.db.commit()

    async def unfollow(self, follower_id: uuid.UUID, target_user_id: uuid.UUID) -> None:
        follow = await self.follows.get(follower_id, target_user_id)
        if not follow:
            raise NotFoundError("You are not following this user")
        await self.follows.delete(follow)
        await self.db.commit()

    async def list_followers(self, user_id: uuid.UUID, params: PageParams) -> dict:
        users, total = await self.follows.list_followers(user_id, params.limit, params.offset)
        items = [FollowUserOut.model_validate(u).model_dump() for u in users]
        return paginated_response(items, total, params)

    async def list_following(self, user_id: uuid.UUID, params: PageParams) -> dict:
        users, total = await self.follows.list_following(user_id, params.limit, params.offset)
        items = [FollowUserOut.model_validate(u).model_dump() for u in users]
        return paginated_response(items, total, params)
