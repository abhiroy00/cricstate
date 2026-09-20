from httpx import AsyncClient

VALID_USER = {
    "email": "player1@example.com",
    "username": "player_one",
    "password": "Password123",
    "full_name": "Player One",
}


async def _register(client: AsyncClient, **overrides) -> dict:
    payload = {**VALID_USER, **overrides}
    response = await client.post("/api/v1/auth/register", json=payload)
    return response


async def test_register_success(client: AsyncClient):
    response = await _register(client)
    body = response.json()

    assert response.status_code == 201
    assert body["success"] is True
    assert body["data"]["user"]["email"] == VALID_USER["email"]
    assert "USER" in body["data"]["user"]["roles"]
    assert body["data"]["access_token"]
    assert body["data"]["refresh_token"]


async def test_register_duplicate_email_rejected(client: AsyncClient):
    await _register(client)
    response = await _register(client, username="another_user")

    assert response.status_code == 409
    assert response.json()["success"] is False


async def test_register_duplicate_username_rejected(client: AsyncClient):
    await _register(client)
    response = await _register(client, email="other@example.com")

    assert response.status_code == 409


async def test_register_weak_password_rejected(client: AsyncClient):
    response = await _register(client, password="short", email="weak@example.com", username="weakpass")

    assert response.status_code == 422


async def test_login_success(client: AsyncClient):
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": VALID_USER["email"], "password": VALID_USER["password"]},
    )
    body = response.json()

    assert response.status_code == 200
    assert body["success"] is True
    assert body["data"]["access_token"]


async def test_login_with_username_works(client: AsyncClient):
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": VALID_USER["username"], "password": VALID_USER["password"]},
    )
    assert response.status_code == 200


async def test_login_wrong_password_rejected(client: AsyncClient):
    await _register(client)
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": VALID_USER["email"], "password": "WrongPass123"},
    )

    assert response.status_code == 401
    assert response.json()["success"] is False


async def test_login_unknown_user_rejected(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/login",
        json={"identifier": "nobody@example.com", "password": "Whatever123"},
    )

    assert response.status_code == 401


async def test_refresh_token_rotates_and_old_token_becomes_invalid(client: AsyncClient):
    register_response = await _register(client)
    old_refresh = register_response.json()["data"]["refresh_token"]

    refresh_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": old_refresh}
    )
    assert refresh_response.status_code == 200
    new_refresh = refresh_response.json()["data"]["refresh_token"]
    assert new_refresh != old_refresh

    reuse_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": old_refresh}
    )
    assert reuse_response.status_code == 401


async def test_logout_revokes_refresh_token(client: AsyncClient):
    register_response = await _register(client)
    data = register_response.json()["data"]
    access_token = data["access_token"]
    refresh_token = data["refresh_token"]

    logout_response = await client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": refresh_token},
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert logout_response.status_code == 200

    reuse_response = await client.post(
        "/api/v1/auth/refresh", json={"refresh_token": refresh_token}
    )
    assert reuse_response.status_code == 401


async def test_get_me_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/users/me")
    assert response.status_code == 401


async def test_get_me_returns_current_user(client: AsyncClient):
    register_response = await _register(client)
    access_token = register_response.json()["data"]["access_token"]

    response = await client.get(
        "/api/v1/users/me", headers={"Authorization": f"Bearer {access_token}"}
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["email"] == VALID_USER["email"]


async def test_get_me_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/users/me", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401
