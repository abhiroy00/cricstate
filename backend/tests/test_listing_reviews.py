from httpx import AsyncClient

from tests.test_store_engagement import _auth_header, _make_admin, _register


async def _make_listing(client: AsyncClient, owner: dict, category: str = "Academies") -> dict:
    response = await client.post(
        "/api/v1/community/listings",
        json={
            "category": category,
            "name": "Elite Cricket Academy",
            "city": "New Delhi",
            "description": "Top coaching facility",
            "contact": "9999999999",
        },
        headers=_auth_header(owner),
    )
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_listing_review_flow(client: AsyncClient):
    owner = await _register(client, "review_owner", "review_owner@example.com")
    reviewer = await _register(client, "review_user", "review_user@example.com")
    other = await _register(client, "review_other", "review_other@example.com")

    listing = await _make_listing(client, owner)
    assert listing["review_count"] == 0
    assert listing["avg_rating"] is None

    # Invalid rating rejected.
    bad = await client.post(
        f"/api/v1/community/listings/{listing['id']}/reviews",
        json={"rating": 6, "text": "Too good"},
        headers=_auth_header(reviewer),
    )
    assert bad.status_code == 422

    first = await client.post(
        f"/api/v1/community/listings/{listing['id']}/reviews",
        json={"rating": 5, "text": "Excellent coaching!"},
        headers=_auth_header(reviewer),
    )
    assert first.status_code == 200, first.text
    assert first.json()["data"]["rating"] == 5

    # Same user cannot review twice.
    dup = await client.post(
        f"/api/v1/community/listings/{listing['id']}/reviews",
        json={"rating": 4, "text": "Again"},
        headers=_auth_header(reviewer),
    )
    assert dup.status_code == 400

    second = await client.post(
        f"/api/v1/community/listings/{listing['id']}/reviews",
        json={"rating": 3, "text": "Average nets"},
        headers=_auth_header(other),
    )
    assert second.status_code == 200, second.text

    listed = await client.get(f"/api/v1/community/listings/{listing['id']}/reviews")
    assert listed.status_code == 200
    assert listed.json()["data"]["total"] == 2

    detail = await client.get(f"/api/v1/community/listings/{listing['id']}")
    assert detail.status_code == 200
    assert detail.json()["data"]["review_count"] == 2
    assert detail.json()["data"]["avg_rating"] == 4.0

    # Non-owner cannot delete someone else's review.
    forbidden = await client.delete(
        f"/api/v1/community/listings/{listing['id']}/reviews/{first.json()['data']['id']}",
        headers=_auth_header(other),
    )
    assert forbidden.status_code == 403

    # Owner of the review can delete it.
    deleted = await client.delete(
        f"/api/v1/community/listings/{listing['id']}/reviews/{first.json()['data']['id']}",
        headers=_auth_header(reviewer),
    )
    assert deleted.status_code == 200, deleted.text

    detail = await client.get(f"/api/v1/community/listings/{listing['id']}")
    assert detail.json()["data"]["review_count"] == 1
    assert detail.json()["data"]["avg_rating"] == 3.0

    # Owner can delete their own listing (cascades reviews).
    gone = await client.delete(
        f"/api/v1/community/listings/{listing['id']}",
        headers=_auth_header(owner),
    )
    assert gone.status_code == 200, gone.text

    missing = await client.get(f"/api/v1/community/listings/{listing['id']}")
    assert missing.status_code == 404


async def test_listing_delete_forbidden_for_stranger(client: AsyncClient):
    owner = await _register(client, "del_owner", "del_owner@example.com")
    stranger = await _register(client, "del_stranger", "del_stranger@example.com")
    listing = await _make_listing(client, owner, category="Grounds")

    denied = await client.delete(
        f"/api/v1/community/listings/{listing['id']}",
        headers=_auth_header(stranger),
    )
    assert denied.status_code == 403

    admin = await _register(client, "del_admin", "del_admin@example.com")
    await _make_admin("del_admin")
    ok = await client.delete(
        f"/api/v1/community/listings/{listing['id']}",
        headers=_auth_header(admin),
    )
    assert ok.status_code == 200, ok.text
