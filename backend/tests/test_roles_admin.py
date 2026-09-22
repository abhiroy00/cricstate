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
    """Test-only shortcut: grant ADMIN directly in the DB, since there's no
    bootstrap-admin flow wired into the shared `client` fixture."""
    async with TestSessionLocal() as session:
        user = (
            await session.execute(select(User).where(User.username == username))
        ).scalar_one()
        role = (
            await session.execute(select(Role).where(Role.name == RoleName.ADMIN.value))
        ).scalar_one()
        session.add(UserRole(user_id=user.id, role_id=role.id))
        await session.commit()


async def test_admin_can_assign_role(client: AsyncClient):
    admin = await _register(client, "admin_user", "admin_user@example.com")
    await _make_admin("admin_user")
    target = await _register(client, "target_user", "target_user@example.com")

    response = await client.post(
        f"/api/v1/users/{target['user']['id']}/roles/PLAYER", headers=_auth_header(admin)
    )
    body = response.json()

    assert response.status_code == 200
    assert "PLAYER" in body["data"]["roles"]


async def test_non_admin_cannot_assign_role(client: AsyncClient):
    regular = await _register(client, "regular_user", "regular_user@example.com")
    target = await _register(client, "target_user2", "target_user2@example.com")

    response = await client.post(
        f"/api/v1/users/{target['user']['id']}/roles/PLAYER", headers=_auth_header(regular)
    )
    assert response.status_code == 403


async def test_assign_duplicate_role_rejected(client: AsyncClient):
    admin = await _register(client, "admin_user2", "admin_user2@example.com")
    await _make_admin("admin_user2")
    target = await _register(client, "target_user3", "target_user3@example.com")

    first = await client.post(
        f"/api/v1/users/{target['user']['id']}/roles/PLAYER", headers=_auth_header(admin)
    )
    assert first.status_code == 200

    second = await client.post(
        f"/api/v1/users/{target['user']['id']}/roles/PLAYER", headers=_auth_header(admin)
    )
    assert second.status_code == 409


async def test_admin_can_revoke_role(client: AsyncClient):
    admin = await _register(client, "admin_user3", "admin_user3@example.com")
    await _make_admin("admin_user3")
    target = await _register(client, "target_user4", "target_user4@example.com")

    await client.post(
        f"/api/v1/users/{target['user']['id']}/roles/PLAYER", headers=_auth_header(admin)
    )
    response = await client.delete(
        f"/api/v1/users/{target['user']['id']}/roles/PLAYER", headers=_auth_header(admin)
    )
    body = response.json()

    assert response.status_code == 200
    assert "PLAYER" not in body["data"]["roles"]


async def test_revoke_role_user_does_not_have_404(client: AsyncClient):
    admin = await _register(client, "admin_user4", "admin_user4@example.com")
    await _make_admin("admin_user4")
    target = await _register(client, "target_user5", "target_user5@example.com")

    response = await client.delete(
        f"/api/v1/users/{target['user']['id']}/roles/ORGANIZER", headers=_auth_header(admin)
    )
    assert response.status_code == 404
