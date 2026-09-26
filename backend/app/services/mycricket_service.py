from sqlalchemy.ext.asyncio import AsyncSession

from app.models.team import Team
from app.models.tournament import Tournament
from app.models.user import User
from app.repositories.match_repository import MatchRepository
from app.repositories.player_repository import PlayerRepository
from app.repositories.team_repository import TeamRepository
from app.repositories.tournament_repository import TournamentRepository
from app.schemas.match import MatchOut
from app.schemas.player import PlayerOut
from app.schemas.team import TeamOut
from app.schemas.tournament import TournamentOut
from app.services.player_service import PlayerService


class MyCricketService:
    """Single-call aggregation behind the mobile MyCricket home.

    Tabs are Matches / Tournaments / Teams / Stats / Highlights. "Your"
    items are derived from what the signed-in user created, scored, or is
    attached to through their linked player profile or owned team - so the
    client renders without firing off one request per tab.
    """

    def __init__(self, db: AsyncSession):
        self.db = db
        self.matches = MatchRepository(db)
        self.teams = TeamRepository(db)
        self.tournaments = TournamentRepository(db)
        self.players = PlayerRepository(db)

    async def get_overview(self, current_user: User, limit: int = 20) -> dict:
        player = await self.players.get_by_user_id(current_user.id)
        teams = await self.teams.list_for_user(
            current_user.id, player.id if player else None
        )
        team_ids = [team.id for team in teams]

        matches, _ = await self.matches.list_for_user(
            current_user.id, team_ids, limit
        )
        tournaments = await self.tournaments.list_for_user(current_user.id, team_ids)

        match_items = [MatchOut.model_validate(m).model_dump(mode="json") for m in matches]
        team_items = [self._team_out(team) for team in teams]
        tournament_items = [self._tournament_out(t) for t in tournaments]
        user_id = str(current_user.id)

        played = [m for m in match_items if m["status"] == "COMPLETED"]
        live = [m for m in match_items if m["status"] == "LIVE"]
        organized = [t for t in tournament_items if t["organizer_id"] == user_id]
        participating = [t for t in tournament_items if t["organizer_id"] != user_id]

        stats = None
        if player:
            career = await PlayerService(self.db).get_career_stats(player.id)
            stats = career.model_dump(mode="json")

        return {
            "user_id": user_id,
            "counts": {
                "matches": len(match_items),
                "played_matches": len(played),
                "live_matches": len(live),
                "tournaments": len(tournament_items),
                "teams": len(team_items),
            },
            "matches": {"your": match_items, "played": played, "live": live},
            "tournaments": {"organized": organized, "participating": participating},
            "teams": team_items,
            "player": (
                PlayerOut.model_validate(player).model_dump(mode="json")
                if player
                else None
            ),
            "stats": stats,
            # AI highlights aren't generated yet (Phase 6 live video); the
            # shape is fixed now so the section renders an empty state.
            "highlights": {"count": 0, "items": []},
        }

    @staticmethod
    def _team_out(team: Team) -> dict:
        return TeamOut(
            id=team.id,
            name=team.name,
            logo_url=team.logo_url,
            home_ground=team.home_ground,
            created_by=team.created_by,
            player_count=len(team.player_links),
            created_at=team.created_at,
        ).model_dump(mode="json")

    @staticmethod
    def _tournament_out(tournament: Tournament) -> dict:
        return TournamentOut(
            id=tournament.id,
            name=tournament.name,
            description=tournament.description,
            format=tournament.format,
            start_date=tournament.start_date,
            end_date=tournament.end_date,
            location=tournament.location,
            logo_url=tournament.logo_url,
            organizer_id=tournament.organizer_id,
            status=tournament.status,
            team_count=len(tournament.team_links),
            created_at=tournament.created_at,
        ).model_dump(mode="json")
