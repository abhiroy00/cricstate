import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, require_roles
from app.api.v1.users import ADMIN_ROLES
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.engagement import (
    ContentReportCreate,
    ContentReportOut,
    ConversationCreate,
    ConversationOut,
    DirectoryListingCreate,
    DirectoryListingOut,
    DirectoryListingUpdate,
    LookingPostCreate,
    LookingPostOut,
    LookingPostUpdate,
    MessageCreate,
    MessageOut,
    NotificationPreferenceOut,
    NotificationPreferenceUpdate,
    ReportStatusUpdate,
)
from app.services.engagement_service import (
    DirectMessageService,
    DirectoryService,
    LookingService,
    NotificationService,
    ReportService,
)
from app.utils.pagination import PageParams

router = APIRouter(tags=["engagement"])


# --- Notification preferences (ProfileScreen link row) ---

@router.get("/notifications/preferences")
async def get_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prefs = await NotificationService(db).get_or_create(current_user)
    return success_response(NotificationPreferenceOut.model_validate(prefs).model_dump())


@router.patch("/notifications/preferences")
async def update_preferences(
    payload: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    prefs = await NotificationService(db).update(current_user, payload)
    return success_response(
        NotificationPreferenceOut.model_validate(prefs).model_dump(),
        message="Preferences updated",
    )


# --- Looking posts ---

@router.post("/looking/posts")
async def create_looking_post(
    payload: LookingPostCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await LookingService(db).create(current_user, payload)
    return success_response(
        LookingPostOut.model_validate(post).model_dump(mode="json"),
        message="Post created",
    )


@router.get("/looking/posts")
async def list_looking_posts(
    category: str | None = Query(default=None),
    city: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    page = await LookingService(db).list_posts(
        category, city, status, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.patch("/looking/posts/{post_id}")
async def update_looking_post(
    post_id: uuid.UUID,
    payload: LookingPostUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    post = await LookingService(db).update(current_user, post_id, payload)
    return success_response(
        LookingPostOut.model_validate(post).model_dump(mode="json"),
        message="Post updated",
    )


# --- Community directory (one endpoint for every role board) ---

@router.post("/community/listings")
async def create_listing(
    payload: DirectoryListingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    listing = await DirectoryService(db).create(current_user, payload)
    return success_response(
        DirectoryListingOut.model_validate(listing).model_dump(mode="json"),
        message="Listing created",
    )


@router.get("/community/listings")
async def list_listings(
    category: str | None = Query(default=None),
    search: str | None = Query(default=None),
    city: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    page = await DirectoryService(db).list_listings(
        category, search, city, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.get("/community/listings/{listing_id}")
async def get_listing(listing_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    listing = await DirectoryService(db).get_or_404(listing_id)
    return success_response(DirectoryListingOut.model_validate(listing).model_dump(mode="json"))


@router.patch("/community/listings/{listing_id}")
async def update_listing(
    listing_id: uuid.UUID,
    payload: DirectoryListingUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    is_admin = bool(set(current_user.role_names) & set(ADMIN_ROLES))
    listing = await DirectoryService(db).update(current_user, listing_id, payload, is_admin)
    return success_response(
        DirectoryListingOut.model_validate(listing).model_dump(mode="json"),
        message="Listing updated",
    )


# --- Content reports ---

@router.post("/reports")
async def create_report(
    payload: ContentReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    report = await ReportService(db).create(current_user, payload)
    return success_response(
        ContentReportOut.model_validate(report).model_dump(mode="json"),
        message="Report submitted",
    )


@router.get("/reports", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def list_reports(
    status: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    page = await ReportService(db).list_reports(status, PageParams(limit=limit, offset=offset))
    return success_response(page)


@router.patch("/reports/{report_id}", dependencies=[Depends(require_roles(*ADMIN_ROLES))])
async def set_report_status(
    report_id: uuid.UUID,
    payload: ReportStatusUpdate,
    db: AsyncSession = Depends(get_db),
):
    report = await ReportService(db).set_status(report_id, payload)
    return success_response(
        ContentReportOut.model_validate(report).model_dump(mode="json"),
        message="Report updated",
    )


# --- Direct messages ---

@router.post("/dm/conversations")
async def create_conversation(
    payload: ConversationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    convo = await DirectMessageService(db).create_conversation(current_user, payload)
    members = await DirectMessageService(db)._member_ids(convo.id)
    return success_response(
        ConversationOut(
            id=convo.id,
            member_ids=sorted(members),
            last_message=None,
            created_at=convo.created_at,
        ).model_dump(mode="json"),
        message="Conversation created",
    )


@router.get("/dm/conversations/me")
async def list_my_conversations(
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    page = await DirectMessageService(db).list_my_conversations(
        current_user, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.get("/dm/conversations/{conversation_id}/messages")
async def list_messages(
    conversation_id: uuid.UUID,
    limit: int = Query(default=50, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    page = await DirectMessageService(db).list_messages(
        current_user, conversation_id, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.post("/dm/conversations/{conversation_id}/messages")
async def send_message(
    conversation_id: uuid.UUID,
    payload: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    msg = await DirectMessageService(db).send_message(current_user, conversation_id, payload)
    return success_response(
        MessageOut.model_validate(msg).model_dump(mode="json"), message="Message sent"
    )
