import uuid
from datetime import datetime, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.models.audit_log import AuditLog
from app.models.refresh_token import RefreshToken
from app.models.role import RoleName
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterRequest


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.users = UserRepository(db)
        self.roles = RoleRepository(db)

    async def _record_audit(
        self,
        user_id: uuid.UUID | None,
        action: str,
        ip_address: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        self.db.add(
            AuditLog(
                user_id=user_id,
                action=action,
                resource_type="user",
                resource_id=str(user_id) if user_id else None,
                ip_address=ip_address,
                user_agent=user_agent,
            )
        )
        await self.db.flush()

    async def register(
        self, payload: RegisterRequest, ip_address: str | None, user_agent: str | None
    ) -> User:
        if await self.users.get_by_email(payload.email):
            raise ConflictError("Email is already registered")
        if await self.users.get_by_username(payload.username):
            raise ConflictError("Username is already taken")

        user = User(
            email=payload.email,
            username=payload.username,
            phone=payload.phone,
            password_hash=hash_password(payload.password),
            full_name=payload.full_name,
        )
        await self.users.create(user)

        default_role = await self.roles.get_by_name(RoleName.USER.value)
        if default_role:
            await self.roles.assign_role_to_user(user.id, default_role.id)

        await self._record_audit(user.id, "user.register", ip_address, user_agent)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def authenticate(
        self, identifier: str, password: str, ip_address: str | None, user_agent: str | None
    ) -> User:
        user = await self.users.get_by_identifier(identifier)
        if not user or not verify_password(password, user.password_hash):
            raise UnauthorizedError("Invalid credentials")
        if user.is_blocked or user.is_suspended or not user.is_active:
            raise UnauthorizedError("Account is not active")

        await self.users.touch_last_login(user)
        await self._record_audit(user.id, "user.login", ip_address, user_agent)
        await self.db.commit()
        await self.db.refresh(user)
        return user

    async def issue_token_pair(
        self, user: User, ip_address: str | None, user_agent: str | None
    ) -> tuple[str, str]:
        roles = user.role_names
        access_token = create_access_token(str(user.id), roles)
        refresh_token, _jti, expires_at = create_refresh_token(str(user.id))

        await self.users.create_refresh_token(
            RefreshToken(
                user_id=user.id,
                token_hash=hash_token(refresh_token),
                user_agent=user_agent,
                ip_address=ip_address,
                expires_at=expires_at,
            )
        )
        await self.db.commit()
        return access_token, refresh_token

    async def refresh_tokens(
        self, refresh_token: str, ip_address: str | None, user_agent: str | None
    ) -> tuple[str, str, User]:
        try:
            payload = decode_token(refresh_token)
        except Exception:
            raise UnauthorizedError("Invalid or expired refresh token")

        if payload.get("type") != "refresh":
            raise UnauthorizedError("Invalid token type")

        token_hash = hash_token(refresh_token)
        stored = await self.users.get_refresh_token_by_hash(token_hash)
        if not stored or not stored.is_active:
            raise UnauthorizedError("Refresh token has been revoked")
        if stored.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
            raise UnauthorizedError("Refresh token has expired")

        user = await self.users.get_by_id(uuid.UUID(payload["sub"]))
        if not user or user.is_blocked or user.is_suspended or not user.is_active:
            raise UnauthorizedError("Account is not active")

        # Rotate: revoke the old refresh token and issue a new pair.
        await self.users.revoke_refresh_token(stored)
        new_access, new_refresh = await self.issue_token_pair(user, ip_address, user_agent)
        return new_access, new_refresh, user

    async def logout(self, refresh_token: str, user_id: uuid.UUID) -> None:
        stored = await self.users.get_refresh_token_by_hash(hash_token(refresh_token))
        if stored and stored.user_id == user_id and stored.is_active:
            await self.users.revoke_refresh_token(stored)
        await self._record_audit(user_id, "user.logout")
        await self.db.commit()
