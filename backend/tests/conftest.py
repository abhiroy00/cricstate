import os
import tempfile
from pathlib import Path
from typing import AsyncGenerator

# Must be set before any `app.*` import: app.core.redis binds a module-level
# client to REDIS_URL at import time. Pointing it at an unreachable address
# makes the login/register rate limiter's existing fail-open path kick in
# deterministically, so tests never depend on whether a real Redis happens to
# be running locally.
os.environ["REDIS_URL"] = "redis://localhost:1/0"

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy import event
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

import app.models  # noqa: F401  (registers all mapped classes on Base.metadata)
from app.core.database import get_db
from app.main import app
from app.models.base import Base
from app.models.role import Role, RoleName

# A file-backed SQLite DB (not `:memory:`) so every connection the pool opens
# sees the same data - `:memory:` is per-connection, which either needs a
# StaticPool (pins everything to one shared connection, and two sessions
# concurrently touching aiosqlite's single connection can deadlock) or breaks
# under any real concurrency. A temp file sidesteps both problems.
_TEST_DB_PATH = Path(tempfile.gettempdir()) / "cricstate_test.db"
_TEST_DB_PATH.unlink(missing_ok=True)
TEST_DATABASE_URL = f"sqlite+aiosqlite:///{_TEST_DB_PATH}"

engine = create_async_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


@event.listens_for(engine.sync_engine, "connect")
def _speed_up_sqlite(dbapi_connection, _):
    # Test data has zero durability requirements - skip fsync and journaling
    # overhead so a file-backed DB isn't slower than `:memory:` would've been.
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA synchronous=OFF")
    cursor.execute("PRAGMA journal_mode=MEMORY")
    cursor.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database() -> AsyncGenerator[None, None]:
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        for role_name in RoleName:
            session.add(Role(name=role_name.value, description=""))
        await session.commit()

    yield

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
    async with TestSessionLocal() as session:
        yield session


app.dependency_overrides[get_db] = _override_get_db


@pytest_asyncio.fixture
async def client() -> AsyncGenerator[AsyncClient, None]:
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
