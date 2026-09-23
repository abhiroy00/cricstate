# CricState — Cricket Ecosystem Platform

A production-style cricket platform combining live scoring, live video, social
network, tournament management, a store, PRO subscriptions and an admin panel.
Built as a **modular FastAPI monolith** + **React web** + **React Native mobile** +
**React admin**, backed by **PostgreSQL** and **Redis**, with live video kept
strictly separate from live score/data.

This repo is being built in phases (see `PHASES.md`-style plan below). **Phase 1 —
project setup + authentication/RBAC foundation — is complete.** Everything else
(matches/scoring, social feed, live video, store, PRO, admin business features) is
intentionally not yet implemented; those modules are added phase by phase so nothing
half-built ships.

## 1. Architecture

```
React Native ─┐
React Web     ├── HTTPS/WSS ──► Nginx ──► FastAPI (backend/)
React Admin   ─┘                              │
                          ┌────────────────────┼───────────────────┐
                          ▼                    ▼                   ▼
                     PostgreSQL             Redis            S3-compatible
                 (users, roles, RBAC,   (cache, rate limit,    storage (added
                  ... added per phase)   pub/sub — Phase 5+)    Phase 6+)
```

Live video (Phase 6) is a **fully separate pipeline** — FastAPI never touches video
bytes, only stream metadata:

```
Camera/OBS → RTMP/SRT → Streaming server → Transcoder → HLS → CDN → Video player
```

## 2. Monorepo layout

```
cricstate/
├── backend/    FastAPI (Python) — see backend/app for the module layout
├── web/        React + Vite (JS) — end-user web app
├── admin/      React + Vite (JS) — separate admin panel app
├── mobile/     React Native + Expo (JS) — end-user mobile app, run via Expo Go
├── streaming/  Placeholder for the Phase 6 live-video pipeline
├── nginx/      Reverse proxy config
└── docker-compose.yml
```

Backend module layout (`backend/app/`): `core/` (config, db, redis, security,
logging), `middleware/` (error handling, security headers, rate limiting),
`api/v1/` (one router file per domain — only `auth.py` and `users.py` exist so
far), `models/`, `schemas/`, `services/`, `repositories/`, `websocket/` (wired in
Phase 5). New domains get their own router/model/service files in the phase that
implements them — there are no placeholder business-logic files.

## 3. Prerequisites

- Python 3.12+
- Node.js 18+
- Docker + Docker Compose (for Postgres/Redis, and optionally the full stack)
- For mobile native builds: Android Studio (Android) and/or Xcode (iOS, macOS only)

## 4. Environment variables

Every app has a `.env.example`. Copy it to `.env` and fill in real values —
**never commit `.env`** (already covered by `.gitignore`).

- `/.env.example` — Postgres credentials used by `docker-compose.yml`
- `backend/.env.example` — `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, token TTLs,
  `CORS_ORIGINS`, rate-limit tuning, optional bootstrap SUPER_ADMIN. It also lists
  (commented out) the AWS/Firebase/payment/streaming/CDN variables that later
  phases will read, so the full shape is visible upfront.
- `web/.env.example`, `admin/.env.example` — `VITE_API_URL`
- `mobile/.env.example` — documents the FCM native files needed (see §8)

## 5. Running the backend locally (without Docker)

```bash
cd backend
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash; use venv\Scripts\activate.bat on cmd
pip install -r requirements.txt
cp .env.example .env              # then point DATABASE_URL/REDIS_URL at your Postgres/Redis

alembic upgrade head               # run migrations
python -m scripts.seed             # seed RBAC roles (+ bootstrap SUPER_ADMIN if configured)

uvicorn app.main:app --reload
```

- Swagger UI: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Database migrations

Alembic is configured for the async engine. Common commands, run from `backend/`:

```bash
alembic upgrade head                       # apply all migrations
alembic revision --autogenerate -m "..."   # generate a new migration from model changes
alembic downgrade -1                       # roll back one migration
```

### Tests

```bash
cd backend
pytest -v
```

Tests run against an in-memory SQLite database (via `aiosqlite`) rather than a live
Postgres instance — the ORM models use dialect-portable types (`Uuid`, `JSON`), so
this keeps the suite fast and dependency-free while Postgres remains the real
runtime database. Redis-backed rate limiting fails **open** (logs + allows) when
Redis isn't reachable, so tests don't require Redis either.

## 6. Running the web app

```bash
cd web
npm install
cp .env.example .env
npm run dev       # http://localhost:5173
npm run build     # production build
```

## 7. Running the admin panel

```bash
cd admin
npm install
cp .env.example .env
npm run dev       # http://localhost:5174
npm run build
```

Admin access is gated by role **on the backend** (`require_roles` dependency) — the
frontend sidebar/route gating is a UX convenience only, never the source of truth.
Use the `BOOTSTRAP_SUPER_ADMIN_*` env vars + `python -m scripts.seed` to create your
first admin login.

## 8. Running the mobile app

The app runs through **Expo Go** for local preview — no Android Studio/Xcode
toolchain needed to see it working on a real device:

```bash
cd mobile
npm install
npx expo start
```

This prints a `exp://<your-lan-ip>:8081` URL (and a QR code in an interactive
terminal). Open it in the Expo Go app (Play Store/App Store) — its installed
version must match this project's SDK (`expo` version in `package.json`; keep
both on the same major version, e.g. SDK 57). If your phone can't reach your
dev machine over LAN, run `npx expo start --tunnel` instead.

By default `src/utils/config.js` points at the deployed production backend
(`http://100.61.50.136/api/v1`) rather than a local URL, since a phone in Expo
Go isn't guaranteed to share a network with whatever machine is running the
backend locally — point it at your own LAN IP + port 8000 for local-backend
testing instead.

**Push notifications** (Firebase Cloud Messaging) aren't wired up yet — they
need a real native build (`npx expo prebuild` to generate `android/`/`ios/`,
then `@react-native-firebase/messaging` or `expo-notifications` on top, plus
`google-services.json`/`GoogleService-Info.plist`), which is out of scope for
the Expo Go preview workflow. This is a placeholder for a later phase, not
partially-built code — there's currently no notification service file at all.

## 9. Running everything with Docker Compose

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp web/.env.example web/.env
cp admin/.env.example admin/.env

docker compose up -d postgres redis        # just the datastores, for local dev
# — or —
docker compose up --build                  # full stack: postgres, redis, backend, web, admin, nginx
```

With the full stack up, Nginx (port 80) routes `/api/*` and `/docs` to the backend,
`/admin/*` to the admin panel, and everything else to the web app. `mobile/` is
never part of Docker Compose — native mobile tooling doesn't containerize
meaningfully for this workflow, so it's always run locally per §8.

The `streaming` service (Phase 6) is stubbed as a commented block in
`docker-compose.yml` — see `streaming/README.md`.

## 10. WebSockets & live video (not yet implemented)

- `WS /api/v1/ws/matches/{match_id}` (live score) and
  `WS /api/v1/ws/live/{match_id}/chat` (live chat) are wired up in **Phase 5**.
- The RTMP/SRT → transcoder → HLS → CDN pipeline is built in **Phase 6**, entirely
  separate from the FastAPI backend (which only ever stores stream metadata).

## 11. API design

Every endpoint returns the same envelope:

```json
{ "success": true, "message": "Login successful", "data": { } }
```

Validation/auth/server errors use the same shape with `success: false` and an
appropriate 4xx/5xx status code; unhandled exceptions are logged server-side and
never leak a stack trace to the client.

Implemented so far: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`,
`POST /api/v1/auth/refresh`, `POST /api/v1/auth/logout`, `GET /api/v1/users/me`,
`PATCH /api/v1/users/me`. Full interactive docs at `/docs`.

## 12. Production deployment (AWS, CI/CD)

Deployed to a single EC2 instance (Ubuntu 22.04, `t3.micro`) provisioned by
Terraform, with GitHub Actions handling build + deploy on every push to `main`.
Deliberately **not** ECS/RDS/ElastiCache — that's a lot of managed-service surface
area for what's still an auth-only skeleton; a single box fronted by nginx is the
right amount of infrastructure for this stage, and it reuses the same
`docker-compose` design used for local dev. See `infra/terraform/README.md` for
the full rationale and `infra/terraform/` for the actual config.

**Architecture**: nginx is the only container with a published port (80). It
reverse-proxies `/api/*`, `/docs`, `/redoc`, `/health` to the `backend` container,
and serves the **pre-built static files** for both `web` (`/`) and `admin`
(`/admin/`) directly — those two SPAs are built in GitHub Actions (not on the
server) and baked into the nginx image at deploy time via `nginx/Dockerfile`
(`docker-compose.prod.yml`). Postgres/Redis have no published ports — reachable
only from `backend`, inside the compose network. This is why `admin/vite.config.js`
sets `base: '/admin/'` and `admin/src/App.jsx`'s `<BrowserRouter>` sets
`basename="/admin"` in production builds — both apps share one origin, so no
extra CORS configuration is needed either.

**Credentials, deliberately split by blast radius**: AWS credentials are used
**once, locally, to run `terraform apply`** and are never given to GitHub Actions
at all. The CI/CD pipeline (`.github/workflows/ci-cd.yml`) only holds an SSH key
scoped to this one box (`EC2_SSH_PRIVATE_KEY`, `EC2_HOST` repo secrets) — a much
smaller blast radius than long-lived AWS keys sitting in repo secrets. `JWT_SECRET`
and the Postgres password are generated by Terraform (`random_password`) and
written to `.env` files on the box by `user_data` at first boot; deploys `rsync`
the repo to `/opt/cricstate` but always exclude `.env`, so those secrets are never
overwritten or round-tripped through GitHub.

**One-time setup** (only a human with AWS console access can do this — see
`infra/terraform/README.md` for full detail):
1. Create an IAM user (not root) with the policy in `infra/terraform/iam-policy.json`.
2. `terraform apply` in `infra/terraform/` (credentials exported as shell env vars
   for that one command, never written to disk) — provisions the box and prints
   its Elastic IP.
3. Add `EC2_SSH_PRIVATE_KEY` (the deploy keypair's private half) and `EC2_HOST`
   (the Elastic IP) as GitHub Actions repo secrets.

After that, every push to `main` runs tests, then builds and deploys automatically.
TLS/a custom domain, ECR, RDS/ElastiCache, multi-AZ, and automated DB backups
beyond the EBS volume itself are explicitly deferred — not needed yet, and easy
to add later without restructuring what's here.

## 13. Roadmap

Phase 1 (this phase) → 2 Profiles/RBAC depth → 3 Cricket core (players/teams/
tournaments/matches/scoring) → 4 Social/community → 5 WebSocket live score/chat →
6 Live video → 7 Store → 8 PRO → 9 Admin business features → 10 Production hardening.
