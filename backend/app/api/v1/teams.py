import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.player import PlayerOut
from app.schemas.team import (
    AddPlayerToTeamRequest,
    JoinTeamRequest,
    TeamCreate,
    TeamInviteOut,
    TeamOut,
    TeamRosterEntryOut,
    TeamUpdate,
    UpdateTeamPlayerRequest,
)
from app.services.team_service import TeamService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/teams", tags=["teams"])


def _team_out(team) -> dict:
    return TeamOut(
        id=team.id,
        name=team.name,
        logo_url=team.logo_url,
        home_ground=team.home_ground,
        created_by=team.created_by,
        player_count=len(team.player_links),
        created_at=team.created_at,
    ).model_dump()


def _roster_entry_out(team_player) -> dict:
    return TeamRosterEntryOut(
        player=PlayerOut.model_validate(team_player.player),
        is_captain=team_player.is_captain,
        is_vice_captain=team_player.is_vice_captain,
        jersey_number=team_player.jersey_number,
    ).model_dump()


@router.post("")
async def create_team(
    payload: TeamCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    team = await service.create_team(current_user, payload)
    return success_response(_team_out(team), message="Team created")


@router.get("")
async def list_teams(
    search: str | None = Query(default=None),
    created_by: uuid.UUID | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    page = await service.list_teams(search, PageParams(limit=limit, offset=offset), created_by)
    return success_response(page)


@router.get("/opponents")
async def list_opponent_teams(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    teams = await service.list_opponents(current_user)
    return success_response(teams)


@router.post("/join")
async def join_team(
    payload: JoinTeamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    team_player = await service.join_via_code(current_user, payload.code)
    return success_response(
        {**_roster_entry_out(team_player), "team_id": str(team_player.team_id)},
        message="Joined team",
    )


@router.get("/{team_id}")
async def get_team(team_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = TeamService(db)
    team = await service.get_team_or_404(team_id)
    return success_response(_team_out(team))


@router.patch("/{team_id}")
async def update_team(
    team_id: uuid.UUID,
    payload: TeamUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    team = await service.update_team(current_user, team_id, payload)
    return success_response(_team_out(team), message="Team updated")


@router.get("/{team_id}/invite")
async def get_team_invite(
    team_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    invite = await service.get_or_create_invite(current_user, team_id)
    return success_response(TeamInviteOut(code=invite.code).model_dump())


@router.get("/{team_id}/roster")
async def get_roster(team_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = TeamService(db)
    roster = await service.get_roster(team_id)
    return success_response([_roster_entry_out(tp) for tp in roster])


@router.post("/{team_id}/roster")
async def add_player_to_team(
    team_id: uuid.UUID,
    payload: AddPlayerToTeamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    team_player = await service.add_player(current_user, team_id, payload)
    return success_response(_roster_entry_out(team_player), message="Player added to roster")


@router.patch("/{team_id}/roster/{player_id}")
async def update_team_player(
    team_id: uuid.UUID,
    player_id: uuid.UUID,
    payload: UpdateTeamPlayerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    team_player = await service.update_team_player(current_user, team_id, player_id, payload)
    return success_response(_roster_entry_out(team_player), message="Roster entry updated")


@router.delete("/{team_id}/roster/{player_id}")
async def remove_player_from_team(
    team_id: uuid.UUID,
    player_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TeamService(db)
    await service.remove_player(current_user, team_id, player_id)
    return success_response(None, message="Player removed from roster")
