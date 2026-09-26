import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.api.v1.users import ADMIN_ROLES
from app.core.database import get_db
from app.models.role import RoleName
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.stream import (
    HeartbeatRequest,
    StreamCreate,
    StreamCreateOut,
    StreamOut,
    StreamUpdate,
)
from app.services.stream_service import StreamService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/streams", tags=["streams"])

# Who may manage stream metadata: platform/streaming/match admins.
STREAM_ROLES = (
    *ADMIN_ROLES,
    RoleName.STREAMING_ADMIN.value,
    RoleName.MATCH_ADMIN.value,
)


@router.post("", dependencies=[Depends(require_roles(*STREAM_ROLES))])
async def create_stream(
    payload: StreamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stream = await StreamService(db).create(current_user, payload)
    return success_response(
        StreamCreateOut.model_validate(stream).model_dump(mode="json"),
        message="Stream created",
    )


@router.get("")
async def list_streams(
    match_id: uuid.UUID | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    page = await StreamService(db).list_streams(
        match_id, status, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.get("/by-match/{match_id}")
async def get_stream_by_match(match_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stream = await StreamService(db).get_by_match_or_none(match_id)
    if not stream:
        return success_response(None)
    return success_response(StreamOut.model_validate(stream).model_dump(mode="json"))


@router.get("/{stream_id}")
async def get_stream(stream_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    stream = await StreamService(db).get_or_404(stream_id)
    return success_response(StreamOut.model_validate(stream).model_dump(mode="json"))


@router.patch("/{stream_id}", dependencies=[Depends(require_roles(*STREAM_ROLES))])
async def update_stream(
    stream_id: uuid.UUID,
    payload: StreamUpdate,
    db: AsyncSession = Depends(get_db),
):
    stream = await StreamService(db).update(stream_id, payload)
    return success_response(
        StreamOut.model_validate(stream).model_dump(mode="json"),
        message="Stream updated",
    )


@router.post("/{stream_id}/heartbeat", dependencies=[Depends(require_roles(*STREAM_ROLES))])
async def stream_heartbeat(
    stream_id: uuid.UUID,
    payload: HeartbeatRequest,
    db: AsyncSession = Depends(get_db),
):
    stream = await StreamService(db).heartbeat(stream_id, payload)
    return success_response(
        StreamOut.model_validate(stream).model_dump(mode="json"),
        message="Viewers updated",
    )


@router.delete("/{stream_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def delete_stream(
    stream_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    await StreamService(db).delete(stream_id)
    return success_response(None, message="Stream deleted")
