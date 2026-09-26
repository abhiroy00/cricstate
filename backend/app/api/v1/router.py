from fastapi import APIRouter

from app.api.v1 import admin, auth, engagement, home, leaderboards, matches, memberships, players, profiles, scoring, store, teams, tournaments, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(profiles.router)
api_router.include_router(players.router)
api_router.include_router(teams.router)
api_router.include_router(tournaments.router)
api_router.include_router(matches.router)
api_router.include_router(scoring.router)
api_router.include_router(home.router)
api_router.include_router(admin.router)
api_router.include_router(store.router)
api_router.include_router(memberships.router)
api_router.include_router(engagement.router)
api_router.include_router(leaderboards.router)
