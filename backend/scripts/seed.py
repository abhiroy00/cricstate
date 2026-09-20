"""Seeds the fixed RBAC role list and, if configured via env vars, a bootstrap
SUPER_ADMIN user. Safe to run multiple times (idempotent)."""

import asyncio

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.models.role import Role, RoleName
from app.models.user import User
from app.repositories.role_repository import RoleRepository
from app.repositories.user_repository import UserRepository

ROLE_DESCRIPTIONS = {
    RoleName.SUPER_ADMIN: "Full unrestricted access to every module",
    RoleName.ADMIN: "General administrative access",
    RoleName.MATCH_ADMIN: "Manages matches, scoring assignments, umpires",
    RoleName.STREAMING_ADMIN: "Manages live streams and stream infrastructure",
    RoleName.CONTENT_ADMIN: "Manages CMS content, banners, articles, highlights",
    RoleName.COMMUNITY_ADMIN: "Moderates posts, comments, community profiles",
    RoleName.STORE_ADMIN: "Manages products, inventory, coupons",
    RoleName.FINANCE_ADMIN: "Manages orders, payments, payouts",
    RoleName.SUPPORT_ADMIN: "Handles user reports and support tickets",
    RoleName.USER: "Standard end user",
    RoleName.PLAYER: "Registered player profile",
    RoleName.ORGANIZER: "Can create tournaments and matches",
}


async def seed_roles() -> dict[str, Role]:
    async with AsyncSessionLocal() as db:
        role_repo = RoleRepository(db)
        roles: dict[str, Role] = {}
        for role_name, description in ROLE_DESCRIPTIONS.items():
            existing = await role_repo.get_by_name(role_name.value)
            if existing:
                roles[role_name.value] = existing
                continue
            role = Role(name=role_name.value, description=description)
            db.add(role)
            await db.flush()
            roles[role_name.value] = role
        await db.commit()
        return roles


async def seed_bootstrap_admin(roles: dict[str, Role]) -> None:
    if not (
        settings.BOOTSTRAP_SUPER_ADMIN_EMAIL
        and settings.BOOTSTRAP_SUPER_ADMIN_USERNAME
        and settings.BOOTSTRAP_SUPER_ADMIN_PASSWORD
    ):
        print("Skipping bootstrap SUPER_ADMIN: BOOTSTRAP_SUPER_ADMIN_* env vars not set")
        return

    async with AsyncSessionLocal() as db:
        user_repo = UserRepository(db)
        role_repo = RoleRepository(db)

        existing = await user_repo.get_by_email(settings.BOOTSTRAP_SUPER_ADMIN_EMAIL)
        if existing:
            print(f"Bootstrap admin {settings.BOOTSTRAP_SUPER_ADMIN_EMAIL} already exists")
            return

        user = User(
            email=settings.BOOTSTRAP_SUPER_ADMIN_EMAIL,
            username=settings.BOOTSTRAP_SUPER_ADMIN_USERNAME,
            password_hash=hash_password(settings.BOOTSTRAP_SUPER_ADMIN_PASSWORD),
            full_name="Super Admin",
            is_verified=True,
        )
        db.add(user)
        await db.flush()

        super_admin_role = await role_repo.get_by_name(RoleName.SUPER_ADMIN.value)
        if super_admin_role:
            await role_repo.assign_role_to_user(user.id, super_admin_role.id)

        await db.commit()
        print(f"Created bootstrap SUPER_ADMIN: {settings.BOOTSTRAP_SUPER_ADMIN_EMAIL}")


async def main() -> None:
    roles = await seed_roles()
    print(f"Seeded {len(roles)} roles")
    await seed_bootstrap_admin(roles)


if __name__ == "__main__":
    asyncio.run(main())
