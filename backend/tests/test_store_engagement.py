from httpx import AsyncClient
from sqlalchemy import select

from app.models.role import Role, RoleName, UserRole
from app.models.user import User
from tests.conftest import TestSessionLocal


async def _register(client: AsyncClient, username: str, email: str) -> dict:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "username": username,
            "password": "Password123",
            "full_name": username.replace("_", " ").title(),
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]


def _auth_header(data: dict) -> dict:
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _make_admin(username: str) -> None:
    async with TestSessionLocal() as session:
        user = (
            await session.execute(select(User).where(User.username == username))
        ).scalar_one()
        role = (
            await session.execute(select(Role).where(Role.name == RoleName.ADMIN.value))
        ).scalar_one()
        session.add(UserRole(user_id=user.id, role_id=role.id))
        await session.commit()


async def _make_product(client: AsyncClient, admin: dict) -> dict:
    response = await client.post(
        "/api/v1/store/products",
        json={
            "name": "Pro Jersey",
            "slug": "pro-jersey",
            "category": "APPAREL",
            "price": 99900,
            "mrp": 129900,
            "stock": 10,
        },
        headers=_auth_header(admin),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_store_product_crud_and_order_flow(client: AsyncClient):
    admin = await _register(client, "shop_admin", "shop_admin@example.com")
    await _make_admin("shop_admin")
    buyer = await _register(client, "shop_buyer", "shop_buyer@example.com")

    product = await _make_product(client, admin)
    assert product["stock"] == 10

    # Non-admin cannot create products.
    denied = await client.post(
        "/api/v1/store/products",
        json={"name": "X", "slug": "x", "price": 100, "stock": 1},
        headers=_auth_header(buyer),
    )
    assert denied.status_code == 403

    listed = await client.get("/api/v1/store/products")
    assert listed.json()["data"]["total"] == 1

    order_resp = await client.post(
        "/api/v1/store/orders",
        json={"items": [{"product_id": product["id"], "quantity": 2}]},
        headers=_auth_header(buyer),
    )
    assert order_resp.status_code == 200, order_resp.text
    assert order_resp.json()["data"]["total"] == 99900 * 2

    history = await client.get("/api/v1/store/orders/me", headers=_auth_header(buyer))
    assert history.json()["data"]["total"] == 1

    # Stock decremented.
    after = await client.get(f"/api/v1/store/products/{product['id']}")
    assert after.json()["data"]["stock"] == 8

    # Oversell rejected.
    oversell = await client.post(
        "/api/v1/store/orders",
        json={"items": [{"product_id": product["id"], "quantity": 99}]},
        headers=_auth_header(buyer),
    )
    assert oversell.status_code == 400


async def test_membership_subscribe_flow(client: AsyncClient):
    user = await _register(client, "pro_fan", "pro_fan@example.com")

    plans = await client.get("/api/v1/memberships/plans", headers=_auth_header(user))
    assert plans.status_code == 200
    codes = {p["code"] for p in plans.json()["data"]}
    assert {"PRO_YEARLY", "PRO_LIFETIME"} <= codes

    empty = await client.get("/api/v1/memberships/me", headers=_auth_header(user))
    assert empty.json()["data"] is None

    sub = await client.post(
        "/api/v1/memberships/subscribe",
        json={"plan_code": "PRO_YEARLY"},
        headers=_auth_header(user),
    )
    assert sub.status_code == 200, sub.text
    assert sub.json()["data"]["plan_code"] == "PRO_YEARLY"

    me = await client.get("/api/v1/memberships/me", headers=_auth_header(user))
    assert me.json()["data"]["status"] == "ACTIVE"

    bad = await client.post(
        "/api/v1/memberships/subscribe",
        json={"plan_code": "NOPE"},
        headers=_auth_header(user),
    )
    assert bad.status_code == 400


async def test_notifications_looking_directory_reports(client: AsyncClient):
    alice = await _register(client, "enga_alice", "enga_alice@example.com")
    admin = await _register(client, "enga_admin", "enga_admin@example.com")
    await _make_admin("enga_admin")

    prefs = await client.get(
        "/api/v1/notifications/preferences", headers=_auth_header(alice)
    )
    assert prefs.status_code == 200
    assert prefs.json()["data"]["push_enabled"] is True

    updated = await client.patch(
        "/api/v1/notifications/preferences",
        json={"marketing": True},
        headers=_auth_header(alice),
    )
    assert updated.json()["data"]["marketing"] is True

    post = await client.post(
        "/api/v1/looking/posts",
        json={"category": "TEAM", "title": "Need fast bowler", "city": "Delhi"},
        headers=_auth_header(alice),
    )
    assert post.status_code == 200, post.text

    posts = await client.get("/api/v1/looking/posts?category=TEAM")
    assert posts.json()["data"]["total"] == 1

    listing = await client.post(
        "/api/v1/community/listings",
        json={"category": "ACADEMY", "name": "Star Academy", "city": "Mumbai"},
        headers=_auth_header(alice),
    )
    assert listing.status_code == 200, listing.text
    listing_id = listing.json()["data"]["id"]

    got = await client.get(f"/api/v1/community/listings/{listing_id}")
    assert got.json()["data"]["name"] == "Star Academy"

    # Owner cannot self-verify; admin can.
    self_verify = await client.patch(
        f"/api/v1/community/listings/{listing_id}",
        json={"is_verified": True},
        headers=_auth_header(alice),
    )
    assert self_verify.status_code == 403
    admin_verify = await client.patch(
        f"/api/v1/community/listings/{listing_id}",
        json={"is_verified": True},
        headers=_auth_header(admin),
    )
    assert admin_verify.json()["data"]["is_verified"] is True

    report = await client.post(
        "/api/v1/reports",
        json={"target_type": "listing", "target_id": listing_id, "reason": "spam"},
        headers=_auth_header(alice),
    )
    assert report.status_code == 200, report.text

    denied = await client.get("/api/v1/reports", headers=_auth_header(alice))
    assert denied.status_code == 403
    listed = await client.get("/api/v1/reports", headers=_auth_header(admin))
    assert listed.json()["data"]["total"] == 1


async def test_dm_flow_and_leaderboards(client: AsyncClient):
    alice = await _register(client, "dm_alice", "dm_alice@example.com")
    bob = await _register(client, "dm_bob", "dm_bob@example.com")

    convo = await client.post(
        "/api/v1/dm/conversations",
        json={"member_ids": [bob["user"]["id"]]},
        headers=_auth_header(alice),
    )
    assert convo.status_code == 200, convo.text
    convo_id = convo.json()["data"]["id"]

    sent = await client.post(
        f"/api/v1/dm/conversations/{convo_id}/messages",
        json={"body": "Hello!"},
        headers=_auth_header(alice),
    )
    assert sent.status_code == 200, sent.text

    inbox = await client.get(
        f"/api/v1/dm/conversations/{convo_id}/messages",
        headers=_auth_header(bob),
    )
    assert inbox.json()["data"]["total"] == 1
    assert inbox.json()["data"]["items"][0]["body"] == "Hello!"

    teams_lb = await client.get("/api/v1/leaderboards/teams")
    assert teams_lb.status_code == 200
    assert "items" in teams_lb.json()["data"]

    players_lb = await client.get("/api/v1/leaderboards/players?category=batting")
    assert players_lb.status_code == 200
    bowling_lb = await client.get("/api/v1/leaderboards/players?category=bowling")
    assert bowling_lb.status_code == 200


async def test_admin_overview_reflects_new_modules(client: AsyncClient):
    admin = await _register(client, "ov_admin", "ov_admin@example.com")
    await _make_admin("ov_admin")
    buyer = await _register(client, "ov_buyer", "ov_buyer@example.com")

    await _make_product(client, admin)
    products = await client.get("/api/v1/store/products")
    pid = products.json()["data"]["items"][0]["id"]
    await client.post(
        "/api/v1/store/orders",
        json={"items": [{"product_id": pid, "quantity": 1}]},
        headers=_auth_header(buyer),
    )
    await client.post(
        "/api/v1/memberships/subscribe",
        json={"plan_code": "PRO_LIFETIME"},
        headers=_auth_header(buyer),
    )

    overview = await client.get("/api/v1/admin/overview", headers=_auth_header(admin))
    assert overview.status_code == 200, overview.text
    body = overview.json()["data"]
    assert body["total_users"] >= 2
    assert body["pro_users"] >= 1
    assert body["orders_today"] >= 1
    assert body["revenue"] > 0
