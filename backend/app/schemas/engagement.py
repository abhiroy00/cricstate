import uuid
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


# --- Notifications ---

class NotificationPreferenceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    push_enabled: bool
    email_enabled: bool
    match_alerts: bool
    team_updates: bool
    marketing: bool


class NotificationPreferenceUpdate(BaseModel):
    push_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    match_alerts: Optional[bool] = None
    team_updates: Optional[bool] = None
    marketing: Optional[bool] = None


# --- Looking posts ---

class LookingPostCreate(BaseModel):
    category: str = Field(min_length=1, max_length=30)
    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = None
    city: Optional[str] = None


class LookingPostUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    city: Optional[str] = None
    status: Optional[str] = None


class LookingPostOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    user_id: uuid.UUID
    category: str
    title: str
    description: Optional[str] = None
    city: Optional[str] = None
    status: str
    created_at: datetime


# --- Community directory ---

class DirectoryListingCreate(BaseModel):
    category: str = Field(min_length=1, max_length=30)
    name: str = Field(min_length=1, max_length=200)
    city: Optional[str] = None
    description: Optional[str] = None
    contact: Optional[str] = None


class DirectoryListingUpdate(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    description: Optional[str] = None
    contact: Optional[str] = None
    is_verified: Optional[bool] = None


class DirectoryListingOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    owner_id: uuid.UUID
    category: str
    name: str
    city: Optional[str] = None
    description: Optional[str] = None
    contact: Optional[str] = None
    is_verified: bool
    avg_rating: Optional[float] = None
    review_count: int = 0
    created_at: datetime


class ListingReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    text: Optional[str] = Field(default=None, max_length=2000)


class ListingReviewOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    listing_id: uuid.UUID
    reviewer_id: uuid.UUID
    rating: int
    text: Optional[str] = None
    created_at: datetime


# --- Content reports ---

class ContentReportCreate(BaseModel):
    target_type: str = Field(min_length=1, max_length=50)
    target_id: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=1)


class ReportStatusUpdate(BaseModel):
    status: str


class ContentReportOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    reporter_id: uuid.UUID
    target_type: str
    target_id: str
    reason: str
    status: str
    created_at: datetime


# --- Direct messages ---

class ConversationCreate(BaseModel):
    member_ids: List[uuid.UUID] = Field(min_length=1)


class ConversationOut(BaseModel):
    id: uuid.UUID
    member_ids: List[uuid.UUID]
    last_message: Optional[str] = None
    created_at: datetime


class MessageCreate(BaseModel):
    body: str = Field(min_length=1, max_length=5000)


class MessageOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    conversation_id: uuid.UUID
    sender_id: uuid.UUID
    body: str
    created_at: datetime
