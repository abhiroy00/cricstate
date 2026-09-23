import uuid
from typing import Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_owner_or_admin
from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.innings import Innings
from app.models.match import Match, MatchStatus, TossDecision
from app.models.user import User
from app.repositories.innings_repository import InningsRepository
from app.repositories.match_repository import MatchRepository
from app.repositories.team_repository import TeamRepository
from app.schemas.match import MatchCreate, MatchOut, MatchUpdate, StartMatchRequest, TossRequest
from app.utils.pagination import PageParams, paginated_response


class MatchService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.matches = MatchRepository(db)
        self.teams = TeamRepository(db)
        self.innings_repo = InningsRepository(db)

    async def create_match(self, current_user: User, payload: MatchCreate) -> Match:
        if payload.team_a_id == payload.team_b_id:
            raise AppError("A team cannot play itself")

        for team_id in (payload.team_a_id, payload.team_b_id):
            if not await self.teams.get_by_id(team_id):
                raise NotFoundError(f"Team {team_id} not found")

        match = Match(
            tournament_id=payload.tournament_id,
            team_a_id=payload.team_a_id,
            team_b_id=payload.team_b_id,
            match_type=payload.match_type.value,
            overs_limit=payload.overs_limit,
            venue=payload.venue,
            scheduled_at=payload.scheduled_at,
            created_by=current_user.id,
            scorer_id=current_user.id,
        )
        await self.matches.create(match)
        await self.db.commit()
        await self.db.refresh(match)
        return match

    async def get_match_or_404(self, match_id: uuid.UUID) -> Match:
        match = await self.matches.get_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")
        return match

    def _require_scorer(self, current_user: User, match: Match) -> None:
        allowed = (
            current_user.id == match.created_by
            or current_user.id == match.scorer_id
            or is_owner_or_admin(current_user, match.created_by)
        )
        if not allowed:
            raise ForbiddenError("You do not have permission to manage this match")

    async def update_match(
        self, current_user: User, match_id: uuid.UUID, payload: MatchUpdate
    ) -> Match:
        match = await self.get_match_or_404(match_id)
        self._require_scorer(current_user, match)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(match, field, value)

        await self.db.commit()
        await self.db.refresh(match)
        return match

    async def list_matches(
        self,
        status: Optional[str],
        team_id: Optional[uuid.UUID],
        tournament_id: Optional[uuid.UUID],
        params: PageParams,
    ) -> dict:
        matches, total = await self.matches.list(
            status, team_id, tournament_id, params.limit, params.offset
        )
        items = [MatchOut.model_validate(m).model_dump() for m in matches]
        return paginated_response(items, total, params)

    async def record_toss(
        self, current_user: User, match_id: uuid.UUID, payload: TossRequest
    ) -> Match:
        match = await self.get_match_or_404(match_id)
        self._require_scorer(current_user, match)

        if match.status != MatchStatus.SCHEDULED.value:
            raise AppError("Toss can only be recorded before the match starts")
        if payload.toss_winner_team_id not in (match.team_a_id, match.team_b_id):
            raise AppError("Toss winner must be one of the two playing teams")

        match.toss_winner_team_id = payload.toss_winner_team_id
        match.toss_decision = payload.toss_decision.value
        await self.db.commit()
        await self.db.refresh(match)
        return match

    async def start_match(
        self, current_user: User, match_id: uuid.UUID, payload: StartMatchRequest
    ) -> Innings:
        match = await self.get_match_or_404(match_id)
        self._require_scorer(current_user, match)

        if match.status != MatchStatus.SCHEDULED.value:
            raise AppError("Match has already started")
        if not match.toss_winner_team_id or not match.toss_decision:
            raise AppError("Record the toss before starting the match")

        batting_first_is_toss_winner = match.toss_decision == TossDecision.BAT.value
        if match.toss_winner_team_id == match.team_a_id:
            batting_team_id = match.team_a_id if batting_first_is_toss_winner else match.team_b_id
            bowling_team_id = match.team_b_id if batting_first_is_toss_winner else match.team_a_id
        else:
            batting_team_id = match.team_b_id if batting_first_is_toss_winner else match.team_a_id
            bowling_team_id = match.team_a_id if batting_first_is_toss_winner else match.team_b_id

        await self._validate_roster_membership(batting_team_id, [payload.striker_id, payload.non_striker_id])
        await self._validate_roster_membership(bowling_team_id, [payload.bowler_id])
        if payload.striker_id == payload.non_striker_id:
            raise AppError("Striker and non-striker must be different players")

        innings = Innings(
            match_id=match.id,
            innings_number=1,
            batting_team_id=batting_team_id,
            bowling_team_id=bowling_team_id,
            current_striker_id=payload.striker_id,
            current_non_striker_id=payload.non_striker_id,
            current_bowler_id=payload.bowler_id,
        )
        await self.innings_repo.create(innings)
        match.status = MatchStatus.LIVE.value
        await self.db.commit()
        await self.db.refresh(innings)
        return innings

    async def _validate_roster_membership(self, team_id: uuid.UUID, player_ids: list[uuid.UUID]) -> None:
        team = await self.teams.get_by_id(team_id)
        roster_ids = {link.player_id for link in team.player_links}
        for player_id in player_ids:
            if player_id not in roster_ids:
                raise AppError(f"Player {player_id} is not on the roster of team {team_id}")
