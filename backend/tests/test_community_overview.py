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


async def _create_listing(client: AsyncClient, user: dict, category: str, name: str, city: str) -> dict:
    response = await client.post(
        "/api/v1/community/listings",
        json={"category": category, "name": name, "city": city},
        headers=_auth_header(user),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_community_overview_empty(client: AsyncClient):
    response = await client.get("/api/v1/community/overview", params={"city": "Delhi"})
    assert response.status_code == 200, response.text
    body = response.json()["data"]

    assert body["city"] == "Delhi"
    assert body["total"] == 0
    assert body["featured"] == []
    assert body["counts"] == {
        "scorers": 0,
        "umpires": 0,
        "commentators": 0,
        "streamers": 0,
        "organisers": 0,
        "academies": 0,
        "grounds": 0,
        "box": 0,
    }


async def test_community_overview_counts_by_role_and_city(client: AsyncClient):
    owner = await _register(client, "comm_owner", "comm_owner@example.com")

    await _create_listing(client, owner, "Grounds", "Green Park", "Delhi")
    await _create_listing(client, owner, "Grounds", "Marine Drive", "Mumbai")
    await _create_listing(client, owner, "Academies", "Star Academy", "Delhi")
    await _create_listing(client, owner, "Box Cricket", "BoxPlay", "Delhi")

    delhi = (await client.get("/api/v1/community/overview", params={"city": "Delhi"})).json()["data"]
    assert delhi["counts"]["grounds"] == 1
    assert delhi["counts"]["academies"] == 1
    assert delhi["counts"]["box"] == 1
    assert delhi["counts"]["umpires"] == 0
    assert delhi["total"] == 3
    assert len(delhi["featured"]) == 3

    all_cities = (await client.get("/api/v1/community/overview")).json()["data"]
    assert all_cities["city"] is None
    assert all_cities["counts"]["grounds"] == 2
    assert all_cities["total"] == 4


async def test_community_overview_featured_includes_rating(client: AsyncClient):
    owner = await _register(client, "comm_rater", "comm_rater@example.com")
    listing = await _create_listing(client, owner, "Grounds", "Rated Ground", "Delhi")

    review = await client.post(
        f"/api/v1/community/listings/{listing['id']}/reviews",
        json={"rating": 4, "text": "Nice pitch"},
        headers=_auth_header(owner),
    )
    assert review.status_code == 200, review.text

    body = (await client.get("/api/v1/community/overview", params={"city": "Delhi"})).json()["data"]
    featured = body["featured"][0]
    assert featured["name"] == "Rated Ground"
    assert featured["review_count"] == 1
    assert featured["avg_rating"] == 4.0
