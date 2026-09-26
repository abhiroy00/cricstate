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


async def test_profile_includes_mobile_ui_fields(client: AsyncClient):
    user = await _register(client, "ui_hero", "ui_hero@example.com")

    response = await client.get("/api/v1/profiles/me", headers=_auth_header(user))
    assert response.status_code == 200
    body = response.json()["data"]
    # Fields consumed by mobile ProfileScreen.
    for field in (
        "email",
        "phone",
        "playing_role",
        "batting_style",
        "bowling_style",
        "dob",
        "profile_views",
        "profile_completion_percent",
    ):
        assert field in body, f"missing {field}"
    assert body["email"] == "ui_hero@example.com"
    assert body["dob"] is None
    assert body["profile_views"] == 0


async def test_profile_update_cricket_fields_and_dob_alias(client: AsyncClient):
    user = await _register(client, "ui_editor", "ui_editor@example.com")

    response = await client.patch(
        "/api/v1/profiles/me",
        json={
            "playing_role": "ALL_ROUNDER",
            "batting_style": "Right-hand bat",
            "bowling_style": "Right-arm medium",
            "dob": "2003-04-24",
            "gender": "Male",
            "city": "New Bongaigaon Railway Colony",
        },
        headers=_auth_header(user),
    )
    assert response.status_code == 200, response.text
    body = response.json()["data"]
    assert body["playing_role"] == "ALL_ROUNDER"
    assert body["batting_style"] == "Right-hand bat"
    assert body["bowling_style"] == "Right-arm medium"
    assert body["dob"] == "2003-04-24"
    assert body["date_of_birth"] == "2003-04-24"
    assert body["profile_completion_percent"] > 0


async def test_profile_views_increment_on_foreign_view(client: AsyncClient):
    alice = await _register(client, "ui_alice", "ui_alice@example.com")
    bob = await _register(client, "ui_bob", "ui_bob@example.com")
    bob_id = bob["user"]["id"]

    first = await client.get(f"/api/v1/profiles/{bob_id}", headers=_auth_header(alice))
    assert first.status_code == 200
    assert first.json()["data"]["profile_views"] == 1

    second = await client.get(f"/api/v1/profiles/{bob_id}", headers=_auth_header(alice))
    assert second.json()["data"]["profile_views"] == 2

    # Own view does not inflate the counter.
    own = await client.get("/api/v1/profiles/me", headers=_auth_header(bob))
    assert own.json()["data"]["profile_views"] == 2


async def test_home_feed_shape(client: AsyncClient):
    response = await client.get("/api/v1/home/feed")
    assert response.status_code == 200, response.text
    body = response.json()["data"]
    for key in (
        "live_matches",
        "upcoming_matches",
        "recent_results",
        "suggested_cricketers",
        "counts",
    ):
        assert key in body


async def test_admin_overview_requires_admin(client: AsyncClient):
    regular = await _register(client, "ui_regular", "ui_regular@example.com")
    denied = await client.get("/api/v1/admin/overview", headers=_auth_header(regular))
    assert denied.status_code == 403

    admin = await _register(client, "ui_admin", "ui_admin@example.com")
    await _make_admin("ui_admin")
    # NOTE: JWT is minted at login/register time; role check reads the DB per
    # request via get_current_user, so the freshly granted ADMIN applies.
    response = await client.get("/api/v1/admin/overview", headers=_auth_header(admin))
    assert response.status_code == 200, response.text
    body = response.json()["data"]
    for key in (
        "total_users",
        "total_matches",
        "live_matches",
        "total_tournaments",
        "total_teams",
        "total_players",
    ):
        assert key in body


async def test_websocket_route_registered(client: AsyncClient):
    # httpx AsyncClient cannot do WS handshakes; assert the route exists via
    # OpenAPI-registered paths on the ASGI app instead of a real dial.
    from app.main import app

    ws_paths = [
        r.path for r in app.routes if getattr(r, "path", "") == "/ws/matches/{match_id}"
    ]
    assert ws_paths, "WS route /ws/matches/{match_id} not registered"
