from collections import defaultdict

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.match import Match
from app.models.player import Player
from app.models.player_stats import PlayerMatchStats
from app.models.team import Team
from app.schemas.common import success_response

router = APIRouter(prefix="/leaderboards", tags=["leaderboards"])


@router.get("/teams")
async def team_leaderboard(
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """TopTeams / CricLeaderboards screen: real W/L from completed matches."""
    teams = (await db.execute(select(Team))).scalars().all()
    matches = (
        await db.execute(select(Match).where(Match.status == "COMPLETED"))
    ).scalars().all()

    played: dict = defaultdict(int)
    won: dict = defaultdict(int)
    for m in matches:
        played[m.team_a_id] += 1
        played[m.team_b_id] += 1
        if m.winner_team_id:
            won[m.winner_team_id] += 1

    rows = []
    for t in teams:
        p = played.get(t.id, 0)
        w = won.get(t.id, 0)
        rows.append(
            {
                "team": {
                    "id": str(t.id),
                    "name": t.name,
                    "logo_url": t.logo_url,
                    "home_ground": t.home_ground,
                },
                "played": p,
                "won": w,
                "lost": p - w,
                "points": w * 2,
            }
        )
    rows.sort(key=lambda r: (r["points"], r["won"]), reverse=True)
    return success_response({"items": rows[:limit], "total": len(rows)})


@router.get("/players")
async def player_leaderboard(
    category: str = Query(default="batting"),  # batting | bowling
    limit: int = Query(default=20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    """CricLeaderboards player tables aggregated from PlayerMatchStats."""
    stats_rows = (await db.execute(select(PlayerMatchStats))).scalars().all()
    players = {p.id: p for p in (await db.execute(select(Player))).scalars().all()}

    batting: dict = defaultdict(lambda: {"runs": 0, "balls": 0, "outs": 0})
    bowling: dict = defaultdict(lambda: {"wickets": 0, "runs": 0, "balls": 0})
    for s in stats_rows:
        b = batting[s.player_id]
        b["runs"] += s.runs_scored
        b["balls"] += s.balls_faced
        b["outs"] += 1 if s.was_out else 0
        bw = bowling[s.player_id]
        bw["wickets"] += s.wickets_taken
        bw["runs"] += s.runs_conceded
        bw["balls"] += s.balls_bowled

    rows = []
    if category == "bowling":
        for pid, b in bowling.items():
            p = players.get(pid)
            if not p or b["wickets"] == 0:
                continue
            overs = b["balls"] / 6 if b["balls"] else 0
            rows.append(
                {
                    "player": {"id": str(p.id), "full_name": p.full_name, "role": p.role},
                    "wickets": b["wickets"],
                    "economy": round(b["runs"] / overs, 2) if overs else 0.0,
                    "runs_conceded": b["runs"],
                }
            )
        rows.sort(key=lambda r: (-r["wickets"], r["economy"]))
    else:
        for pid, b in batting.items():
            p = players.get(pid)
            if not p or (b["runs"] == 0 and b["balls"] == 0):
                continue
            rows.append(
                {
                    "player": {"id": str(p.id), "full_name": p.full_name, "role": p.role},
                    "runs": b["runs"],
                    "average": round(b["runs"] / b["outs"], 2) if b["outs"] else None,
                    "strike_rate": round((b["runs"] / b["balls"]) * 100, 2) if b["balls"] else 0.0,
                }
            )
        rows.sort(key=lambda r: -r["runs"])
    return success_response({"items": rows[:limit], "total": len(rows)})
