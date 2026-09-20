from typing import Generic, Optional, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    success: bool
    message: str
    data: Optional[T] = None


def success_response(data: T | None = None, message: str = "Success") -> dict:
    return {"success": True, "message": message, "data": data}


def error_response(message: str, data: T | None = None) -> dict:
    return {"success": False, "message": message, "data": data}
