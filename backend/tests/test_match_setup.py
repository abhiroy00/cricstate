from httpx import AsyncClient


async def _register(client: AsyncClient, username: str) -> dict:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": f"{username}@example.com",
            "username": username,
            "password": "Password123",
            "full_name": username.title(),
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]


def _auth(data: dict) -> dict:
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _create_team(client: AsyncClient, user: dict, name: str) -> dict:
    response = await client.post("/api/v1/teams", json={"name": name}, headers=_auth(user))
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def _add_player(client: AsyncClient, user: dict, team_id: str, name: str) -> dict:
    response = await client.post(
        f"/api/v1/teams/{team_id}/roster",
        json={"new_player_full_name": name},
        headers=_auth(user),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]["player"]


async def _create_match(client: AsyncClient, user: dict, a: dict, b: dict, **extra) -> dict:
    payload = {
        "team_a_id": a["id"],
        "team_b_id": b["id"],
        "match_type": "LIMITED_OVERS",
        "overs_limit": 5,
        **extra,
    }
    response = await client.post("/api/v1/matches", json=payload, headers=_auth(user))
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_create_match_persists_setup_fields(client: AsyncClient):
    user = await _register(client, "setup1")
    a = await _create_team(client, user, "Alpha")
    b = await _create_team(client, user, "Bravo")

    data = await _create_match(
        client,
        user,
        a,
        b,
        ball_type="TENNIS",
        overs_per_bowler=1,
        powerplay_overs=2,
        pitch_type="TURF",
        wagon_wheel=True,
        officials="Umpire X",
        city="Begusarai",
        venue="Khodawanpur",
    )

    assert data["ball_type"] == "TENNIS"
    assert data["overs_per_bowler"] == 1
    assert data["powerplay_overs"] == 2
    assert data["pitch_type"] == "TURF"
    assert data["wagon_wheel"] is True
    assert data["city"] == "Begusarai"
    assert data["venue"] == "Khodawanpur"


async def test_set_and_get_lineups(client: AsyncClient):
    user = await _register(client, "setup2")
    a = await _create_team(client, user, "Alpha2")
    b = await _create_team(client, user, "Bravo2")
    p1 = await _add_player(client, user, a["id"], "Ravi")
    p2 = await _add_player(client, user, a["id"], "Sam")
    match = await _create_match(client, user, a, b)

    response = await client.put(
        f"/api/v1/matches/{match['id']}/lineups",
        json={"team_id": a["id"], "players": [p1["id"], p2["id"]]},
        headers=_auth(user),
    )
    assert response.status_code == 200, response.text
    saved = response.json()["data"]
    assert {e["player"]["id"] for e in saved} == {p1["id"], p2["id"]}
    assert all(e["is_playing_xi"] for e in saved)

    listing = await client.get(f"/api/v1/matches/{match['id']}/lineups")
    assert listing.status_code == 200
    assert len(listing.json()["data"]) == 2


async def test_lineup_rejects_non_roster_player(client: AsyncClient):
    user = await _register(client, "setup3")
    a = await _create_team(client, user, "Alpha3")
    b = await _create_team(client, user, "Bravo3")
    outsider = await _create_team(client, user, "Outsiders")
    intruder = await _add_player(client, user, outsider["id"], "NotInAlpha")
    match = await _create_match(client, user, a, b)

    response = await client.put(
        f"/api/v1/matches/{match['id']}/lineups",
        json={"team_id": a["id"], "players": [intruder["id"]]},
        headers=_auth(user),
    )
    assert response.status_code == 400
