import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.profile import Profile
from app.models.user import User
from app.repositories.follow_repository import FollowRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.user_repository import UserRepository
from app.schemas.profile import ProfileOut, ProfileUpdate


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.profiles = ProfileRepository(db)
        self.users = UserRepository(db)
        self.follows = FollowRepository(db)

    async def _get_or_create(self, user_id: uuid.UUID) -> Profile:
        profile = await self.profiles.get_by_user_id(user_id)
        if profile:
            return profile
        return await self.profiles.create(Profile(user_id=user_id))

    async def get_profile_view(
        self, target_user: User, viewer_id: uuid.UUID | None
    ) -> ProfileOut:
        profile = await self._get_or_create(target_user.id)
        followers_count = await self.follows.count_followers(target_user.id)
        following_count = await self.follows.count_following(target_user.id)
        is_following = (
            await self.follows.is_following(viewer_id, target_user.id)
            if viewer_id and viewer_id != target_user.id
            else False
        )
        return ProfileOut(
            user_id=target_user.id,
            username=target_user.username,
            full_name=target_user.full_name,
            avatar_url=target_user.avatar_url,
            bio=profile.bio,
            date_of_birth=profile.date_of_birth,
            gender=profile.gender,
            city=profile.city,
            country=profile.country,
            cover_photo_url=profile.cover_photo_url,
            website_url=profile.website_url,
            followers_count=followers_count,
            following_count=following_count,
            is_following=is_following,
            created_at=target_user.created_at,
        )

    async def get_by_user_id_or_404(self, user_id: uuid.UUID) -> User:
        user = await self.users.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        return user

    async def update_own_profile(self, user: User, payload: ProfileUpdate) -> ProfileOut:
        profile = await self._get_or_create(user.id)
        data = payload.model_dump(exclude_unset=True)
        for field, value in data.items():
            setattr(profile, field, value)
        await self.db.commit()
        await self.db.refresh(profile)
        return await self.get_profile_view(user, viewer_id=user.id)
