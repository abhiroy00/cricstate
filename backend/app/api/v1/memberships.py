from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.membership import MembershipOut, MembershipPlanOut, SubscribeRequest
from app.services.membership_service import MembershipService

router = APIRouter(prefix="/memberships", tags=["memberships"])


@router.get("/plans")
async def list_plans(db: AsyncSession = Depends(get_db)):
    plans = await MembershipService(db).list_plans()
    return success_response([MembershipPlanOut.model_validate(p).model_dump(mode="json") for p in plans])


@router.get("/me")
async def get_my_membership(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MembershipService(db)
    membership = await service.get_my_membership(current_user)
    if not membership:
        return success_response(None)
    plan_code = plan_name = None
    plans = await service.list_plans()
    for p in plans:
        if p.id == membership.plan_id:
            plan_code, plan_name = p.code, p.name
    out = MembershipOut.model_validate(membership).model_dump(mode="json")
    out["plan_code"] = plan_code
    out["plan_name"] = plan_name
    return success_response(out)


@router.post("/subscribe")
async def subscribe(
    payload: SubscribeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = MembershipService(db)
    membership = await service.subscribe(current_user, payload.plan_code)
    plans = await service.list_plans()
    plan_code = plan_name = None
    for p in plans:
        if p.id == membership.plan_id:
            plan_code, plan_name = p.code, p.name
    out = MembershipOut.model_validate(membership).model_dump(mode="json")
    out["plan_code"] = plan_code
    out["plan_name"] = plan_name
    return success_response(out, message="Subscribed successfully")
