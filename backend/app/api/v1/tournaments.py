import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user
from app.core.database import get_db
from app.models.tournament import TournamentStatus
from app.models.user import User
from app.schemas.common import success_response
from app.schemas.tournament import (
    RegisterTeamRequest,
    TournamentCreate,
    TournamentOut,
    TournamentTeamOut,
    TournamentUpdate,
    UpdateRegistrationRequest,
)
from app.schemas.team import TeamOut
from app.services.tournament_service import TournamentService
from app.utils.pagination import PageParams

router = APIRouter(prefix="/tournaments", tags=["tournaments"])


def _tournament_out(t) -> dict:
    return TournamentOut(
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


@router.post("")
async def create_tournament(
    payload: TournamentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TournamentService(db)
    tournament = await service.create_tournament(current_user, payload)
    return success_response(_tournament_out(tournament), message="Tournament created")


@router.get("")
async def list_tournaments(
    status: TournamentStatus | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
    db: AsyncSession = Depends(get_db),
):
    service = TournamentService(db)
    page = await service.list_tournaments(
        status.value if status else None, PageParams(limit=limit, offset=offset)
    )
    return success_response(page)


@router.get("/{tournament_id}")
async def get_tournament(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = TournamentService(db)
    tournament = await service.get_tournament_or_404(tournament_id)
    return success_response(_tournament_out(tournament))


@router.patch("/{tournament_id}")
async def update_tournament(
    tournament_id: uuid.UUID,
    payload: TournamentUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TournamentService(db)
    tournament = await service.update_tournament(current_user, tournament_id, payload)
    return success_response(_tournament_out(tournament), message="Tournament updated")


@router.get("/{tournament_id}/teams")
async def list_tournament_teams(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = TournamentService(db)
    tournament = await service.get_tournament_or_404(tournament_id)
    items = [
        TournamentTeamOut(
            team=TeamOut(
                id=link.team.id,
                name=link.team.name,
                logo_url=link.team.logo_url,
                home_ground=link.team.home_ground,
                created_by=link.team.created_by,
                player_count=len(link.team.player_links),
                created_at=link.team.created_at,
            ),
            status=link.status,
            registered_at=link.registered_at,
        ).model_dump()
        for link in tournament.team_links
    ]
    return success_response(items)


@router.post("/{tournament_id}/teams")
async def register_team(
    tournament_id: uuid.UUID,
    payload: RegisterTeamRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TournamentService(db)
    registration = await service.register_team(current_user, tournament_id, payload)
    return success_response(
        {"team_id": str(registration.team_id), "status": registration.status},
        message="Team registered",
    )


@router.patch("/{tournament_id}/teams/{team_id}")
async def update_registration(
    tournament_id: uuid.UUID,
    team_id: uuid.UUID,
    payload: UpdateRegistrationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    service = TournamentService(db)
    registration = await service.update_registration(current_user, tournament_id, team_id, payload)
    return success_response(
        {"team_id": str(registration.team_id), "status": registration.status},
        message="Registration updated",
    )


@router.get("/{tournament_id}/points-table")
async def get_points_table(tournament_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    service = TournamentService(db)
    rows = await service.get_points_table(tournament_id)
    return success_response([row.model_dump() for row in rows])
