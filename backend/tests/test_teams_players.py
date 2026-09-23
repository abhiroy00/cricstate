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


async def _create_player(client: AsyncClient, user: dict, full_name: str, role: str = "BATSMAN") -> dict:
    response = await client.post(
        "/api/v1/players",
        json={"full_name": full_name, "role": role},
        headers=_auth_header(user),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def _create_team(client: AsyncClient, user: dict, name: str) -> dict:
    response = await client.post("/api/v1/teams", json={"name": name}, headers=_auth_header(user))
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_create_player(client: AsyncClient):
    owner = await _register(client, "owner1", "owner1@example.com")
    player = await _create_player(client, owner, "Virat K", "BATSMAN")
    assert player["full_name"] == "Virat K"
    assert player["role"] == "BATSMAN"
    assert player["user_id"] is None


async def test_create_team(client: AsyncClient):
    owner = await _register(client, "owner2", "owner2@example.com")
    team = await _create_team(client, owner, "Mumbai XI")
    assert team["name"] == "Mumbai XI"
    assert team["player_count"] == 0


async def test_add_existing_player_to_team(client: AsyncClient):
    owner = await _register(client, "owner3", "owner3@example.com")
    team = await _create_team(client, owner, "Delhi XI")
    player = await _create_player(client, owner, "Rohit S")

    response = await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"player_id": player["id"], "jersey_number": 45},
        headers=_auth_header(owner),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["player"]["id"] == player["id"]
    assert body["data"]["jersey_number"] == 45


async def test_add_new_player_inline_to_team(client: AsyncClient):
    owner = await _register(client, "owner4", "owner4@example.com")
    team = await _create_team(client, owner, "Chennai XI")

    response = await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"new_player_full_name": "MS Dhoni", "new_player_role": "WICKET_KEEPER"},
        headers=_auth_header(owner),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["player"]["full_name"] == "MS Dhoni"

    roster = await client.get(f"/api/v1/teams/{team['id']}/roster")
    assert roster.json()["data"][0]["player"]["full_name"] == "MS Dhoni"


async def test_duplicate_player_on_roster_rejected(client: AsyncClient):
    owner = await _register(client, "owner5", "owner5@example.com")
    team = await _create_team(client, owner, "Kolkata XI")
    player = await _create_player(client, owner, "Shreyas I")

    first = await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"player_id": player["id"]},
        headers=_auth_header(owner),
    )
    assert first.status_code == 200

    second = await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"player_id": player["id"]},
        headers=_auth_header(owner),
    )
    assert second.status_code == 400


async def test_set_captain(client: AsyncClient):
    owner = await _register(client, "owner6", "owner6@example.com")
    team = await _create_team(client, owner, "Punjab XI")
    player = await _create_player(client, owner, "KL Rahul")
    await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"player_id": player["id"]},
        headers=_auth_header(owner),
    )

    response = await client.patch(
        f"/api/v1/teams/{team['id']}/roster/{player['id']}",
        json={"is_captain": True},
        headers=_auth_header(owner),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["is_captain"] is True


async def test_remove_player_from_roster(client: AsyncClient):
    owner = await _register(client, "owner7", "owner7@example.com")
    team = await _create_team(client, owner, "Rajasthan XI")
    player = await _create_player(client, owner, "Sanju S")
    await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"player_id": player["id"]},
        headers=_auth_header(owner),
    )

    response = await client.delete(
        f"/api/v1/teams/{team['id']}/roster/{player['id']}", headers=_auth_header(owner)
    )
    assert response.status_code == 200

    roster = await client.get(f"/api/v1/teams/{team['id']}/roster")
    assert roster.json()["data"] == []


async def test_non_owner_cannot_update_team(client: AsyncClient):
    owner = await _register(client, "owner8", "owner8@example.com")
    intruder = await _register(client, "intruder1", "intruder1@example.com")
    team = await _create_team(client, owner, "Hyderabad XI")

    response = await client.patch(
        f"/api/v1/teams/{team['id']}", json={"name": "Hacked"}, headers=_auth_header(intruder)
    )
    assert response.status_code == 403


async def test_non_owner_cannot_add_player_to_team(client: AsyncClient):
    owner = await _register(client, "owner9", "owner9@example.com")
    intruder = await _register(client, "intruder2", "intruder2@example.com")
    team = await _create_team(client, owner, "Bangalore XI")

    response = await client.post(
        f"/api/v1/teams/{team['id']}/roster",
        json={"new_player_full_name": "Intruder Player"},
        headers=_auth_header(intruder),
    )
    assert response.status_code == 403


async def test_get_my_player(client: AsyncClient):
    owner = await _register(client, "owner10", "owner10@example.com")

    missing = await client.get("/api/v1/players/me", headers=_auth_header(owner))
    assert missing.status_code == 404

    create = await client.post(
        "/api/v1/players",
        json={"full_name": "Self Linked", "role": "BATSMAN", "user_id": owner["user"]["id"]},
        headers=_auth_header(owner),
    )
    assert create.status_code == 200

    response = await client.get("/api/v1/players/me", headers=_auth_header(owner))
    assert response.status_code == 200
    assert response.json()["data"]["full_name"] == "Self Linked"


async def test_list_teams_created_by_filter(client: AsyncClient):
    owner = await _register(client, "owner11", "owner11@example.com")
    other = await _register(client, "owner12", "owner12@example.com")
    await _create_team(client, owner, "Owner11 XI")
    await _create_team(client, other, "Owner12 XI")

    response = await client.get(
        "/api/v1/teams", params={"created_by": owner["user"]["id"]}
    )
    body = response.json()["data"]["items"]

    assert response.status_code == 200
    assert len(body) == 1
    assert body[0]["name"] == "Owner11 XI"


async def test_list_opponent_teams(client: AsyncClient):
    owner = await _register(client, "owner13", "owner13@example.com")
    rival = await _register(client, "owner14", "owner14@example.com")
    my_team = await _create_team(client, owner, "Owner13 XI")
    rival_team = await _create_team(client, rival, "Owner14 XI")

    match = await client.post(
        "/api/v1/matches",
        json={
            "team_a_id": my_team["id"],
            "team_b_id": rival_team["id"],
            "match_type": "T20",
            "overs_limit": 20,
        },
        headers=_auth_header(owner),
    )
    assert match.status_code == 200

    response = await client.get("/api/v1/teams/opponents", headers=_auth_header(owner))
    body = response.json()["data"]

    assert response.status_code == 200
    assert len(body) == 1
    assert body[0]["name"] == "Owner14 XI"
