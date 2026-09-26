import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.models.store import Order, OrderItem, OrderStatus, Product
from app.models.user import User
from app.schemas.store import OrderCreate, ProductCreate, ProductUpdate
from app.utils.pagination import PageParams, paginated_response


class StoreService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_product(self, payload: ProductCreate) -> Product:
        existing = await self.db.execute(select(Product).where(Product.slug == payload.slug))
        if existing.scalar_one_or_none():
            raise ConflictError("Product slug already exists")
        product = Product(**payload.model_dump())
        self.db.add(product)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def update_product(self, product_id: uuid.UUID, payload: ProductUpdate) -> Product:
        product = await self.get_product_or_404(product_id)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(product, field, value)
        await self.db.commit()
        await self.db.refresh(product)
        return product

    async def get_product_or_404(self, product_id: uuid.UUID) -> Product:
        result = await self.db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()
        if not product:
            raise NotFoundError("Product not found")
        return product

    async def list_products(
        self,
        search: str | None,
        category: str | None,
        active_only: bool,
        params: PageParams,
    ) -> dict:
        query = select(Product)
        count_query = select(func.count()).select_from(Product)
        if search:
            like = f"%{search}%"
            query = query.where(Product.name.ilike(like))
            count_query = count_query.where(Product.name.ilike(like))
        if category:
            query = query.where(Product.category == category)
            count_query = count_query.where(Product.category == category)
        if active_only:
            query = query.where(Product.is_active.is_(True))
            count_query = count_query.where(Product.is_active.is_(True))
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                query.order_by(Product.created_at.desc()).limit(params.limit).offset(params.offset)
            )
        ).scalars().all()
        from app.schemas.store import ProductOut

        return paginated_response(
            [ProductOut.model_validate(p).model_dump(mode="json") for p in rows],
            total,
            params,
        )

    async def create_order(self, user: User, payload: OrderCreate) -> Order:
        product_ids = [i.product_id for i in payload.items]
        rows = (
            await self.db.execute(select(Product).where(Product.id.in_(product_ids)))
        ).scalars().all()
        by_id = {p.id: p for p in rows}
        total = 0
        order = Order(user_id=user.id, status=OrderStatus.PENDING.value, total=0)
        self.db.add(order)
        await self.db.flush()
        for item in payload.items:
            product = by_id.get(item.product_id)
            if not product or not product.is_active:
                raise AppError(f"Product {item.product_id} is not available")
            if product.stock < item.quantity:
                raise AppError(f"Insufficient stock for {product.name}")
            product.stock -= item.quantity
            total += product.price * item.quantity
            self.db.add(
                OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=item.quantity,
                    unit_price=product.price,
                )
            )
        order.total = total
        await self.db.commit()
        # Reload with items for the response envelope.
        result = await self.db.execute(select(Order).where(Order.id == order.id))
        return result.scalar_one()

    async def list_my_orders(self, user: User, params: PageParams) -> dict:
        query = select(Order).where(Order.user_id == user.id)
        count_query = (
            select(func.count()).select_from(Order).where(Order.user_id == user.id)
        )
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                query.order_by(Order.created_at.desc()).limit(params.limit).offset(params.offset)
            )
        ).scalars().all()
        from app.schemas.store import OrderOut

        return paginated_response(
            [OrderOut.model_validate(o).model_dump(mode="json") for o in rows],
            total,
            params,
        )
