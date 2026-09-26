from httpx import AsyncClient
from sqlalchemy import select

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


async def _create_player(
    client: AsyncClient, user: dict, full_name: str, role: str = "BATSMAN", user_id: str | None = None
) -> dict:
    response = await client.post(
        "/api/v1/players",
        json={"full_name": full_name, "role": role, "user_id": user_id},
        headers=_auth_header(user),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def _create_team(client: AsyncClient, user: dict, name: str) -> dict:
    response = await client.post("/api/v1/teams", json={"name": name}, headers=_auth_header(user))
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def _create_tournament(client: AsyncClient, user: dict, name: str) -> dict:
    response = await client.post(
        "/api/v1/tournaments",
        json={"name": name, "format": "LEAGUE"},
        headers=_auth_header(user),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def _create_match(client: AsyncClient, user: dict, team_a: str, team_b: str) -> dict:
    response = await client.post(
        "/api/v1/matches",
        json={
            "team_a_id": team_a,
            "team_b_id": team_b,
            "match_type": "T20",
            "overs_limit": 20,
        },
        headers=_auth_header(user),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_mycricket_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/mycricket")
    assert response.status_code == 401
    assert response.json()["success"] is False


async def test_mycricket_rejects_invalid_token(client: AsyncClient):
    response = await client.get(
        "/api/v1/mycricket", headers={"Authorization": "Bearer not-a-real-token"}
    )
    assert response.status_code == 401


async def test_mycricket_rejects_refresh_token_as_access(client: AsyncClient):
    user = await _register(client, "mc_refresh", "mc_refresh@example.com")
    refresh_token = user["refresh_token"]

    # A valid refresh JWT must not be accepted where an access token is required.
    response = await client.get(
        "/api/v1/mycricket", headers={"Authorization": f"Bearer {refresh_token}"}
    )
    assert response.status_code == 401


async def test_mycricket_rejects_blocked_user(client: AsyncClient):
    user = await _register(client, "mc_blocked", "mc_blocked@example.com")
    headers = _auth_header(user)

    ok = await client.get("/api/v1/mycricket", headers=headers)
    assert ok.status_code == 200

    async with TestSessionLocal() as session:
        db_user = (
            await session.execute(
                select(User).where(User.username == "mc_blocked")
            )
        ).scalar_one()
        db_user.is_blocked = True
        await session.commit()

    blocked = await client.get("/api/v1/mycricket", headers=headers)
    assert blocked.status_code == 401


async def test_mycricket_accepts_valid_token(client: AsyncClient):
    user = await _register(client, "mc_valid", "mc_valid@example.com")
    response = await client.get("/api/v1/mycricket", headers=_auth_header(user))
    assert response.status_code == 200
    assert response.json()["data"]["user_id"] == user["user"]["id"]


async def test_mycricket_empty_for_new_user(client: AsyncClient):
    user = await _register(client, "mc_new", "mc_new@example.com")

    response = await client.get("/api/v1/mycricket", headers=_auth_header(user))
    assert response.status_code == 200, response.text
    body = response.json()["data"]

    assert body["user_id"] == user["user"]["id"]
    assert body["teams"] == []
    assert body["player"] is None
    assert body["stats"] is None
    assert body["matches"] == {"your": [], "played": [], "live": []}
    assert body["tournaments"] == {"organized": [], "participating": []}
    assert body["highlights"] == {"count": 0, "items": []}
    assert body["counts"] == {
        "matches": 0,
        "played_matches": 0,
        "live_matches": 0,
        "tournaments": 0,
        "teams": 0,
    }


async def test_mycricket_aggregates_user_data(client: AsyncClient):
    alice = await _register(client, "mc_alice", "mc_alice@example.com")
    bob = await _register(client, "mc_bob", "mc_bob@example.com")

    player = await _create_player(
        client, alice, "Alice Striker", user_id=alice["user"]["id"]
    )
    alice_team = await _create_team(client, alice, "Alice XI")
    bob_team = await _create_team(client, bob, "Bob XI")
    bob_team_2 = await _create_team(client, bob, "Bob XI B")

    # Alice creates one match, Bob creates another featuring Alice's team.
    await _create_match(client, alice, alice_team["id"], bob_team["id"])
    await _create_match(client, bob, bob_team["id"], alice_team["id"])
    # A match with none of Alice's teams must stay out of her overview.
    await _create_match(client, bob, bob_team["id"], bob_team_2["id"])

    alice_tournament = await _create_tournament(client, alice, "Alice Cup")
    bob_tournament = await _create_tournament(client, bob, "Bob Cup")
    register = await client.post(
        f"/api/v1/tournaments/{bob_tournament['id']}/teams",
        json={"team_id": alice_team["id"]},
        headers=_auth_header(alice),
    )
    assert register.status_code == 200, register.text

    response = await client.get("/api/v1/mycricket", headers=_auth_header(alice))
    assert response.status_code == 200, response.text
    body = response.json()["data"]

    assert [t["id"] for t in body["teams"]] == [alice_team["id"]]
    assert body["player"]["id"] == player["id"]

    your_ids = {m["id"] for m in body["matches"]["your"]}
    assert len(your_ids) == 2
    for match in body["matches"]["your"]:
        assert alice_team["id"] in (match["team_a"]["id"], match["team_b"]["id"])

    assert [t["id"] for t in body["tournaments"]["organized"]] == [alice_tournament["id"]]
    assert [t["id"] for t in body["tournaments"]["participating"]] == [bob_tournament["id"]]

    assert body["stats"]["player_id"] == player["id"]
    assert body["stats"]["matches_played"] == 0
    assert body["counts"] == {
        "matches": 2,
        "played_matches": 0,
        "live_matches": 0,
        "tournaments": 2,
        "teams": 1,
    }


async def test_mycricket_excludes_other_users_data(client: AsyncClient):
    alice = await _register(client, "mc_alice2", "mc_alice2@example.com")
    bob = await _register(client, "mc_bob2", "mc_bob2@example.com")

    await _create_team(client, alice, "Alice Only XI")
    bob_team = await _create_team(client, bob, "Bob Only XI")
    bob_team_2 = await _create_team(client, bob, "Bob Only XI B")
    await _create_tournament(client, bob, "Bob Invitational")
    await _create_match(client, bob, bob_team["id"], bob_team_2["id"])

    response = await client.get("/api/v1/mycricket", headers=_auth_header(bob))
    assert response.status_code == 200
    body = response.json()["data"]

    assert {t["name"] for t in body["teams"]} == {"Bob Only XI", "Bob Only XI B"}
    assert len(body["matches"]["your"]) == 1
    assert [t["name"] for t in body["tournaments"]["organized"]] == ["Bob Invitational"]
