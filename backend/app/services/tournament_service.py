import uuid
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_owner_or_admin
from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.tournament import Tournament, TournamentTeam
from app.models.user import User
from app.repositories.match_repository import MatchRepository
from app.repositories.team_repository import TeamRepository
from app.repositories.tournament_repository import TournamentRepository
from app.schemas.team import TeamOut
from app.schemas.tournament import (
    PointsTableRow,
    RegisterTeamRequest,
    TournamentCreate,
    TournamentOut,
    TournamentUpdate,
    UpdateRegistrationRequest,
)
from app.utils.pagination import PageParams, paginated_response


class TournamentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.tournaments = TournamentRepository(db)
        self.teams = TeamRepository(db)
        self.matches = MatchRepository(db)

    async def create_tournament(
        self, current_user: User, payload: TournamentCreate
    ) -> Tournament:
        tournament = Tournament(
            name=payload.name,
            description=payload.description,
            format=payload.format.value,
            start_date=payload.start_date,
            end_date=payload.end_date,
            location=payload.location,
            logo_url=payload.logo_url,
            organizer_id=current_user.id,
        )
        await self.tournaments.create(tournament)
        await self.db.commit()
        await self.db.refresh(tournament)
        return tournament

    async def get_tournament_or_404(self, tournament_id: uuid.UUID) -> Tournament:
        tournament = await self.tournaments.get_by_id(tournament_id)
        if not tournament:
            raise NotFoundError("Tournament not found")
        return tournament

    async def _require_organizer(self, current_user: User, tournament: Tournament) -> None:
        if not is_owner_or_admin(current_user, tournament.organizer_id):
            raise ForbiddenError("You do not have permission to manage this tournament")

    async def update_tournament(
        self, current_user: User, tournament_id: uuid.UUID, payload: TournamentUpdate
    ) -> Tournament:
        tournament = await self.get_tournament_or_404(tournament_id)
        await self._require_organizer(current_user, tournament)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(tournament, field, value)

        await self.db.commit()
        await self.db.refresh(tournament)
        return tournament

    async def list_tournaments(
        self,
        status: Optional[str],
        params: PageParams,
        organizer_id: Optional[uuid.UUID] = None,
    ) -> dict:
        tournaments, total = await self.tournaments.list(
            status, params.limit, params.offset, organizer_id
        )
        items = [
            TournamentOut(
                id=t.id,
                name=t.name,
                description=t.description,
                format=t.format,
                start_date=t.start_date,
                end_date=t.end_date,
                location=t.location,
                logo_url=t.logo_url,
                organizer_id=t.organizer_id,
                status=t.status,
                team_count=len(t.team_links),
                created_at=t.created_at,
            ).model_dump()
            for t in tournaments
        ]
        return paginated_response(items, total, params)

    async def register_team(
        self, current_user: User, tournament_id: uuid.UUID, payload: RegisterTeamRequest
    ) -> TournamentTeam:
        tournament = await self.get_tournament_or_404(tournament_id)
        team = await self.teams.get_by_id(payload.team_id)
        if not team:
            raise NotFoundError("Team not found")

        # A team's own owner can register it; the tournament organizer/admin
        # can register any team (e.g. adding teams on their behalf).
        if not (
            is_owner_or_admin(current_user, team.created_by)
            or is_owner_or_admin(current_user, tournament.organizer_id)
        ):
            raise ForbiddenError("You do not have permission to register this team")

        existing = await self.tournaments.get_registration(tournament_id, payload.team_id)
        if existing:
            raise AppError("Team is already registered for this tournament")

        registration = TournamentTeam(tournament_id=tournament_id, team_id=payload.team_id)
        await self.tournaments.register_team(registration)
        await self.db.commit()
        await self.db.refresh(registration)
        return registration

    async def update_registration(
        self,
        current_user: User,
        tournament_id: uuid.UUID,
        team_id: uuid.UUID,
        payload: UpdateRegistrationRequest,
    ) -> TournamentTeam:
        tournament = await self.get_tournament_or_404(tournament_id)
        await self._require_organizer(current_user, tournament)

        registration = await self.tournaments.get_registration(tournament_id, team_id)
        if not registration:
            raise NotFoundError("Registration not found")

        registration.status = payload.status
        await self.db.commit()
        await self.db.refresh(registration)
        return registration

    async def get_points_table(self, tournament_id: uuid.UUID) -> List[PointsTableRow]:
        tournament = await self.get_tournament_or_404(tournament_id)
        approved_team_ids = [
            link.team_id for link in tournament.team_links if link.status == "APPROVED"
        ]
        completed_matches = await self.matches.list_completed_for_tournament(tournament_id)

        rows: List[PointsTableRow] = []
        for team_id in approved_team_ids:
            team = await self.teams.get_by_id(team_id)
            played = won = lost = tied = 0
            runs_for = 0.0
            overs_faced = 0.0
            runs_against = 0.0
            overs_bowled = 0.0

            for match in completed_matches:
                if team_id not in (match.team_a_id, match.team_b_id):
                    continue
                played += 1
                if match.winner_team_id == team_id:
                    won += 1
                elif match.winner_team_id is None:
                    tied += 1
                else:
                    lost += 1

                for innings in match.innings:
                    overs = innings.legal_balls_bowled / 6
                    if innings.batting_team_id == team_id:
                        runs_for += innings.total_runs
                        overs_faced += overs
                    elif innings.bowling_team_id == team_id:
                        runs_against += innings.total_runs
                        overs_bowled += overs

            run_rate_for = (runs_for / overs_faced) if overs_faced > 0 else 0.0
            run_rate_against = (runs_against / overs_bowled) if overs_bowled > 0 else 0.0

            rows.append(
                PointsTableRow(
                    team=TeamOut.model_validate(
                        {
                            "id": team.id,
                            "name": team.name,
                            "logo_url": team.logo_url,
                            "home_ground": team.home_ground,
                            "created_by": team.created_by,
                            "player_count": len(team.player_links),
                            "created_at": team.created_at,
                        }
                    ),
                    played=played,
                    won=won,
                    lost=lost,
                    tied=tied,
                    points=won * 2 + tied * 1,
                    net_run_rate=round(run_rate_for - run_rate_against, 3),
                )
            )

        rows.sort(key=lambda r: (r.points, r.net_run_rate), reverse=True)
        return rows
