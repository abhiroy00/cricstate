import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError
from app.models.profile import Profile
from app.models.user import User
from app.repositories.follow_repository import FollowRepository
from app.repositories.player_repository import PlayerRepository
from app.repositories.profile_repository import ProfileRepository
from app.repositories.user_repository import UserRepository
from app.schemas.profile import ProfileOut, ProfileUpdate


COMPLETION_FIELDS = (
    "bio",
    "city",
    "country",
    "gender",
    "date_of_birth",
    "playing_role",
    "batting_style",
    "bowling_style",
    "website_url",
    "cover_photo_url",
)


class ProfileService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.profiles = ProfileRepository(db)
        self.users = UserRepository(db)
        self.follows = FollowRepository(db)
        self.players = PlayerRepository(db)

    async def _get_or_create(self, user_id: uuid.UUID) -> Profile:
        profile = await self.profiles.get_by_user_id(user_id)
        if profile:
            return profile
        return await self.profiles.create(Profile(user_id=user_id))

    async def get_profile_view(
        self, target_user: User, viewer_id: uuid.UUID | None
    ) -> ProfileOut:
        profile = await self._get_or_create(target_user.id)
        # Count a view when someone else opens the profile (mobile
        # ProfileScreen shows "Profile views").
        if viewer_id and viewer_id != target_user.id:
            profile.profile_views = (profile.profile_views or 0) + 1
            await self.db.commit()
            await self.db.refresh(profile)
        followers_count = await self.follows.count_followers(target_user.id)
        following_count = await self.follows.count_following(target_user.id)
        is_following = (
            await self.follows.is_following(viewer_id, target_user.id)
            if viewer_id and viewer_id != target_user.id
            else False
        )
        # Cricket identity: prefer explicit profile fields, fall back to the
        # linked Player row (user_id == user.id) so old accounts still show
        # Playing role / Batting style / Bowling style.
        playing_role = profile.playing_role
        batting_style = profile.batting_style
        bowling_style = profile.bowling_style
        if not (playing_role and batting_style and bowling_style):
            linked = await self.players.get_by_user_id(target_user.id)
            if linked:
                playing_role = playing_role or linked.role
                batting_style = batting_style or linked.batting_style
                bowling_style = bowling_style or linked.bowling_style
        filled = 0
        values = {
            "bio": profile.bio,
            "city": profile.city,
            "country": profile.country,
            "gender": profile.gender,
            "date_of_birth": profile.date_of_birth,
            "playing_role": playing_role,
            "batting_style": batting_style,
            "bowling_style": bowling_style,
            "website_url": profile.website_url,
            "cover_photo_url": profile.cover_photo_url,
        }
        for field in COMPLETION_FIELDS:
            if values.get(field):
                filled += 1
        # Avatar lives on User, count it as well for the mobile progress bar.
        total_steps = len(COMPLETION_FIELDS) + 1
        if target_user.avatar_url:
            filled += 1
        completion = round((filled / total_steps) * 100) if total_steps else 0
        return ProfileOut(
            user_id=target_user.id,
            username=target_user.username,
            full_name=target_user.full_name,
            avatar_url=target_user.avatar_url,
            bio=profile.bio,
            date_of_birth=profile.date_of_birth,
            dob=profile.date_of_birth,
            gender=profile.gender,
            city=profile.city,
            country=profile.country,
            cover_photo_url=profile.cover_photo_url,
            website_url=profile.website_url,
            followers_count=followers_count,
            following_count=following_count,
            is_following=is_following,
            created_at=target_user.created_at,
            email=target_user.email,
            phone=target_user.phone,
            playing_role=playing_role,
            batting_style=batting_style,
            bowling_style=bowling_style,
            profile_views=profile.profile_views or 0,
            profile_completion_percent=completion,
        )

    async def get_by_user_id_or_404(self, user_id: uuid.UUID) -> User:
        user = await self.users.get_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
        return user

    async def update_own_profile(self, user: User, payload: ProfileUpdate) -> ProfileOut:
        profile = await self._get_or_create(user.id)
        data = payload.model_dump(exclude_unset=True)
        # `dob` is an alias the mobile app sends; store it as date_of_birth.
        dob_value = data.pop("dob", None)
        if dob_value is not None and "date_of_birth" not in data:
            data["date_of_birth"] = dob_value
        for field, value in data.items():
            if hasattr(profile, field):
                setattr(profile, field, value)
        await self.db.commit()
        await self.db.refresh(profile)
        return await self.get_profile_view(user, viewer_id=user.id)
