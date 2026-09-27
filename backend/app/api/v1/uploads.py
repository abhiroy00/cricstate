import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Request, UploadFile

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.exceptions import AppError
from app.models.user import User
from app.schemas.common import success_response

router = APIRouter(prefix="/uploads", tags=["uploads"])

# content-type -> canonical extension. Anything else is rejected, so a client
# cannot park arbitrary files (scripts, HTML) behind our static mount.
ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
}


@router.post("")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    extension = ALLOWED_IMAGE_TYPES.get(file.content_type or "")
    if not extension:
        raise AppError("Only JPEG, PNG, WEBP or GIF images are allowed")

    data = await file.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(data) > max_bytes:
        raise AppError(f"Image is too large (max {settings.MAX_UPLOAD_MB} MB)")
    if not data:
        raise AppError("Uploaded file is empty")

    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)

    filename = f"{uuid.uuid4().hex}{extension}"
    (upload_dir / filename).write_bytes(data)

    # Build an absolute URL from the public host nginx forwarded to us, so the
    # stored URL works from the mobile app (falls back to request host on
    # direct/local access).
    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("host", request.url.netloc)
    path = f"/uploads/{filename}"
    url = f"{scheme}://{host}{path}"

    return success_response({"url": url, "path": path}, message="Image uploaded")
