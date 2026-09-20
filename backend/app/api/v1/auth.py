from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.middleware.rate_limit import rate_limiter
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenPairOut
from app.schemas.common import success_response
from app.schemas.user import UserOut
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def _client_meta(request: Request) -> tuple[str | None, str | None]:
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return ip, user_agent


@router.post(
    "/register",
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(rate_limiter("register"))],
)
async def register(
    payload: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)
):
    ip, user_agent = _client_meta(request)
    service = AuthService(db)
    user = await service.register(payload, ip, user_agent)
    access_token, refresh_token = await service.issue_token_pair(user, ip, user_agent)
    data = TokenPairOut(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.from_model(user),
    )
    return success_response(data.model_dump(), message="Registration successful")


@router.post("/login", dependencies=[Depends(rate_limiter("login"))])
async def login(payload: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    ip, user_agent = _client_meta(request)
    service = AuthService(db)
    user = await service.authenticate(payload.identifier, payload.password, ip, user_agent)
    access_token, refresh_token = await service.issue_token_pair(user, ip, user_agent)
    data = TokenPairOut(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserOut.from_model(user),
    )
    return success_response(data.model_dump(), message="Login successful")


@router.post("/refresh")
async def refresh(payload: RefreshRequest, request: Request, db: AsyncSession = Depends(get_db)):
    ip, user_agent = _client_meta(request)
    service = AuthService(db)
    access_token, new_refresh_token, user = await service.refresh_tokens(
        payload.refresh_token, ip, user_agent
    )
    data = TokenPairOut(
        access_token=access_token,
        refresh_token=new_refresh_token,
        user=UserOut.from_model(user),
    )
    return success_response(data.model_dump(), message="Token refreshed")


@router.post("/logout")
async def logout(
    payload: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    service = AuthService(db)
    await service.logout(payload.refresh_token, current_user.id)
    return success_response(None, message="Logged out successfully")
