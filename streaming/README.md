# Streaming pipeline (Phase 6)

This directory is a placeholder. The live-video pipeline is built in Phase 6 and is
deliberately **kept separate from the FastAPI backend** — `backend/` only ever stores
and serves *metadata* about a stream (status, playback URL, viewer count, permissions);
it never touches video bytes.

Planned shape, per the architecture doc:

```
Camera / OBS → RTMP/SRT ingest → Transcoder (1080p/720p/480p/360p) → HLS → CDN → Player
```

Candidates for the ingest+packaging service: `mediamtx` (formerly `rtsp-simple-server`)
or `nginx-rtmp-module` for ingest, with `ffmpeg` for ABR transcoding to HLS. Whichever is
chosen, it will run as its own `streaming` service in the root `docker-compose.yml`
(already stubbed there as a commented block) and will never share a container or
process with the `backend` service.
