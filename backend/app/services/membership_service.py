from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError
from app.models.membership import Membership, MembershipPlan, MembershipStatus
from app.models.user import User

DEFAULT_PLANS = (
    {"code": "PRO_YEARLY", "name": "PRO Yearly", "price": 39900, "duration_days": 365},
    {"code": "PRO_LIFETIME", "name": "PRO Lifetime", "price": 399900, "duration_days": None},
)


class MembershipService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _ensure_plans(self) -> None:
        for plan in DEFAULT_PLANS:
            result = await self.db.execute(
                select(MembershipPlan).where(MembershipPlan.code == plan["code"])
            )
            if not result.scalar_one_or_none():
                self.db.add(MembershipPlan(**plan))
        await self.db.commit()

    async def list_plans(self) -> list[MembershipPlan]:
        await self._ensure_plans()
        result = await self.db.execute(
            select(MembershipPlan).where(MembershipPlan.is_active.is_(True))
        )
        return list(result.scalars().all())

    async def get_my_membership(self, user: User) -> Membership | None:
        result = await self.db.execute(
            select(Membership)
            .where(Membership.user_id == user.id, Membership.status == MembershipStatus.ACTIVE.value)
            .order_by(Membership.created_at.desc())
        )
        return result.scalars().first()

    async def subscribe(self, user: User, plan_code: str) -> Membership:
        await self._ensure_plans()
        result = await self.db.execute(
            select(MembershipPlan).where(MembershipPlan.code == plan_code)
        )
        plan = result.scalar_one_or_none()
        if not plan or not plan.is_active:
            raise AppError("Unknown membership plan")
        # Expire previous active memberships.
        prev = await self.db.execute(
            select(Membership).where(
                Membership.user_id == user.id,
                Membership.status == MembershipStatus.ACTIVE.value,
            )
        )
        for m in prev.scalars().all():
            m.status = MembershipStatus.EXPIRED.value
        expires_at = None
        if plan.duration_days:
            expires_at = datetime.now(timezone.utc) + timedelta(days=plan.duration_days)
        membership = Membership(
            user_id=user.id,
            plan_id=plan.id,
            status=MembershipStatus.ACTIVE.value,
            expires_at=expires_at,
        )
        self.db.add(membership)
        await self.db.commit()
        await self.db.refresh(membership)
        return membership
