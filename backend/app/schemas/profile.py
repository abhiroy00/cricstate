import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ProfileOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    date_of_birth: Optional[date] = None
    # Mobile UI uses `dob`; keep both names in sync.
    dob: Optional[date] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    cover_photo_url: Optional[str] = None
    website_url: Optional[str] = None
    followers_count: int = 0
    following_count: int = 0
    is_following: bool = False
    created_at: datetime
    # --- Mobile Profile UI ---
    email: Optional[str] = None
    phone: Optional[str] = None
    playing_role: Optional[str] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None
    profile_views: int = 0
    profile_completion_percent: int = 0


class ProfileUpdate(BaseModel):
    bio: Optional[str] = None
    date_of_birth: Optional[date] = None
    dob: Optional[date] = None
    gender: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = None
    cover_photo_url: Optional[str] = None
    website_url: Optional[str] = None
    playing_role: Optional[str] = None
    batting_style: Optional[str] = None
    bowling_style: Optional[str] = None


class FollowUserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    username: str
    full_name: str
    avatar_url: Optional[str] = None
