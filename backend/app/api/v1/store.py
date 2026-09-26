import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.api.v1.users import ADMIN_ROLES
from app.core.database import get_db
from app.core.exceptions import AppError
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.store import (
    OrderCreate,
    OrderDetailOut,
    OrderOut,
    PayInitOut,
    PaymentOut,
    ProductCreate,
    ProductOut,
    ProductUpdate,
)
from app.services.payment_service import PaymentService
from app.services.store_service import StoreService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/store", tags=["store"])


@router.get("/products")
async def list_products(
    search: str | None = Query(default=None),
    category: str | None = Query(default=None),
    active_only: bool = Query(default=True),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    page = await StoreService(db).list_products(
        search, category, active_only, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.get("/products/{product_id}")
async def get_product(product_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    product = await StoreService(db).get_product_or_404(product_id)
    return success_response(ProductOut.model_validate(product).model_dump(mode="json"))


@router.post(
    "/products",
    dependencies=[Depends(require_roles(*ADMIN_ROLES))],
)
async def create_product(payload: ProductCreate, db: AsyncSession = Depends(get_db)):
    product = await StoreService(db).create_product(payload)
    return success_response(
        ProductOut.model_validate(product).model_dump(mode="json"),
        message="Product created",
    )


@router.patch(
    "/products/{product_id}",
    dependencies=[Depends(require_roles(*ADMIN_ROLES))],
)
async def update_product(
    product_id: uuid.UUID, payload: ProductUpdate, db: AsyncSession = Depends(get_db)
):
    product = await StoreService(db).update_product(product_id, payload)
    return success_response(
        ProductOut.model_validate(product).model_dump(mode="json"),
        message="Product updated",
    )


@router.post("/orders")
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order = await StoreService(db).create_order(current_user, payload)
    return success_response(
        OrderOut.model_validate(order).model_dump(mode="json"), message="Order placed"
    )


@router.get("/orders/me")
async def list_my_orders(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    page = await StoreService(db).list_my_orders(
        current_user, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


def _order_detail(order) -> dict:
    return OrderDetailOut.model_validate(order).model_dump(mode="json")


@router.get("/orders/{order_id}")
async def get_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_admin = bool(set(current_user.role_names) & set(ADMIN_ROLES))
    order = await PaymentService(db).get_detail(current_user, order_id, is_admin)
    return success_response(_order_detail(order))


@router.post("/orders/{order_id}/pay")
async def pay_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    order, payment = await PaymentService(db).initiate(current_user, order_id)
    return success_response(
        PayInitOut(
            order=OrderOut.model_validate(order),
            payment=PaymentOut.model_validate(payment),
        ).model_dump(mode="json"),
        message="Payment initiated",
    )


@router.post("/orders/{order_id}/confirm")
async def confirm_order_payment(
    order_id: uuid.UUID,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Test-mode confirmation only — disabled with a live provider."""
    is_admin = bool(set(current_user.role_names) & set(ADMIN_ROLES))
    try:
        payment_id = uuid.UUID(str(payload.get("payment_id", "")))
    except ValueError:
        raise AppError("payment_id is required")
    order, payment = await PaymentService(db).confirm_test(
        current_user, order_id, payment_id, is_admin
    )
    return success_response(
        PayInitOut(
            order=OrderOut.model_validate(order),
            payment=PaymentOut.model_validate(payment),
        ).model_dump(mode="json"),
        message="Payment confirmed",
    )


@router.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_admin = bool(set(current_user.role_names) & set(ADMIN_ROLES))
    order = await PaymentService(db).cancel(current_user, order_id, is_admin)
    return success_response(_order_detail(order), message="Order cancelled")
