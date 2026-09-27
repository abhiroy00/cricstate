from httpx import AsyncClient

from app.core.config import settings

PNG_MAGIC = b"\x89PNG\r\n\x1a\n"


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


def _auth_header(data: dict) -> dict:
    return {"Authorization": f"Bearer {data['access_token']}"}


async def test_upload_image(client: AsyncClient, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    user = await _register(client, "uploader1")

    files = {"file": ("logo.png", PNG_MAGIC + b"0" * 64, "image/png")}
    response = await client.post("/api/v1/uploads", files=files, headers=_auth_header(user))

    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["path"].startswith("/uploads/")
    assert data["url"].endswith(data["path"])

    filename = data["path"].rsplit("/", 1)[-1]
    assert (tmp_path / filename).read_bytes().startswith(PNG_MAGIC)


async def test_upload_rejects_non_image(client: AsyncClient, tmp_path, monkeypatch):
    monkeypatch.setattr(settings, "UPLOAD_DIR", str(tmp_path))
    user = await _register(client, "uploader2")

    files = {"file": ("notes.txt", b"hello world", "text/plain")}
    response = await client.post("/api/v1/uploads", files=files, headers=_auth_header(user))

    assert response.status_code == 400
    assert response.json()["success"] is False


async def test_upload_requires_auth(client: AsyncClient):
    files = {"file": ("logo.png", PNG_MAGIC + b"0" * 8, "image/png")}
    response = await client.post("/api/v1/uploads", files=files)
    assert response.status_code == 401
