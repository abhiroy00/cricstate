import uuid
from typing import Dict, List, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.authz import is_owner_or_admin
from app.core.exceptions import AppError, ForbiddenError, NotFoundError
from app.models.delivery import Delivery, ExtraType, WicketType
from app.models.innings import Innings, InningsStatus
from app.models.match import Match, MatchStatus
from app.models.player import Player
from app.models.player_stats import PlayerMatchStats
from app.models.user import User
from app.repositories.delivery_repository import DeliveryRepository
from app.repositories.innings_repository import InningsRepository
from app.repositories.match_repository import MatchRepository
from app.repositories.player_repository import PlayerRepository
from app.repositories.player_stats_repository import PlayerStatsRepository
from app.repositories.team_repository import TeamRepository
from app.schemas.player import PlayerOut
from app.schemas.scoring import (
    BattingCardEntry,
    BowlingCardEntry,
    DeliveryCreate,
    DeliveryOut,
    FallOfWicketEntry,
    InningsOut,
    InningsScorecard,
    LiveStateOut,
    MatchScorecardOut,
    NewBowlerRequest,
)
from app.schemas.match import StartMatchRequest

ALL_OUT_WICKETS = 10

# Run types that count toward strike rotation (i.e. runs actually run between
# the wickets). Wide extras are treated as not rotating strike - a reasonable
# simplification for overthrow edge cases.
ROTATING_EXTRA_TYPES = {ExtraType.NONE.value, ExtraType.NO_BALL.value, ExtraType.BYE.value, ExtraType.LEG_BYE.value}

# Dismissal types that end the ball with no runs off the bat (a batsman given
# out this way cannot simultaneously have scored off the same delivery).
NO_RUN_WICKET_TYPES = {
    WicketType.BOWLED.value,
    WicketType.LBW.value,
    WicketType.HIT_WICKET.value,
    WicketType.CAUGHT.value,
}


class ScoringService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.matches = MatchRepository(db)
        self.innings_repo = InningsRepository(db)
        self.deliveries = DeliveryRepository(db)
        self.players = PlayerRepository(db)
        self.teams = TeamRepository(db)
        self.player_stats = PlayerStatsRepository(db)

    # ---------------------------------------------------------------- utils

    async def _get_live_match_and_innings(self, match_id: uuid.UUID) -> tuple[Match, Innings]:
        match = await self.matches.get_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")
        if match.status != MatchStatus.LIVE.value:
            raise AppError("Match is not live")
        innings = await self.innings_repo.get_current(match_id)
        if not innings:
            raise AppError("No innings in progress")
        return match, innings

    def _require_scorer(self, current_user: User, match: Match) -> None:
        allowed = (
            current_user.id == match.created_by
            or current_user.id == match.scorer_id
            or is_owner_or_admin(current_user, match.created_by)
        )
        if not allowed:
            raise ForbiddenError("You do not have permission to score this match")

    # ------------------------------------------------------------- scoring

    async def record_delivery(
        self, current_user: User, match_id: uuid.UUID, payload: DeliveryCreate
    ) -> Delivery:
        match, innings = await self._get_live_match_and_innings(match_id)
        self._require_scorer(current_user, match)

        if not innings.current_bowler_id:
            raise AppError("Select the next over's bowler before recording a delivery")

        extra_type = payload.extra_type.value
        runs_off_bat = payload.runs_off_bat
        extra_runs = payload.extra_runs

        if extra_type == ExtraType.WIDE.value:
            runs_off_bat = 0
            extra_runs = extra_runs or 1
        elif extra_type == ExtraType.NO_BALL.value:
            extra_runs = extra_runs or 1
        elif extra_type in (ExtraType.BYE.value, ExtraType.LEG_BYE.value):
            runs_off_bat = 0
            if extra_runs == 0:
                raise AppError("Bye/leg-bye deliveries must record at least 1 run")
        else:
            extra_runs = 0

        if payload.is_wicket:
            if not payload.wicket_type:
                raise AppError("wicket_type is required when is_wicket is true")
            if payload.wicket_type.value in (WicketType.CAUGHT.value, WicketType.STUMPED.value, WicketType.RUN_OUT.value) and not payload.fielder_id:
                raise AppError("fielder_id is required for this dismissal type")
            if payload.wicket_type.value in NO_RUN_WICKET_TYPES:
                runs_off_bat = 0

        is_legal_ball = extra_type not in (ExtraType.WIDE.value, ExtraType.NO_BALL.value)
        out_player_id = payload.out_player_id
        if payload.is_wicket and not out_player_id:
            out_player_id = innings.current_striker_id

        # Snapshot pre-delivery state - this is what makes undo fully reversible.
        pre_striker_id = innings.current_striker_id
        pre_non_striker_id = innings.current_non_striker_id
        pre_bowler_id = innings.current_bowler_id

        over_number = innings.legal_balls_bowled // 6
        ball_in_over = (innings.legal_balls_bowled % 6) + 1

        delivery = Delivery(
            innings_id=innings.id,
            over_number=over_number,
            ball_in_over=ball_in_over,
            striker_id=pre_striker_id,
            non_striker_id=pre_non_striker_id,
            bowler_id=pre_bowler_id,
            runs_off_bat=runs_off_bat,
            extra_type=extra_type,
            extra_runs=extra_runs,
            is_legal_ball=is_legal_ball,
            is_wicket=payload.is_wicket,
            wicket_type=payload.wicket_type.value if payload.wicket_type else None,
            out_player_id=out_player_id,
            fielder_id=payload.fielder_id,
        )
        await self.deliveries.create(delivery)

        # --- apply effects to innings state ---
        innings.total_runs += runs_off_bat + extra_runs
        if is_legal_ball:
            innings.legal_balls_bowled += 1
        if payload.is_wicket:
            innings.total_wickets += 1

        rotating_runs = runs_off_bat if extra_type in (ExtraType.NONE.value, ExtraType.NO_BALL.value) else (
            extra_runs if extra_type in (ExtraType.BYE.value, ExtraType.LEG_BYE.value) else 0
        )
        striker_id, non_striker_id = pre_striker_id, pre_non_striker_id
        if rotating_runs % 2 == 1:
            striker_id, non_striker_id = non_striker_id, striker_id

        innings_complete = (
            innings.total_wickets >= ALL_OUT_WICKETS
            or innings.legal_balls_bowled >= match.overs_limit * 6
            or (innings.target is not None and innings.total_runs >= innings.target)
        )

        if payload.is_wicket and innings.total_wickets < ALL_OUT_WICKETS and not innings_complete:
            if not payload.next_batsman_id:
                raise AppError("next_batsman_id is required when a wicket falls mid-innings")
            if out_player_id == striker_id:
                striker_id = payload.next_batsman_id
            elif out_player_id == non_striker_id:
                non_striker_id = payload.next_batsman_id

        over_just_completed = is_legal_ball and innings.legal_balls_bowled % 6 == 0
        if over_just_completed and not innings_complete:
            striker_id, non_striker_id = non_striker_id, striker_id

        innings.current_striker_id = striker_id
        innings.current_non_striker_id = non_striker_id
        innings.current_bowler_id = None if over_just_completed else pre_bowler_id

        if innings_complete:
            innings.status = InningsStatus.COMPLETED.value

        await self.db.commit()
        await self.db.refresh(delivery)
        return delivery

    async def undo_last_delivery(self, current_user: User, match_id: uuid.UUID) -> None:
        match, innings = await self._get_live_match_and_innings(match_id)
        self._require_scorer(current_user, match)

        last = await self.deliveries.get_last(innings.id)
        if not last:
            raise AppError("No deliveries to undo")

        innings.total_runs -= last.runs_off_bat + last.extra_runs
        if last.is_legal_ball:
            innings.legal_balls_bowled -= 1
        if last.is_wicket:
            innings.total_wickets -= 1

        innings.current_striker_id = last.striker_id
        innings.current_non_striker_id = last.non_striker_id
        innings.current_bowler_id = last.bowler_id
        innings.status = InningsStatus.IN_PROGRESS.value

        await self.deliveries.delete(last)
        await self.db.commit()

    async def select_next_bowler(
        self, current_user: User, match_id: uuid.UUID, payload: NewBowlerRequest
    ) -> Innings:
        match, innings = await self._get_live_match_and_innings(match_id)
        self._require_scorer(current_user, match)

        if innings.current_bowler_id is not None:
            raise AppError("Current over is not finished yet")

        bowling_team = await self.teams.get_by_id(innings.bowling_team_id)
        roster_ids = {link.player_id for link in bowling_team.player_links}
        if payload.bowler_id not in roster_ids:
            raise AppError("Bowler is not on the bowling team's roster")

        last_delivery = await self.deliveries.get_last(innings.id)
        if last_delivery and last_delivery.bowler_id == payload.bowler_id:
            raise AppError("A bowler cannot bowl two overs in a row")

        innings.current_bowler_id = payload.bowler_id
        await self.db.commit()
        await self.db.refresh(innings)
        return innings

    # ------------------------------------------------------- innings/match

    async def start_next_innings(
        self, current_user: User, match_id: uuid.UUID, payload: StartMatchRequest
    ) -> Innings:
        match = await self.matches.get_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")
        self._require_scorer(current_user, match)
        if match.status != MatchStatus.LIVE.value:
            raise AppError("Match is not live")

        existing = await self.innings_repo.list_for_match(match_id)
        if len(existing) != 1 or existing[0].status != InningsStatus.COMPLETED.value:
            raise AppError("First innings must be completed before starting the next one")

        first = existing[0]
        batting_team_id = first.bowling_team_id
        bowling_team_id = first.batting_team_id

        batting_team = await self.teams.get_by_id(batting_team_id)
        bowling_team = await self.teams.get_by_id(bowling_team_id)
        batting_roster = {link.player_id for link in batting_team.player_links}
        bowling_roster = {link.player_id for link in bowling_team.player_links}

        for player_id in (payload.striker_id, payload.non_striker_id):
            if player_id not in batting_roster:
                raise AppError(f"Player {player_id} is not on the batting team's roster")
        if payload.bowler_id not in bowling_roster:
            raise AppError("Bowler is not on the bowling team's roster")
        if payload.striker_id == payload.non_striker_id:
            raise AppError("Striker and non-striker must be different players")

        innings = Innings(
            match_id=match_id,
            innings_number=2,
            batting_team_id=batting_team_id,
            bowling_team_id=bowling_team_id,
            target=first.total_runs + 1,
            current_striker_id=payload.striker_id,
            current_non_striker_id=payload.non_striker_id,
            current_bowler_id=payload.bowler_id,
        )
        await self.innings_repo.create(innings)
        await self.db.commit()
        await self.db.refresh(innings)
        return innings

    async def end_match(self, current_user: User, match_id: uuid.UUID) -> Match:
        match = await self.matches.get_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")
        self._require_scorer(current_user, match)
        if match.status != MatchStatus.LIVE.value:
            raise AppError("Match is not live")

        all_innings = await self.innings_repo.list_for_match(match_id)
        if len(all_innings) != 2 or any(i.status != InningsStatus.COMPLETED.value for i in all_innings):
            raise AppError("Both innings must be completed before ending the match")

        first, second = all_innings[0], all_innings[1]

        if second.total_runs >= (second.target or 0):
            winner = await self.teams.get_by_id(second.batting_team_id)
            wickets_left = ALL_OUT_WICKETS - second.total_wickets
            match.winner_team_id = second.batting_team_id
            match.result_summary = f"{winner.name} won by {wickets_left} wicket(s)"
        elif second.total_runs < first.total_runs:
            winner = await self.teams.get_by_id(first.batting_team_id)
            margin = first.total_runs - second.total_runs
            match.winner_team_id = first.batting_team_id
            match.result_summary = f"{winner.name} won by {margin} run(s)"
        else:
            match.winner_team_id = None
            match.result_summary = "Match tied"

        match.status = MatchStatus.COMPLETED.value
        await self._upsert_player_stats(match, all_innings)
        await self.db.commit()
        await self.db.refresh(match)
        return match

    async def _upsert_player_stats(self, match: Match, all_innings: List[Innings]) -> None:
        batting: Dict[uuid.UUID, dict] = {}
        bowling: Dict[uuid.UUID, dict] = {}
        fielding: Dict[uuid.UUID, dict] = {}
        dismissed_players: set = set()

        for innings in all_innings:
            deliveries = await self.deliveries.list_for_innings(innings.id)
            for d in deliveries:
                bat = batting.setdefault(
                    d.striker_id, {"runs": 0, "balls": 0, "fours": 0, "sixes": 0}
                )
                if d.is_legal_ball:
                    bat["balls"] += 1
                bat["runs"] += d.runs_off_bat
                if d.runs_off_bat == 4:
                    bat["fours"] += 1
                elif d.runs_off_bat == 6:
                    bat["sixes"] += 1

                bowl = bowling.setdefault(
                    d.bowler_id, {"balls": 0, "runs": 0, "wickets": 0}
                )
                if d.is_legal_ball:
                    bowl["balls"] += 1
                bowler_runs = d.runs_off_bat + (
                    d.extra_runs if d.extra_type in (ExtraType.WIDE.value, ExtraType.NO_BALL.value) else 0
                )
                bowl["runs"] += bowler_runs
                if d.is_wicket and d.wicket_type != WicketType.RUN_OUT.value:
                    bowl["wickets"] += 1

                if d.is_wicket and d.out_player_id:
                    dismissed_players.add(d.out_player_id)

                if d.is_wicket and d.fielder_id:
                    field = fielding.setdefault(
                        d.fielder_id, {"catches": 0, "stumpings": 0, "run_outs": 0}
                    )
                    if d.wicket_type == WicketType.CAUGHT.value:
                        field["catches"] += 1
                    elif d.wicket_type == WicketType.STUMPED.value:
                        field["stumpings"] += 1
                    elif d.wicket_type == WicketType.RUN_OUT.value:
                        field["run_outs"] += 1

        player_ids = set(batting) | set(bowling) | set(fielding)
        for player_id in player_ids:
            bat = batting.get(player_id, {"runs": 0, "balls": 0, "fours": 0, "sixes": 0})
            bowl = bowling.get(player_id, {"balls": 0, "runs": 0, "wickets": 0})
            field = fielding.get(player_id, {"catches": 0, "stumpings": 0, "run_outs": 0})

            existing = await self.player_stats.get_for_player_match(player_id, match.id)
            stats = existing or PlayerMatchStats(player_id=player_id, match_id=match.id)
            stats.runs_scored = bat["runs"]
            stats.balls_faced = bat["balls"]
            stats.fours = bat["fours"]
            stats.sixes = bat["sixes"]
            stats.balls_bowled = bowl["balls"]
            stats.runs_conceded = bowl["runs"]
            stats.wickets_taken = bowl["wickets"]
            stats.catches = field["catches"]
            stats.stumpings = field["stumpings"]
            stats.run_outs = field["run_outs"]
            stats.was_out = player_id in dismissed_players
            await self.player_stats.upsert(stats)

    # ------------------------------------------------------------- reading

    async def get_live_state(self, match_id: uuid.UUID) -> LiveStateOut:
        match = await self.matches.get_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")

        innings = await self.innings_repo.get_current(match_id)
        if not innings:
            all_innings = await self.innings_repo.list_for_match(match_id)
            innings = all_innings[-1] if all_innings else None

        if not innings:
            return LiveStateOut(match_id=match_id, match_status=match.status)

        deliveries = await self.deliveries.list_for_innings(innings.id)
        batting, bowling, _ = self._aggregate(deliveries)

        striker = await self._player_out(innings.current_striker_id)
        non_striker = await self._player_out(innings.current_non_striker_id)
        bowler = await self._player_out(innings.current_bowler_id)

        striker_stats = batting.get(innings.current_striker_id, {"runs": 0, "balls": 0})
        non_striker_stats = batting.get(innings.current_non_striker_id, {"runs": 0, "balls": 0})
        bowler_stats = bowling.get(innings.current_bowler_id, {"balls": 0, "runs": 0, "wickets": 0})

        overs_bowled = innings.legal_balls_bowled / 6
        run_rate = round(innings.total_runs / overs_bowled, 2) if overs_bowled > 0 else 0.0

        required_run_rate = None
        runs_needed = None
        balls_remaining = None
        if innings.innings_number == 2 and innings.target is not None:
            runs_needed = max(innings.target - innings.total_runs, 0)
            balls_remaining = max(match.overs_limit * 6 - innings.legal_balls_bowled, 0)
            required_run_rate = (
                round(runs_needed / (balls_remaining / 6), 2) if balls_remaining > 0 else 0.0
            )

        current_over_deliveries = [
            d for d in deliveries if d.over_number == innings.legal_balls_bowled // 6
        ]
        current_over_balls = [self._ball_label(d) for d in current_over_deliveries]

        recent = deliveries[-10:][::-1]
        recent_out = [DeliveryOut.model_validate(d) for d in recent]

        return LiveStateOut(
            match_id=match_id,
            match_status=match.status,
            innings=InningsOut.model_validate(innings),
            striker=striker,
            striker_runs=striker_stats["runs"],
            striker_balls=striker_stats["balls"],
            non_striker=non_striker,
            non_striker_runs=non_striker_stats["runs"],
            non_striker_balls=non_striker_stats["balls"],
            bowler=bowler,
            bowler_wickets=bowler_stats["wickets"],
            bowler_runs_conceded=bowler_stats["runs"],
            bowler_overs=f"{bowler_stats['balls'] // 6}.{bowler_stats['balls'] % 6}",
            current_over_balls=current_over_balls,
            run_rate=run_rate,
            required_run_rate=required_run_rate,
            runs_needed=runs_needed,
            balls_remaining=balls_remaining,
            recent_deliveries=recent_out,
        )

    async def get_scorecard(self, match_id: uuid.UUID) -> MatchScorecardOut:
        match = await self.matches.get_by_id(match_id)
        if not match:
            raise NotFoundError("Match not found")

        all_innings = await self.innings_repo.list_for_match(match_id)
        innings_cards: List[InningsScorecard] = []

        for innings in all_innings:
            deliveries = await self.deliveries.list_for_innings(innings.id)
            batting, bowling, fow = self._aggregate(deliveries)

            batting_order = list(dict.fromkeys(
                [d.striker_id for d in deliveries] + [d.non_striker_id for d in deliveries]
            ))
            batting_entries = []
            for player_id in batting_order:
                stats = batting[player_id]
                player = await self._player_out(player_id)
                balls = stats["balls"]
                batting_entries.append(
                    BattingCardEntry(
                        player=player,
                        runs=stats["runs"],
                        balls_faced=balls,
                        fours=stats["fours"],
                        sixes=stats["sixes"],
                        strike_rate=round((stats["runs"] / balls) * 100, 2) if balls > 0 else 0.0,
                        is_out=stats["is_out"],
                        dismissal=stats["dismissal"],
                    )
                )

            bowling_order = list(dict.fromkeys(d.bowler_id for d in deliveries))
            bowling_entries = []
            for player_id in bowling_order:
                stats = bowling[player_id]
                player = await self._player_out(player_id)
                balls = stats["balls"]
                bowling_entries.append(
                    BowlingCardEntry(
                        player=player,
                        overs=f"{balls // 6}.{balls % 6}",
                        balls_bowled=balls,
                        runs_conceded=stats["runs"],
                        wickets=stats["wickets"],
                        economy=round(stats["runs"] / (balls / 6), 2) if balls > 0 else 0.0,
                    )
                )

            fow_entries = []
            for entry in fow:
                player = await self._player_out(entry["player_id"])
                fow_entries.append(
                    FallOfWicketEntry(
                        wicket_number=entry["wicket_number"],
                        score_at_fall=entry["score"],
                        over_at_fall=entry["over"],
                        player=player,
                    )
                )

            innings_cards.append(
                InningsScorecard(
                    innings=InningsOut.model_validate(innings),
                    batting=batting_entries,
                    bowling=bowling_entries,
                    fall_of_wickets=fow_entries,
                )
            )

        return MatchScorecardOut(
            match_id=match_id,
            status=match.status,
            result_summary=match.result_summary,
            innings=innings_cards,
        )

    # --------------------------------------------------------------- helpers

    async def _player_out(self, player_id: Optional[uuid.UUID]) -> Optional[PlayerOut]:
        if not player_id:
            return None
        player = await self.players.get_by_id(player_id)
        return PlayerOut.model_validate(player) if player else None

    def _ball_label(self, d: Delivery) -> str:
        if d.is_wicket:
            return "W"
        if d.extra_type == ExtraType.WIDE.value:
            return f"Wd{'+' + str(d.extra_runs - 1) if d.extra_runs > 1 else ''}"
        if d.extra_type == ExtraType.NO_BALL.value:
            return f"Nb{'+' + str(d.runs_off_bat) if d.runs_off_bat else ''}"
        if d.extra_type in (ExtraType.BYE.value, ExtraType.LEG_BYE.value):
            return f"{d.extra_runs}b"
        return str(d.runs_off_bat)

    def _aggregate(self, deliveries: List[Delivery]):
        batting: Dict[uuid.UUID, dict] = {}
        bowling: Dict[uuid.UUID, dict] = {}
        fow: List[dict] = []
        running_score = 0
        wicket_count = 0

        for d in deliveries:
            # Both ends get a batting-card entry, even 0-ball ones - a
            # non-striker who's on the field the whole innings but never
            # faces a ball (e.g. the chase ends on the striker's shot) still
            # shows up as "not out" on a real scorecard.
            batting.setdefault(
                d.non_striker_id,
                {"runs": 0, "balls": 0, "fours": 0, "sixes": 0, "is_out": False, "dismissal": None},
            )
            bat = batting.setdefault(
                d.striker_id,
                {"runs": 0, "balls": 0, "fours": 0, "sixes": 0, "is_out": False, "dismissal": None},
            )
            if d.is_legal_ball:
                bat["balls"] += 1
            bat["runs"] += d.runs_off_bat
            if d.runs_off_bat == 4:
                bat["fours"] += 1
            elif d.runs_off_bat == 6:
                bat["sixes"] += 1

            bowl = bowling.setdefault(d.bowler_id, {"balls": 0, "runs": 0, "wickets": 0})
            if d.is_legal_ball:
                bowl["balls"] += 1
            bowler_runs = d.runs_off_bat + (
                d.extra_runs if d.extra_type in (ExtraType.WIDE.value, ExtraType.NO_BALL.value) else 0
            )
            bowl["runs"] += bowler_runs
            if d.is_wicket and d.wicket_type != WicketType.RUN_OUT.value:
                bowl["wickets"] += 1

            running_score += d.runs_off_bat + d.extra_runs
            if d.is_wicket and d.out_player_id:
                wicket_count += 1
                out_entry = batting.setdefault(
                    d.out_player_id,
                    {"runs": 0, "balls": 0, "fours": 0, "sixes": 0, "is_out": False, "dismissal": None},
                )
                out_entry["is_out"] = True
                out_entry["dismissal"] = (d.wicket_type or "OUT").replace("_", " ").title()
                fow.append(
                    {
                        "wicket_number": wicket_count,
                        "score": running_score,
                        "over": f"{d.over_number}.{d.ball_in_over}",
                        "player_id": d.out_player_id,
                    }
                )

        return batting, bowling, fow
