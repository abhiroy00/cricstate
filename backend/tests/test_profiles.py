from httpx import AsyncClient


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


async def test_get_my_profile_creates_lazily(client: AsyncClient):
    user = await _register(client, "alice", "alice@example.com")

    response = await client.get("/api/v1/profiles/me", headers=_auth_header(user))
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["username"] == "alice"
    assert body["data"]["bio"] is None
    assert body["data"]["followers_count"] == 0


async def test_update_my_profile(client: AsyncClient):
    user = await _register(client, "bob", "bob@example.com")

    response = await client.patch(
        "/api/v1/profiles/me",
        json={"bio": "Fast bowler", "city": "Mumbai"},
        headers=_auth_header(user),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["bio"] == "Fast bowler"
    assert body["data"]["city"] == "Mumbai"


async def test_get_public_profile_by_id(client: AsyncClient):
    user = await _register(client, "carol", "carol@example.com")

    response = await client.get(f"/api/v1/profiles/{user['user']['id']}")
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["username"] == "carol"
    assert body["data"]["is_following"] is False


async def test_get_public_profile_unknown_user_404(client: AsyncClient):
    response = await client.get("/api/v1/profiles/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404


async def test_follow_and_unfollow_flow(client: AsyncClient):
    alice = await _register(client, "alice2", "alice2@example.com")
    bob = await _register(client, "bob2", "bob2@example.com")
    bob_id = bob["user"]["id"]

    follow_response = await client.post(
        f"/api/v1/profiles/{bob_id}/follow", headers=_auth_header(alice)
    )
    assert follow_response.status_code == 200

    bob_profile = await client.get(f"/api/v1/profiles/{bob_id}", headers=_auth_header(alice))
    assert bob_profile.json()["data"]["followers_count"] == 1
    assert bob_profile.json()["data"]["is_following"] is True

    followers = await client.get(f"/api/v1/profiles/{bob_id}/followers")
    assert followers.json()["data"]["total"] == 1
    assert followers.json()["data"]["items"][0]["username"] == "alice2"

    following = await client.get(
        f"/api/v1/profiles/{alice['user']['id']}/following"
    )
    assert following.json()["data"]["total"] == 1
    assert following.json()["data"]["items"][0]["username"] == "bob2"

    unfollow_response = await client.delete(
        f"/api/v1/profiles/{bob_id}/follow", headers=_auth_header(alice)
    )
    assert unfollow_response.status_code == 200

    bob_profile_after = await client.get(f"/api/v1/profiles/{bob_id}", headers=_auth_header(alice))
    assert bob_profile_after.json()["data"]["followers_count"] == 0


async def test_duplicate_follow_rejected(client: AsyncClient):
    alice = await _register(client, "alice3", "alice3@example.com")
    bob = await _register(client, "bob3", "bob3@example.com")
    bob_id = bob["user"]["id"]

    first = await client.post(f"/api/v1/profiles/{bob_id}/follow", headers=_auth_header(alice))
    assert first.status_code == 200

    second = await client.post(f"/api/v1/profiles/{bob_id}/follow", headers=_auth_header(alice))
    assert second.status_code == 409


async def test_unfollow_when_not_following_404(client: AsyncClient):
    alice = await _register(client, "alice4", "alice4@example.com")
    bob = await _register(client, "bob4", "bob4@example.com")

    response = await client.delete(
        f"/api/v1/profiles/{bob['user']['id']}/follow", headers=_auth_header(alice)
    )
    assert response.status_code == 404


async def test_self_follow_rejected(client: AsyncClient):
    alice = await _register(client, "alice5", "alice5@example.com")

    response = await client.post(
        f"/api/v1/profiles/{alice['user']['id']}/follow", headers=_auth_header(alice)
    )
    assert response.status_code == 400


async def test_follow_requires_auth(client: AsyncClient):
    bob = await _register(client, "bob5", "bob5@example.com")

    response = await client.post(f"/api/v1/profiles/{bob['user']['id']}/follow")
    assert response.status_code == 401
