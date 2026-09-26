import hashlib
import hmac
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.store import Order, OrderStatus, Payment, PaymentStatus, Product
from app.models.user import User
from app.schemas.store import WebhookPaymentIn


def _test_mode() -> bool:
    return settings.PAYMENT_PROVIDER == "test" and not settings.PAYMENT_WEBHOOK_SECRET


class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _get_order_or_404(self, order_id: uuid.UUID) -> Order:
        order = (
            await self.db.execute(select(Order).where(Order.id == order_id))
        ).scalar_one_or_none()
        if not order:
            raise NotFoundError("Order not found")
        return order

    async def get_detail(self, user: User, order_id: uuid.UUID, is_admin: bool = False) -> Order:
        order = await self._get_order_or_404(order_id)
        if order.user_id != user.id and not is_admin:
            raise ForbiddenError("Not your order")
        return order

    async def initiate(self, user: User, order_id: uuid.UUID) -> tuple[Order, Payment]:
        order = await self._get_order_or_404(order_id)
        if order.user_id != user.id:
            raise ForbiddenError("Not your order")
        if order.status != OrderStatus.PENDING.value:
            raise AppError(f"Order is {order.status}, only PENDING orders can be paid")
        provider = settings.PAYMENT_PROVIDER or "test"
        payment = Payment(
            order_id=order.id,
            user_id=user.id,
            provider=provider,
            provider_ref=f"{provider}_{uuid.uuid4().hex[:12]}",
            amount=order.total,
            currency="INR",
            status=PaymentStatus.INITIATED.value,
        )
        self.db.add(payment)
        await self.db.commit()
        await self.db.refresh(payment)
        return order, payment

    async def confirm_test(
        self, user: User, order_id: uuid.UUID, payment_id: uuid.UUID, is_admin: bool = False
    ) -> tuple[Order, Payment]:
        """Local-only confirmation while provider is 'test'.

        Refuses to run once a real provider/webhook secret is configured —
        then only signed webhooks may confirm payments.
        """
        if not _test_mode():
            raise AppError("Test confirmation is disabled with a live payment provider")
        order = await self._get_order_or_404(order_id)
        if order.user_id != user.id and not is_admin:
            raise ForbiddenError("Not your order")
        payment = (
            await self.db.execute(
                select(Payment).where(
                    Payment.id == payment_id, Payment.order_id == order.id
                )
            )
        ).scalar_one_or_none()
        if not payment:
            raise NotFoundError("Payment not found")
        if payment.status != PaymentStatus.INITIATED.value:
            raise AppError(f"Payment is already {payment.status}")
        payment.status = PaymentStatus.SUCCESS.value
        order.status = OrderStatus.CONFIRMED.value
        await self.db.commit()
        await self.db.refresh(payment)
        await self.db.refresh(order)
        return order, payment

    async def cancel(self, user: User, order_id: uuid.UUID, is_admin: bool = False) -> Order:
        order = await self._get_order_or_404(order_id)
        if order.user_id != user.id and not is_admin:
            raise ForbiddenError("Not your order")
        if order.status != OrderStatus.PENDING.value:
            raise AppError(f"Order is {order.status} and cannot be cancelled")
        # Restore reserved stock.
        items = order.items
        if items:
            product_ids = [i.product_id for i in items]
            products = (
                await self.db.execute(select(Product).where(Product.id.in_(product_ids)))
            ).scalars().all()
            by_id = {p.id: p for p in products}
            for item in items:
                if item.product_id in by_id:
                    by_id[item.product_id].stock += item.quantity
        order.status = OrderStatus.CANCELLED.value
        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def apply_webhook(
        self, raw_body: bytes, signature: str | None, test_header: str | None, payload: WebhookPaymentIn
    ) -> tuple[Order, Payment]:
        if settings.PAYMENT_WEBHOOK_SECRET:
            expected = hmac.new(
                settings.PAYMENT_WEBHOOK_SECRET.encode(), raw_body, hashlib.sha256
            ).hexdigest()
            if not signature or not hmac.compare_digest(expected, signature):
                raise ForbiddenError("Invalid webhook signature")
        elif test_header != "local":
            raise ForbiddenError("Test webhooks require X-Test-Webhook: local")
        if payload.status not in (PaymentStatus.SUCCESS.value, PaymentStatus.FAILED.value):
            raise AppError("Invalid payment status")
        payment = (
            await self.db.execute(
                select(Payment).where(Payment.provider_ref == payload.provider_ref)
            )
        ).scalar_one_or_none()
        if not payment:
            raise NotFoundError("Payment not found")
        if payload.amount is not None and payload.amount != payment.amount:
            raise AppError("Amount mismatch")
        if payment.status != PaymentStatus.INITIATED.value:
            # Idempotent replay: return current state.
            order = await self._get_order_or_404(payment.order_id)
            return order, payment
        payment.status = payload.status
        order = await self._get_order_or_404(payment.order_id)
        if payload.status == PaymentStatus.SUCCESS.value:
            order.status = OrderStatus.CONFIRMED.value
        await self.db.commit()
        await self.db.refresh(payment)
        await self.db.refresh(order)
        return order, payment
