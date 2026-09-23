import uuid
from typing import List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_owner_or_admin
from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.player import Player, PlayerRole
from app.models.team import Team, TeamPlayer
from app.models.user import User
from app.repositories.player_repository import PlayerRepository
from app.repositories.team_repository import TeamRepository
from app.schemas.team import (
    AddPlayerToTeamRequest,
    TeamCreate,
    TeamOut,
    TeamUpdate,
    UpdateTeamPlayerRequest,
)
from app.utils.pagination import PageParams, paginated_response


class TeamService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.teams = TeamRepository(db)
        self.players = PlayerRepository(db)

    async def create_team(self, current_user: User, payload: TeamCreate) -> Team:
        team = Team(
            name=payload.name,
            logo_url=payload.logo_url,
            home_ground=payload.home_ground,
            created_by=current_user.id,
        )
        await self.teams.create(team)
        await self.db.commit()
        await self.db.refresh(team)
        return team

    async def get_team_or_404(self, team_id: uuid.UUID) -> Team:
        team = await self.teams.get_by_id(team_id)
        if not team:
            raise NotFoundError("Team not found")
        return team

    async def _require_team_owner(self, current_user: User, team: Team) -> None:
        if not is_owner_or_admin(current_user, team.created_by):
            raise ForbiddenError("You do not have permission to manage this team")

    async def update_team(
        self, current_user: User, team_id: uuid.UUID, payload: TeamUpdate
    ) -> Team:
        team = await self.get_team_or_404(team_id)
        await self._require_team_owner(current_user, team)

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(team, field, value)

        await self.db.commit()
        await self.db.refresh(team)
        return team

    async def list_teams(self, search: Optional[str], params: PageParams) -> dict:
        teams, total = await self.teams.list(search, params.limit, params.offset)
        items = [
            TeamOut(
                id=t.id,
                name=t.name,
                logo_url=t.logo_url,
                home_ground=t.home_ground,
                created_by=t.created_by,
                player_count=len(t.player_links),
                created_at=t.created_at,
            ).model_dump()
            for t in teams
        ]
        return paginated_response(items, total, params)

    async def get_roster(self, team_id: uuid.UUID) -> List[TeamPlayer]:
        team = await self.get_team_or_404(team_id)
        return team.player_links

    async def add_player(
        self, current_user: User, team_id: uuid.UUID, payload: AddPlayerToTeamRequest
    ) -> TeamPlayer:
        team = await self.get_team_or_404(team_id)
        await self._require_team_owner(current_user, team)

        if payload.player_id:
            player = await self.players.get_by_id(payload.player_id)
            if not player:
                raise NotFoundError("Player not found")
        else:
            if not payload.new_player_full_name:
                raise AppError("Provide either player_id or new_player_full_name")
            role = payload.new_player_role or PlayerRole.BATSMAN.value
            player = Player(
                created_by=current_user.id,
                full_name=payload.new_player_full_name,
                role=role,
            )
            await self.players.create(player)
            await self.db.flush()

        existing = await self.teams.get_team_player(team_id, player.id)
        if existing:
            raise AppError("Player is already on this team's roster")

        team_player = TeamPlayer(
            team_id=team_id, player_id=player.id, jersey_number=payload.jersey_number
        )
        await self.teams.add_player(team_player)
        await self.db.commit()
        await self.db.refresh(team_player)
        return team_player

    async def remove_player(
        self, current_user: User, team_id: uuid.UUID, player_id: uuid.UUID
    ) -> None:
        team = await self.get_team_or_404(team_id)
        await self._require_team_owner(current_user, team)

        team_player = await self.teams.get_team_player(team_id, player_id)
        if not team_player:
            raise NotFoundError("Player is not on this team's roster")

        await self.teams.remove_player(team_player)
        await self.db.commit()

    async def update_team_player(
        self,
        current_user: User,
        team_id: uuid.UUID,
        player_id: uuid.UUID,
        payload: UpdateTeamPlayerRequest,
    ) -> TeamPlayer:
        team = await self.get_team_or_404(team_id)
        await self._require_team_owner(current_user, team)

        team_player = await self.teams.get_team_player(team_id, player_id)
        if not team_player:
            raise NotFoundError("Player is not on this team's roster")

        for field, value in payload.model_dump(exclude_unset=True).items():
            setattr(team_player, field, value)

        await self.db.commit()
        await self.db.refresh(team_player)
        return team_player
