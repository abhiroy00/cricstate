import json

from fastapi import APIRouter, Depends, Header, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AppError
from app.schemas.common import success_response
from app.schemas.store import OrderOut, PaymentOut, PayInitOut, WebhookPaymentIn
from app.services.payment_service import PaymentService

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/payments")
async def payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
    signature: str | None = Header(default=None, alias="X-Webhook-Signature"),
    test_header: str | None = Header(default=None, alias="X-Test-Webhook"),
):
    """Gateway callback — no auth token, trust comes from the signature.

    Live mode (PAYMENT_WEBHOOK_SECRET set): requires a valid HMAC-SHA256
    signature of the raw body in X-Webhook-Signature.
    Test mode: requires X-Test-Webhook: local.
    """
    raw_body = await request.body()
    try:
        payload = WebhookPaymentIn.model_validate(json.loads(raw_body or b"{}"))
    except Exception:
        raise AppError("Invalid webhook payload")
    order, payment = await PaymentService(db).apply_webhook(
        raw_body, signature, test_header, payload
    )
    return success_response(
        PayInitOut(
            order=OrderOut.model_validate(order),
            payment=PaymentOut.model_validate(payment),
        ).model_dump(mode="json"),
        message="Webhook processed",
    )
