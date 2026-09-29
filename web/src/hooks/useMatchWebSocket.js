import { useEffect, useRef, useState } from "react";

// Live match push channel. The backend exposes:
//   ws(s)://<host>/ws/matches/{match_id}
// and broadcasts {"type": "live_update", "match_id", "live": {...LiveStateOut}}.
// This hook is receive-only: it never sends anything, so it can never submit a
// scoring action. If the socket cannot connect, callers keep working over REST.
const BASE_RECONNECT_DELAY_MS = 1000;
const MAX_RECONNECT_DELAY_MS = 15000;

function resolveSocketBase() {
  const explicit = import.meta.env.VITE_WS_URL;
  if (explicit) {
    return explicit.replace(/\/$/, "");
  }

  // Dev often points VITE_API_URL at the backend origin directly (the Vite
  // server itself does not proxy WebSockets), so derive the ws origin from it.
  const apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return apiUrl
      .replace(/^http/i, "ws")
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/$/, "");
  }

  // Production serves web + API from one origin behind nginx.
  if (typeof window === "undefined") return "";
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}`;
}

export function useMatchWebSocket(matchId, onLiveUpdate) {
  const handlerRef = useRef(onLiveUpdate);
  const [connected, setConnected] = useState(false);

  // Keep the latest handler without tearing down / reconnecting the socket.
  useEffect(() => {
    handlerRef.current = onLiveUpdate;
  }, [onLiveUpdate]);

  useEffect(() => {
    if (!matchId || typeof WebSocket === "undefined") return undefined;

    const url = `${resolveSocketBase()}/ws/matches/${matchId}`;
    let socket = null;
    let reconnectTimer = null;
    let disposed = false;
    let attempt = 0;

    function connect() {
      if (disposed) return;
      try {
        socket = new WebSocket(url);
      } catch {
        scheduleReconnect();
        return;
      }

      socket.onopen = () => {
        attempt = 0;
        setConnected(true);
      };

      socket.onmessage = (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch {
          return;
        }
        if (message?.type === "live_update" && message.live) {
          handlerRef.current?.(message.live);
        }
      };

      // onerror is always followed by onclose, so reconnect there only.
      socket.onerror = () => {};

      socket.onclose = () => {
        setConnected(false);
        scheduleReconnect();
      };
    }

    function scheduleReconnect() {
      if (disposed || reconnectTimer) return;
      attempt += 1;
      const delay = Math.min(
        BASE_RECONNECT_DELAY_MS * 2 ** (attempt - 1),
        MAX_RECONNECT_DELAY_MS
      );
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, delay);
    }

    connect();

    return () => {
      disposed = true;
      if (reconnectTimer) {
        clearTimeout(reconnectTimer);
        reconnectTimer = null;
      }
      if (socket) {
        socket.onopen = null;
        socket.onmessage = null;
        socket.onerror = null;
        socket.onclose = null;
        if (
          socket.readyState === WebSocket.OPEN ||
          socket.readyState === WebSocket.CONNECTING
        ) {
          socket.close();
        }
      }
    };
  }, [matchId]);

  return connected;
}
