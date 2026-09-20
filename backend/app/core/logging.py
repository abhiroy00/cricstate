import logging
import sys

from app.core.config import settings


def configure_logging() -> None:
    level = logging.DEBUG if settings.ENV == "development" else logging.INFO
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(
        logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    )

    root = logging.getLogger()
    root.setLevel(level)
    root.handlers = [handler]

    # Keep noisy libraries at a saner level in dev.
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)


logger = logging.getLogger("cricstate")
