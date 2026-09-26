"""In-memory pub/sub for live scoring.

MatchDetail / Scorer UI currently polls GET /scoring/{id}/live. This manager
lets those screens open ws://.../ws/matches/{match_id} and receive a push
every time the scorer records/undos a delivery, changes bowler, or moves
innings - no extra fetch loop needed.

Single-process in-memory fan-out is enough for the current docker-compose
(web + api + db). When you scale api horizontally, swap the body of
broadcast() for redis pub/sub.
"""

import asyncio
from collections import defaultdict

from fastapi import WebSocket

_connections: dict[str, set[WebSocket]] = defaultdict(set)
_lock = asyncio.Lock()


async def connect(match_id: str, websocket: WebSocket) -> None:
    await websocket.accept()
    async with _lock:
        _connections[match_id].add(websocket)


async def disconnect(match_id: str, websocket: WebSocket) -> None:
    async with _lock:
        _connections[match_id].discard(websocket)
        if not _connections[match_id]:
            _connections.pop(match_id, None)


async def broadcast(match_id: str, message: dict) -> None:
    async with _lock:
        sockets = list(_connections.get(match_id, ()))
    dead: list[WebSocket] = []
    for ws in sockets:
        try:
            await ws.send_json(message)
        except Exception:
            dead.append(ws)
    if dead:
        async with _lock:
            for ws in dead:
                _connections[match_id].discard(ws)
