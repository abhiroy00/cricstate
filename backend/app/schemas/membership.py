import uuid
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class MembershipPlanOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    code: str
    name: str
    price: int
    duration_days: Optional[int] = None
    is_active: bool


class SubscribeRequest(BaseModel):
    plan_code: str


class MembershipOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    plan_id: uuid.UUID
    plan_code: Optional[str] = None
    plan_name: Optional[str] = None
    status: str
    expires_at: Optional[datetime] = None
    created_at: datetime
