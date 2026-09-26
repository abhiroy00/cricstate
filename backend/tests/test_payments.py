from httpx import AsyncClient

from tests.test_store_engagement import (
    _auth_header,
    _make_admin,
    _make_product,
    _register,
)


async def _buy_order(client: AsyncClient, buyer: dict, product: dict) -> dict:
    r = await client.post(
        "/api/v1/store/orders",
        json={"items": [{"product_id": product["id"], "quantity": 1}]},
        headers=_auth_header(buyer),
    )
    assert r.status_code == 200, r.text
    return r.json()["data"]


async def test_pay_confirm_cancel_flow(client: AsyncClient):
    admin = await _register(client, "pay_admin", "pay_admin@example.com")
    await _make_admin("pay_admin")
    buyer = await _register(client, "pay_buyer", "pay_buyer@example.com")
    product = await _make_product(client, admin)

    order = await _buy_order(client, buyer, product)
    assert order["status"] == "PENDING"

    # Initiate payment.
    pay = await client.post(
        f"/api/v1/store/orders/{order['id']}/pay", headers=_auth_header(buyer)
    )
    assert pay.status_code == 200, pay.text
    payment = pay.json()["data"]["payment"]
    assert payment["status"] == "INITIATED"
    assert payment["amount"] == order["total"]

    # Stranger cannot pay someone else's order.
    stranger = await _register(client, "pay_stranger", "pay_stranger@example.com")
    denied = await client.post(
        f"/api/v1/store/orders/{order['id']}/pay", headers=_auth_header(stranger)
    )
    assert denied.status_code == 403

    # Test-mode confirm flips order to CONFIRMED.
    done = await client.post(
        f"/api/v1/store/orders/{order['id']}/confirm",
        json={"payment_id": payment["id"]},
        headers=_auth_header(buyer),
    )
    assert done.status_code == 200, done.text
    assert done.json()["data"]["order"]["status"] == "CONFIRMED"
    assert done.json()["data"]["payment"]["status"] == "SUCCESS"

    # Confirmed order can no longer be paid or cancelled.
    again = await client.post(
        f"/api/v1/store/orders/{order['id']}/pay", headers=_auth_header(buyer)
    )
    assert again.status_code == 400
    nodel = await client.post(
        f"/api/v1/store/orders/{order['id']}/cancel", headers=_auth_header(buyer)
    )
    assert nodel.status_code == 400

    # Cancel restores stock.
    order2 = await _buy_order(client, buyer, product)
    cancelled = await client.post(
        f"/api/v1/store/orders/{order2['id']}/cancel", headers=_auth_header(buyer)
    )
    assert cancelled.status_code == 200, cancelled.text
    assert cancelled.json()["data"]["status"] == "CANCELLED"
    detail = await client.get(
        f"/api/v1/store/orders/{order2['id']}", headers=_auth_header(buyer)
    )
    assert detail.json()["data"]["status"] == "CANCELLED"

    # Order detail is private.
    hidden = await client.get(
        f"/api/v1/store/orders/{order2['id']}", headers=_auth_header(stranger)
    )
    assert hidden.status_code == 403


async def test_payment_webhook_test_mode(client: AsyncClient):
    admin = await _register(client, "wh_admin", "wh_admin@example.com")
    await _make_admin("wh_admin")
    buyer = await _register(client, "wh_buyer", "wh_buyer@example.com")
    product = await _make_product(client, admin)
    order = await _buy_order(client, buyer, product)

    pay = await client.post(
        f"/api/v1/store/orders/{order['id']}/pay", headers=_auth_header(buyer)
    )
    ref = pay.json()["data"]["payment"]["provider_ref"]

    # Unsigned webhook rejected in test mode.
    unsigned = await client.post(
        "/api/v1/webhooks/payments",
        json={"provider_ref": ref, "status": "SUCCESS"},
    )
    assert unsigned.status_code == 403

    # Signed-with-test-header webhook confirms the order.
    hooked = await client.post(
        "/api/v1/webhooks/payments",
        json={"provider_ref": ref, "status": "SUCCESS"},
        headers={"X-Test-Webhook": "local"},
    )
    assert hooked.status_code == 200, hooked.text
    assert hooked.json()["data"]["order"]["status"] == "CONFIRMED"

    # Replay is idempotent.
    replay = await client.post(
        "/api/v1/webhooks/payments",
        json={"provider_ref": ref, "status": "SUCCESS"},
        headers={"X-Test-Webhook": "local"},
    )
    assert replay.status_code == 200, replay.text

    # Failed payment keeps the order payable.
    order2 = await _buy_order(client, buyer, product)
    pay2 = await client.post(
        f"/api/v1/store/orders/{order2['id']}/pay", headers=_auth_header(buyer)
    )
    ref2 = pay2.json()["data"]["payment"]["provider_ref"]
    failed = await client.post(
        "/api/v1/webhooks/payments",
        json={"provider_ref": ref2, "status": "FAILED"},
        headers={"X-Test-Webhook": "local"},
    )
    assert failed.status_code == 200, failed.text
    assert failed.json()["data"]["payment"]["status"] == "FAILED"
    detail = await client.get(
        f"/api/v1/store/orders/{order2['id']}", headers=_auth_header(buyer)
    )
    assert detail.json()["data"]["status"] == "PENDING"

    # Unknown ref → 404.
    missing = await client.post(
        "/api/v1/webhooks/payments",
        json={"provider_ref": "test_nope", "status": "SUCCESS"},
        headers={"X-Test-Webhook": "local"},
    )
    assert missing.status_code == 404
