import uuid

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.engagement import (
    ContentReport,
    Conversation,
    ConversationMember,
    DirectoryListing,
    LookingPost,
    LookingStatus,
    Message,
    NotificationPreference,
    ReportStatus,
)
from app.models.user import User
from app.schemas.engagement import (
    ContentReportCreate,
    ConversationCreate,
    DirectoryListingCreate,
    DirectoryListingUpdate,
    LookingPostCreate,
    LookingPostUpdate,
    MessageCreate,
    NotificationPreferenceUpdate,
    ReportStatusUpdate,
)
from app.utils.pagination import PageParams, paginated_response


class NotificationService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_or_create(self, user: User) -> NotificationPreference:
        result = await self.db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user.id)
        )
        prefs = result.scalar_one_or_none()
        if prefs:
            return prefs
        prefs = NotificationPreference(user_id=user.id)
        self.db.add(prefs)
        await self.db.commit()
        await self.db.refresh(prefs)
        return prefs

    async def update(self, user: User, payload: NotificationPreferenceUpdate) -> NotificationPreference:
        prefs = await self.get_or_create(user)
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(prefs, field, value)
        await self.db.commit()
        await self.db.refresh(prefs)
        return prefs


class LookingService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: User, payload: LookingPostCreate) -> LookingPost:
        post = LookingPost(user_id=user.id, **payload.model_dump())
        self.db.add(post)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def list_posts(
        self,
        category: str | None,
        city: str | None,
        status: str | None,
        params: PageParams,
    ) -> dict:
        from app.schemas.engagement import LookingPostOut

        query = select(LookingPost)
        count_query = select(func.count()).select_from(LookingPost)
        if category:
            query = query.where(LookingPost.category == category)
            count_query = count_query.where(LookingPost.category == category)
        if city:
            query = query.where(LookingPost.city.ilike(f"%{city}%"))
            count_query = count_query.where(LookingPost.city.ilike(f"%{city}%"))
        if status:
            query = query.where(LookingPost.status == status)
            count_query = count_query.where(LookingPost.status == status)
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                query.order_by(LookingPost.created_at.desc())
                .limit(params.limit)
                .offset(params.offset)
            )
        ).scalars().all()
        return paginated_response(
            [LookingPostOut.model_validate(p).model_dump(mode="json") for p in rows],
            total,
            params,
        )

    async def update(self, user: User, post_id: uuid.UUID, payload: LookingPostUpdate) -> LookingPost:
        result = await self.db.execute(select(LookingPost).where(LookingPost.id == post_id))
        post = result.scalar_one_or_none()
        if not post:
            raise NotFoundError("Post not found")
        if post.user_id != user.id:
            raise ForbiddenError("Not your post")
        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(post, field, value)
        await self.db.commit()
        await self.db.refresh(post)
        return post

    async def close(self, user: User, post_id: uuid.UUID) -> LookingPost:
        return await self.update(
            user, post_id, LookingPostUpdate(status=LookingStatus.CLOSED.value)
        )


class DirectoryService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: User, payload: DirectoryListingCreate) -> DirectoryListing:
        listing = DirectoryListing(owner_id=user.id, **payload.model_dump())
        self.db.add(listing)
        await self.db.commit()
        await self.db.refresh(listing)
        return listing

    async def list_listings(
        self,
        category: str | None,
        search: str | None,
        city: str | None,
        params: PageParams,
    ) -> dict:
        from app.schemas.engagement import DirectoryListingOut

        query = select(DirectoryListing)
        count_query = select(func.count()).select_from(DirectoryListing)
        if category:
            query = query.where(DirectoryListing.category == category)
            count_query = count_query.where(DirectoryListing.category == category)
        if search:
            query = query.where(DirectoryListing.name.ilike(f"%{search}%"))
            count_query = count_query.where(DirectoryListing.name.ilike(f"%{search}%"))
        if city:
            query = query.where(DirectoryListing.city.ilike(f"%{city}%"))
            count_query = count_query.where(DirectoryListing.city.ilike(f"%{city}%"))
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                query.order_by(DirectoryListing.created_at.desc())
                .limit(params.limit)
                .offset(params.offset)
            )
        ).scalars().all()
        return paginated_response(
            [DirectoryListingOut.model_validate(l).model_dump(mode="json") for l in rows],
            total,
            params,
        )

    async def get_or_404(self, listing_id: uuid.UUID) -> DirectoryListing:
        result = await self.db.execute(
            select(DirectoryListing).where(DirectoryListing.id == listing_id)
        )
        listing = result.scalar_one_or_none()
        if not listing:
            raise NotFoundError("Listing not found")
        return listing

    async def update(
        self, user: User, listing_id: uuid.UUID, payload: DirectoryListingUpdate, is_admin: bool = False
    ) -> DirectoryListing:
        listing = await self.get_or_404(listing_id)
        data = payload.model_dump(exclude_unset=True)
        if "is_verified" in data and not is_admin:
            raise ForbiddenError("Only admins can verify listings")
        if listing.owner_id != user.id and not is_admin:
            raise ForbiddenError("Not your listing")
        for field, value in data.items():
            setattr(listing, field, value)
        await self.db.commit()
        await self.db.refresh(listing)
        return listing


class ReportService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, user: User, payload: ContentReportCreate) -> ContentReport:
        report = ContentReport(reporter_id=user.id, **payload.model_dump())
        self.db.add(report)
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def list_reports(self, status: str | None, params: PageParams) -> dict:
        from app.schemas.engagement import ContentReportOut

        query = select(ContentReport)
        count_query = select(func.count()).select_from(ContentReport)
        if status:
            query = query.where(ContentReport.status == status)
            count_query = count_query.where(ContentReport.status == status)
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                query.order_by(ContentReport.created_at.desc())
                .limit(params.limit)
                .offset(params.offset)
            )
        ).scalars().all()
        return paginated_response(
            [ContentReportOut.model_validate(r).model_dump(mode="json") for r in rows],
            total,
            params,
        )

    async def set_status(self, report_id: uuid.UUID, payload: ReportStatusUpdate) -> ContentReport:
        if payload.status not in (
            ReportStatus.OPEN.value,
            ReportStatus.RESOLVED.value,
            ReportStatus.DISMISSED.value,
        ):
            raise AppError("Invalid status")
        result = await self.db.execute(
            select(ContentReport).where(ContentReport.id == report_id)
        )
        report = result.scalar_one_or_none()
        if not report:
            raise NotFoundError("Report not found")
        report.status = payload.status
        await self.db.commit()
        await self.db.refresh(report)
        return report

    async def count_open(self) -> int:
        result = await self.db.execute(
            select(func.count())
            .select_from(ContentReport)
            .where(ContentReport.status == ReportStatus.OPEN.value)
        )
        return result.scalar_one()


class DirectMessageService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def _member_ids(self, conversation_id: uuid.UUID) -> set[uuid.UUID]:
        result = await self.db.execute(
            select(ConversationMember.user_id).where(
                ConversationMember.conversation_id == conversation_id
            )
        )
        return set(result.scalars().all())

    async def _require_member(self, user: User, conversation_id: uuid.UUID) -> None:
        if user.id not in await self._member_ids(conversation_id):
            raise ForbiddenError("Not a member of this conversation")

    async def create_conversation(self, user: User, payload: ConversationCreate) -> Conversation:
        member_ids = set(payload.member_ids) | {user.id}
        convo = Conversation(created_by=user.id)
        self.db.add(convo)
        await self.db.flush()
        for uid in member_ids:
            self.db.add(ConversationMember(conversation_id=convo.id, user_id=uid))
        await self.db.commit()
        await self.db.refresh(convo)
        return convo

    async def list_my_conversations(self, user: User, params: PageParams) -> dict:
        from app.schemas.engagement import ConversationOut

        convo_ids = (
            await self.db.execute(
                select(ConversationMember.conversation_id).where(
                    ConversationMember.user_id == user.id
                )
            )
        ).scalars().all()
        if not convo_ids:
            return paginated_response([], 0, params)
        query = select(Conversation).where(Conversation.id.in_(convo_ids))
        total = len(convo_ids)
        rows = (
            await self.db.execute(
                query.order_by(Conversation.created_at.desc())
                .limit(params.limit)
                .offset(params.offset)
            )
        ).scalars().all()
        items = []
        for convo in rows:
            members = await self._member_ids(convo.id)
            last = (
                await self.db.execute(
                    select(Message)
                    .where(Message.conversation_id == convo.id)
                    .order_by(Message.created_at.desc())
                    .limit(1)
                )
            ).scalars().first()
            items.append(
                ConversationOut(
                    id=convo.id,
                    member_ids=sorted(members),
                    last_message=last.body if last else None,
                    created_at=convo.created_at,
                ).model_dump(mode="json")
            )
        return paginated_response(items, total, params)

    async def list_messages(
        self, user: User, conversation_id: uuid.UUID, params: PageParams
    ) -> dict:
        from app.schemas.engagement import MessageOut

        await self._require_member(user, conversation_id)
        count_query = (
            select(func.count())
            .select_from(Message)
            .where(Message.conversation_id == conversation_id)
        )
        total = (await self.db.execute(count_query)).scalar_one()
        rows = (
            await self.db.execute(
                select(Message)
                .where(Message.conversation_id == conversation_id)
                .order_by(Message.created_at)
                .limit(params.limit)
                .offset(params.offset)
            )
        ).scalars().all()
        return paginated_response(
            [MessageOut.model_validate(m).model_dump(mode="json") for m in rows],
            total,
            params,
        )

    async def send_message(
        self, user: User, conversation_id: uuid.UUID, payload: MessageCreate
    ) -> Message:
        await self._require_member(user, conversation_id)
        msg = Message(
            conversation_id=conversation_id, sender_id=user.id, body=payload.body
        )
        self.db.add(msg)
        await self.db.commit()
        await self.db.refresh(msg)
        return msg
