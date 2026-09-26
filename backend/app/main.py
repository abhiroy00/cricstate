from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.logging import configure_logging
from app.middleware.error_handler import register_exception_handlers
from app.middleware.security_headers import SecurityHeadersMiddleware
from app.schemas.common import success_response
from app.websocket import manager as ws_manager

configure_logging()

app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)

register_exception_handlers(app)

app.include_router(api_router, prefix=settings.API_V1_PREFIX)


@app.get("/health")
async def health_check():
    return success_response({"status": "ok", "env": settings.ENV}, message="Service is healthy")


@app.websocket("/ws/matches/{match_id}")
async def match_live_socket(websocket: WebSocket, match_id: str):
    """Live push for MatchDetail / Scorer screens.

    Connect to ws(s)://<host>/ws/matches/<match_id> and listen for messages:
      {"type": "live_update", "match_id": "...", "live": {...LiveStateOut...}}
    The HTTP scoring endpoints broadcast after every mutation; the socket
    itself is receive-only (client ping frames are ignored).
    """
    await ws_manager.connect(match_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        await ws_manager.disconnect(match_id, websocket)
    except Exception:
        await ws_manager.disconnect(match_id, websocket)
