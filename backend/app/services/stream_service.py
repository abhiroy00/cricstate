import secrets
import uuid
from datetime import datetime, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, ConflictError, NotFoundError
from app.models.match import Match
from app.models.stream import Stream, StreamStatus
from app.models.user import User
from app.schemas.stream import HeartbeatRequest, StreamCreate, StreamUpdate
from app.utils.pagination import PageParams, paginated_response

VALID_STATUSES = {s.value for s in StreamStatus}


class StreamService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: User, payload: StreamCreate) -> Stream:
        match = (
            await self.db.execute(select(Match).where(Match.id == payload.match_id))
        ).scalar_one_or_none()
        if not match:
            raise NotFoundError("Match not found")
        existing = (
            await self.db.execute(select(Stream).where(Stream.match_id == payload.match_id))
        ).scalar_one_or_none()
        if existing:
            raise ConflictError("A stream already exists for this match")
        key = secrets.token_urlsafe(24)
        stream = Stream(
            match_id=payload.match_id,
            title=payload.title,
            notes=payload.notes,
            status=StreamStatus.SCHEDULED.value,
            stream_key=key,
            stream_key_hint=key[-6:],
        )
        self.db.add(stream)
        await self.db.commit()
        await self.db.refresh(stream)
        return stream

    async def list_streams(
        self,
        match_id: uuid.UUID | None,
        status: str | None,
        params: PageParams,
    ) -> dict:
        from app.schemas.stream import StreamOut

        query = select(Stream)
        count_query = select(func.count()).select_from(Stream)
        if match_id:
            query = query.where(Stream.match_id == match_id)
            count_query = count_query.where(Stream.match_id == match_id)
        if status:
            if status not in VALID_STATUSES:
                raise AppError("Invalid stream status")
            query = query.where(Stream.status == status)
            count_query = count_query.where(Stream.status == status)
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                query.order_by(Stream.created_at.desc()).limit(params.limit).offset(params.offset)
            )
        ).scalars().all()
        return paginated_response(
            [StreamOut.model_validate(s).model_dump(mode="json") for s in rows],
            total,
            params,
        )

    async def get_or_404(self, stream_id: uuid.UUID) -> Stream:
        stream = (
            await self.db.execute(select(Stream).where(Stream.id == stream_id))
        ).scalar_one_or_none()
        if not stream:
            raise NotFoundError("Stream not found")
        return stream

    async def get_by_match_or_none(self, match_id: uuid.UUID) -> Stream | None:
        return (
            await self.db.execute(select(Stream).where(Stream.match_id == match_id))
        ).scalar_one_or_none()

    async def update(self, stream_id: uuid.UUID, payload: StreamUpdate) -> Stream:
        stream = await self.get_or_404(stream_id)
        data = payload.model_dump(exclude_unset=True)
        if "status" in data:
            if data["status"] not in VALID_STATUSES:
                raise AppError("Invalid stream status")
            now = datetime.now(timezone.utc)
            if data["status"] == StreamStatus.LIVE.value and stream.status != StreamStatus.LIVE.value:
                stream.started_at = now
                stream.ended_at = None
            if data["status"] in (StreamStatus.ENDED.value, StreamStatus.OFFLINE.value):
                stream.ended_at = now
            stream.status = data["status"]
            del data["status"]
        for field, value in data.items():
            setattr(stream, field, value)
        await self.db.commit()
        await self.db.refresh(stream)
        return stream

    async def heartbeat(self, stream_id: uuid.UUID, payload: HeartbeatRequest) -> Stream:
        stream = await self.get_or_404(stream_id)
        stream.viewer_count = payload.viewer_count
        await self.db.commit()
        await self.db.refresh(stream)
        return stream

    async def delete(self, stream_id: uuid.UUID) -> None:
        stream = await self.get_or_404(stream_id)
        await self.db.delete(stream)
        await self.db.commit()
