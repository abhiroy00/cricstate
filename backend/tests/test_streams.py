from httpx import AsyncClient

from tests.test_store_engagement import _auth_header, _make_admin, _register


async def _make_match(client: AsyncClient, user: dict) -> dict:
    # Minimal match: needs two teams first.
    async def make_team(name: str) -> dict:
        r = await client.post(
            "/api/v1/teams", json={"name": name}, headers=_auth_header(user)
        )
        assert r.status_code == 200, r.text
        return r.json()["data"]

    team_a = await make_team("Stream Team A")
    team_b = await make_team("Stream Team B")
    r = await client.post(
        "/api/v1/matches",
        json={
            "team_a_id": team_a["id"],
            "team_b_id": team_b["id"],
            "match_type": "T20",
            "overs_limit": 20,
        },
        headers=_auth_header(user),
    )
    assert r.status_code == 200, r.text
    return r.json()["data"]


async def test_stream_lifecycle(client: AsyncClient):
    admin = await _register(client, "stream_admin", "stream_admin@example.com")
    await _make_admin("stream_admin")
    user = await _register(client, "stream_user", "stream_user@example.com")
    match = await _make_match(client, admin)

    # Plain user cannot create streams.
    denied = await client.post(
        "/api/v1/streams",
        json={"match_id": match["id"], "title": "Final Live"},
        headers=_auth_header(user),
    )
    assert denied.status_code == 403

    created = await client.post(
        "/api/v1/streams",
        json={"match_id": match["id"], "title": "Final Live"},
        headers=_auth_header(admin),
    )
    assert created.status_code == 200, created.text
    data = created.json()["data"]
    assert data["status"] == "SCHEDULED"
    assert data["stream_key"]
    stream_id = data["id"]

    # Duplicate stream for same match rejected.
    dup = await client.post(
        "/api/v1/streams",
        json={"match_id": match["id"]},
        headers=_auth_header(admin),
    )
    assert dup.status_code == 409

    # Public listing never leaks the ingest key.
    listed = await client.get("/api/v1/streams?status=SCHEDULED")
    assert listed.status_code == 200
    assert listed.json()["data"]["total"] == 1
    assert "stream_key" not in listed.json()["data"]["items"][0]

    by_match = await client.get(f"/api/v1/streams/by-match/{match['id']}")
    assert by_match.json()["data"]["id"] == stream_id

    # Go live with a playback URL.
    live = await client.patch(
        f"/api/v1/streams/{stream_id}",
        json={"status": "LIVE", "playback_url": "https://cdn.example.com/live/final.m3u8"},
        headers=_auth_header(admin),
    )
    assert live.status_code == 200, live.text
    assert live.json()["data"]["status"] == "LIVE"
    assert live.json()["data"]["started_at"] is not None

    # Viewer heartbeat.
    hb = await client.post(
        f"/api/v1/streams/{stream_id}/heartbeat",
        json={"viewer_count": 128},
        headers=_auth_header(admin),
    )
    assert hb.status_code == 200, hb.text
    assert hb.json()["data"]["viewer_count"] == 128

    # Bad status rejected.
    bad = await client.patch(
        f"/api/v1/streams/{stream_id}",
        json={"status": "STREAMING"},
        headers=_auth_header(admin),
    )
    assert bad.status_code == 400

    ended = await client.patch(
        f"/api/v1/streams/{stream_id}",
        json={"status": "ENDED"},
        headers=_auth_header(admin),
    )
    assert ended.json()["data"]["ended_at"] is not None

    gone = await client.delete(
        f"/api/v1/streams/{stream_id}", headers=_auth_header(admin)
    )
    assert gone.status_code == 200, gone.text
