import uuid

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not token:
        raise UnauthorizedError("Not authenticated")

    try:
        payload = decode_token(token)
    except Exception:
        raise UnauthorizedError("Invalid or expired access token")

    if payload.get("type") != "access":
        raise UnauthorizedError("Invalid token type")

    user = await UserRepository(db).get_by_id(uuid.UUID(payload["sub"]))
    if not user:
        raise UnauthorizedError("User not found")
    if user.is_blocked or user.is_suspended or not user.is_active:
        raise UnauthorizedError("Account is not active")

    return user


def require_roles(*allowed_roles: str):
    async def _checker(current_user: User = Depends(get_current_user)) -> User:
        user_roles = set(current_user.role_names)
        if not user_roles.intersection(allowed_roles):
            raise ForbiddenError("You do not have permission to perform this action")
        return current_user

    return _checker
