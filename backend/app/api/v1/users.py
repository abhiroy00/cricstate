import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.core.database import get_db
from app.models.role import RoleName
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.user import UserOut, UserUpdate
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["users"])

ADMIN_ROLES = (RoleName.SUPER_ADMIN.value, RoleName.ADMIN.value)


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    return success_response(UserOut.from_model(current_user).model_dump())


@router.patch("/me")
async def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = UserService(db)
    updated = await service.update_profile(current_user, payload)
    return success_response(UserOut.from_model(updated).model_dump(), message="Profile updated")


@router.post("/{user_id}/roles/{role_name}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def assign_role(user_id: uuid.UUID, role_name: RoleName, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    updated = await service.assign_role(user_id, role_name.value)
    return success_response(UserOut.from_model(updated).model_dump(), message="Role assigned")


@router.delete("/{user_id}/roles/{role_name}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def revoke_role(user_id: uuid.UUID, role_name: RoleName, db: AsyncSession = Depends(get_db)):
    service = UserService(db)
    updated = await service.revoke_role(user_id, role_name.value)
    return success_response(UserOut.from_model(updated).model_dump(), message="Role revoked")
