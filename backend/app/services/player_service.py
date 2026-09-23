import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_owner_or_admin
from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.player import Player
from app.models.user import User
from app.repositories.player_repository import PlayerRepository
from app.repositories.player_stats_repository import PlayerStatsRepository
from app.schemas.player import PlayerCareerStatsOut, PlayerCreate, PlayerOut, PlayerUpdate
from app.utils.pagination import PageParams, paginated_response


class PlayerService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.players = PlayerRepository(db)
        self.player_stats = PlayerStatsRepository(db)

    async def create_player(self, current_user: User, payload: PlayerCreate) -> Player:
        player = Player(
            user_id=payload.user_id,
            created_by=current_user.id,
            full_name=payload.full_name,
            role=payload.role.value,
            batting_style=payload.batting_style,
            bowling_style=payload.bowling_style,
            profile_photo_url=payload.profile_photo_url,
        )
        await self.players.create(player)
        await self.db.commit()
        await self.db.refresh(player)
        return player

    async def get_player_or_404(self, player_id: uuid.UUID) -> Player:
        player = await self.players.get_by_id(player_id)
        if not player:
            raise NotFoundError("Player not found")
        return player

    async def get_player_by_user_id_or_404(self, user_id: uuid.UUID) -> Player:
        player = await self.players.get_by_user_id(user_id)
        if not player:
            raise NotFoundError("No player profile linked to this account")
        return player

    async def update_player(
        self, current_user: User, player_id: uuid.UUID, payload: PlayerUpdate
    ) -> Player:
        player = await self.get_player_or_404(player_id)
        if not is_owner_or_admin(current_user, player.created_by):
            raise ForbiddenError("You do not have permission to edit this player")

        data = payload.model_dump(exclude_unset=True)
        if "role" in data and data["role"] is not None:
            data["role"] = data["role"].value
        for field, value in data.items():
            setattr(player, field, value)

        await self.db.commit()
        await self.db.refresh(player)
        return player

    async def list_players(self, search: str | None, role: str | None, params: PageParams) -> dict:
        players, total = await self.players.list(search, role, params.limit, params.offset)
        items = [PlayerOut.model_validate(p).model_dump() for p in players]
        return paginated_response(items, total, params)

    async def get_career_stats(self, player_id: uuid.UUID) -> PlayerCareerStatsOut:
        await self.get_player_or_404(player_id)
        rows = await self.player_stats.list_for_player(player_id)

        runs_scored = sum(r.runs_scored for r in rows)
        balls_faced = sum(r.balls_faced for r in rows)
        fours = sum(r.fours for r in rows)
        sixes = sum(r.sixes for r in rows)
        wickets_taken = sum(r.wickets_taken for r in rows)
        balls_bowled = sum(r.balls_bowled for r in rows)
        runs_conceded = sum(r.runs_conceded for r in rows)
        dismissals = sum(1 for r in rows if r.was_out)
        catches = sum(r.catches for r in rows)
        stumpings = sum(r.stumpings for r in rows)
        run_outs = sum(r.run_outs for r in rows)

        return PlayerCareerStatsOut(
            player_id=player_id,
            matches_played=len(rows),
            runs_scored=runs_scored,
            balls_faced=balls_faced,
            fours=fours,
            sixes=sixes,
            not_outs=len(rows) - dismissals,
            highest_score=max((r.runs_scored for r in rows), default=0),
            hundreds=sum(1 for r in rows if r.runs_scored >= 100),
            fifties=sum(1 for r in rows if 50 <= r.runs_scored < 100),
            batting_average=round(runs_scored / dismissals, 2) if dismissals > 0 else None,
            strike_rate=round((runs_scored / balls_faced) * 100, 2) if balls_faced > 0 else None,
            wickets_taken=wickets_taken,
            balls_bowled=balls_bowled,
            runs_conceded=runs_conceded,
            bowling_average=round(runs_conceded / wickets_taken, 2) if wickets_taken > 0 else None,
            economy_rate=round(runs_conceded / (balls_bowled / 6), 2) if balls_bowled > 0 else None,
            catches=catches,
            stumpings=stumpings,
            run_outs=run_outs,
        )
