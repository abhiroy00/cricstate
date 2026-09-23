from fastapi import APIRouter

from app.api.v1 import auth, matches, players, profiles, scoring, teams, tournaments, users

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(profiles.router)
api_router.include_router(players.router)
api_router.include_router(teams.router)
api_router.include_router(tournaments.router)
api_router.include_router(matches.router)
api_router.include_router(scoring.router)
