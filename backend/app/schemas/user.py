import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    username: str
    phone: Optional[str] = None
    full_name: str
    avatar_url: Optional[str] = None
    is_active: bool
    is_verified: bool
    is_blocked: bool
    is_suspended: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    roles: List[str] = []

    @classmethod
    def from_model(cls, user) -> "UserOut":
        return cls(
            id=user.id,
            email=user.email,
            username=user.username,
            phone=user.phone,
            full_name=user.full_name,
            avatar_url=user.avatar_url,
            is_active=user.is_active,
            is_verified=user.is_verified,
            is_blocked=user.is_blocked,
            is_suspended=user.is_suspended,
            last_login_at=user.last_login_at,
            created_at=user.created_at,
            roles=user.role_names,
        )


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    phone: Optional[str] = None
