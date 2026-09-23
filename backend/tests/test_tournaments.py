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


async def _create_team(client: AsyncClient, user: dict, name: str) -> dict:
    response = await client.post("/api/v1/teams", json={"name": name}, headers=_auth_header(user))
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_create_tournament(client: AsyncClient):
    organizer = await _register(client, "org1", "org1@example.com")
    response = await client.post(
        "/api/v1/tournaments",
        json={"name": "Summer Cup", "format": "KNOCKOUT"},
        headers=_auth_header(organizer),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["name"] == "Summer Cup"
    assert body["data"]["status"] == "UPCOMING"
    assert body["data"]["team_count"] == 0


async def test_register_team_by_team_owner(client: AsyncClient):
    organizer = await _register(client, "org2", "org2@example.com")
    team_owner = await _register(client, "teamowner1", "teamowner1@example.com")

    tournament_resp = await client.post(
        "/api/v1/tournaments",
        json={"name": "Winter Cup", "format": "LEAGUE"},
        headers=_auth_header(organizer),
    )
    tournament = tournament_resp.json()["data"]
    team = await _create_team(client, team_owner, "Wanderers")

    response = await client.post(
        f"/api/v1/tournaments/{tournament['id']}/teams",
        json={"team_id": team["id"]},
        headers=_auth_header(team_owner),
    )
    body = response.json()

    assert response.status_code == 200
    assert body["data"]["status"] == "PENDING"


async def test_organizer_can_approve_registration(client: AsyncClient):
    organizer = await _register(client, "org3", "org3@example.com")
    team_owner = await _register(client, "teamowner2", "teamowner2@example.com")

    tournament = (
        await client.post(
            "/api/v1/tournaments",
            json={"name": "Spring Cup", "format": "LEAGUE"},
            headers=_auth_header(organizer),
        )
    ).json()["data"]
    team = await _create_team(client, team_owner, "Strikers")
    await client.post(
        f"/api/v1/tournaments/{tournament['id']}/teams",
        json={"team_id": team["id"]},
        headers=_auth_header(team_owner),
    )

    response = await client.patch(
        f"/api/v1/tournaments/{tournament['id']}/teams/{team['id']}",
        json={"status": "APPROVED"},
        headers=_auth_header(organizer),
    )
    assert response.status_code == 200
    assert response.json()["data"]["status"] == "APPROVED"


async def test_stranger_cannot_register_someone_elses_team(client: AsyncClient):
    organizer = await _register(client, "org4", "org4@example.com")
    team_owner = await _register(client, "teamowner3", "teamowner3@example.com")
    stranger = await _register(client, "stranger1", "stranger1@example.com")

    tournament = (
        await client.post(
            "/api/v1/tournaments",
            json={"name": "Autumn Cup", "format": "LEAGUE"},
            headers=_auth_header(organizer),
        )
    ).json()["data"]
    team = await _create_team(client, team_owner, "Titans")

    response = await client.post(
        f"/api/v1/tournaments/{tournament['id']}/teams",
        json={"team_id": team["id"]},
        headers=_auth_header(stranger),
    )
    assert response.status_code == 403


async def test_duplicate_registration_rejected(client: AsyncClient):
    organizer = await _register(client, "org5", "org5@example.com")
    team_owner = await _register(client, "teamowner4", "teamowner4@example.com")

    tournament = (
        await client.post(
            "/api/v1/tournaments",
            json={"name": "Monsoon Cup", "format": "LEAGUE"},
            headers=_auth_header(organizer),
        )
    ).json()["data"]
    team = await _create_team(client, team_owner, "Riders")

    first = await client.post(
        f"/api/v1/tournaments/{tournament['id']}/teams",
        json={"team_id": team["id"]},
        headers=_auth_header(team_owner),
    )
    assert first.status_code == 200

    second = await client.post(
        f"/api/v1/tournaments/{tournament['id']}/teams",
        json={"team_id": team["id"]},
        headers=_auth_header(team_owner),
    )
    assert second.status_code == 400


async def test_points_table_empty_before_matches(client: AsyncClient):
    organizer = await _register(client, "org6", "org6@example.com")
    tournament = (
        await client.post(
            "/api/v1/tournaments",
            json={"name": "Empty Cup", "format": "LEAGUE"},
            headers=_auth_header(organizer),
        )
    ).json()["data"]

    response = await client.get(f"/api/v1/tournaments/{tournament['id']}/points-table")
    assert response.status_code == 200
    assert response.json()["data"] == []
