from fastapi import Request

from app.core.config import settings
from app.core.exceptions import TooManyRequestsError
from app.core.logging import logger
from app.core.redis import redis_client


def rate_limiter(key_prefix: str, max_requests: int | None = None, window_seconds: int | None = None):
    """Redis fixed-window limiter. Fails open (logs + allows) if Redis is unreachable,
    so an infra hiccup never takes down auth entirely."""

    limit = max_requests or settings.RATE_LIMIT_LOGIN_MAX
    window = window_seconds or settings.RATE_LIMIT_LOGIN_WINDOW_SECONDS

    async def _dependency(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"ratelimit:{key_prefix}:{client_ip}"

        try:
            current = await redis_client.incr(key)
            if current == 1:
                await redis_client.expire(key, window)
            if current > limit:
                raise TooManyRequestsError("Too many requests. Please try again later.")
        except TooManyRequestsError:
            raise
        except Exception as exc:
            logger.warning("Rate limiter unavailable (%s); allowing request through", exc)

    return _dependency
