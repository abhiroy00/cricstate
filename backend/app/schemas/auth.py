import re

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.user import UserOut

USERNAME_RE = re.compile(r"^[a-zA-Z0-9_]{3,30}$")


class RegisterRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: str
    phone: str | None = None

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if not USERNAME_RE.match(v):
            raise ValueError(
                "Username must be 3-30 characters and contain only letters, numbers, underscores"
            )
        return v

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Za-z]", v) or not re.search(r"[0-9]", v):
            raise ValueError("Password must contain at least one letter and one number")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name is too short")
        return v


class LoginRequest(BaseModel):
    identifier: str  # email or username
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenPairOut(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserOut
