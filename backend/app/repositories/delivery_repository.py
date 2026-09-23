import uuid
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.delivery import Delivery


class DeliveryRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, delivery: Delivery) -> Delivery:
        self.db.add(delivery)
        await self.db.flush()
        return delivery

    async def list_for_innings(self, innings_id: uuid.UUID) -> List[Delivery]:
        result = await self.db.execute(
            select(Delivery)
            .where(Delivery.innings_id == innings_id)
            .order_by(Delivery.created_at)
        )
        return list(result.scalars().all())

    async def get_last(self, innings_id: uuid.UUID) -> Optional[Delivery]:
        result = await self.db.execute(
            select(Delivery)
            .where(Delivery.innings_id == innings_id)
            .order_by(Delivery.created_at.desc())
        )
        return result.scalars().first()

    async def delete(self, delivery: Delivery) -> None:
        await self.db.delete(delivery)
        await self.db.flush()
