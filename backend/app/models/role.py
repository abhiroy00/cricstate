import uuid
from enum import Enum
from typing import TYPE_CHECKING, List

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, UUIDPkMixin

if TYPE_CHECKING:
    from app.models.user import User


class RoleName(str, Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    MATCH_ADMIN = "MATCH_ADMIN"
    STREAMING_ADMIN = "STREAMING_ADMIN"
    CONTENT_ADMIN = "CONTENT_ADMIN"
    COMMUNITY_ADMIN = "COMMUNITY_ADMIN"
    STORE_ADMIN = "STORE_ADMIN"
    FINANCE_ADMIN = "FINANCE_ADMIN"
    SUPPORT_ADMIN = "SUPPORT_ADMIN"
    USER = "USER"
    PLAYER = "PLAYER"
    ORGANIZER = "ORGANIZER"


class Role(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "roles"

    name: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    role_permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="role", cascade="all, delete-orphan", lazy="selectin"
    )
    user_roles: Mapped[List["UserRole"]] = relationship(
        back_populates="role", cascade="all, delete-orphan"
    )

    @property
    def permission_codes(self) -> List[str]:
        return [rp.permission.code for rp in self.role_permissions]


class Permission(UUIDPkMixin, TimestampMixin, Base):
    __tablename__ = "permissions"

    code: Mapped[str] = mapped_column(String(100), unique=True, index=True, nullable=False)
    description: Mapped[str] = mapped_column(Text, default="", nullable=False)

    role_permissions: Mapped[List["RolePermission"]] = relationship(
        back_populates="permission", cascade="all, delete-orphan"
    )


class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )
    permission_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True
    )

    role: Mapped["Role"] = relationship(back_populates="role_permissions", lazy="selectin")
    permission: Mapped["Permission"] = relationship(
        back_populates="role_permissions", lazy="selectin"
    )


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    role_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True
    )

    user: Mapped["User"] = relationship(back_populates="user_roles")
    role: Mapped["Role"] = relationship(back_populates="user_roles", lazy="selectin")
