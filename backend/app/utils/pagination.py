from typing import Any, Sequence

from pydantic import BaseModel, Field

MAX_PAGE_SIZE = 100


class PageParams(BaseModel):
    limit: int = Field(default=20, ge=1, le=MAX_PAGE_SIZE)
    offset: int = Field(default=0, ge=0)


def paginated_response(items: Sequence[Any], total: int, params: PageParams) -> dict:
    """Plain-dict page envelope - avoids the pitfalls of instantiating an
    unparametrized generic Pydantic model at runtime. `items` should already
    be JSON-serializable (dicts or `.model_dump()`-ed schema instances)."""
    return {
        "items": list(items),
        "total": total,
        "limit": params.limit,
        "offset": params.offset,
    }
