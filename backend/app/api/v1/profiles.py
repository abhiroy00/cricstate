import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_current_user_optional
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.profile import ProfileUpdate
from app.services.follow_service import FollowService
from app.services.profile_service import ProfileService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me")
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    profile = await service.get_profile_view(current_user, viewer_id=current_user.id)
    return success_response(profile.model_dump())


@router.patch("/me")
async def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    profile = await service.update_own_profile(current_user, payload)
    return success_response(profile.model_dump(), message="Profile updated")


@router.get("/{user_id}")
async def get_profile(
    user_id: uuid.UUID,
    viewer: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    service = ProfileService(db)
    target = await service.get_by_user_id_or_404(user_id)
    profile = await service.get_profile_view(target, viewer_id=viewer.id if viewer else None)
    return success_response(profile.model_dump())


@router.post("/{user_id}/follow")
async def follow_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = FollowService(db)
    await service.follow(current_user.id, user_id)
    return success_response(None, message="Followed successfully")


@router.delete("/{user_id}/follow")
async def unfollow_user(
    user_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = FollowService(db)
    await service.unfollow(current_user.id, user_id)
    return success_response(None, message="Unfollowed successfully")


@router.get("/{user_id}/followers")
async def list_followers(
    user_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = FollowService(db)
    page = await service.list_followers(user_id, PageParams(limit=limit, offset=offset))
    return success_response(page)


@router.get("/{user_id}/following")
async def list_following(
    user_id: uuid.UUID,
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = FollowService(db)
    page = await service.list_following(user_id, PageParams(limit=limit, offset=offset))
    return success_response(page)
