from httpx import AsyncClient


async def _register(client: AsyncClient, username: str, email: str) -> dict:
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": email,
            "username": username,
            "password": "Password123",
            "full_name": username.replace("_", " ").title(),
        },
    )
    assert response.status_code == 201, response.text
    return response.json()["data"]


def _auth_header(data: dict) -> dict:
    return {"Authorization": f"Bearer {data['access_token']}"}


async def _make_team_with_players(client: AsyncClient, scorer: dict, team_name: str, player_names: list[str]) -> dict:
    team_resp = await client.post(
        "/api/v1/teams", json={"name": team_name}, headers=_auth_header(scorer)
    )
    assert team_resp.status_code == 200, team_resp.text
    team = team_resp.json()["data"]

    players = []
    for name in player_names:
        add_resp = await client.post(
            f"/api/v1/teams/{team['id']}/roster",
            json={"new_player_full_name": name, "new_player_role": "ALL_ROUNDER"},
            headers=_auth_header(scorer),
        )
        assert add_resp.status_code == 200, add_resp.text
        players.append(add_resp.json()["data"]["player"])

    return {"team": team, "players": players}


async def _setup_ready_match(client: AsyncClient, overs_limit: int = 2) -> dict:
    """Two 5-player teams, a match created, toss won by team A (bats first),
    match started with A's first two batsmen and B's first bowler."""
    scorer = await _register(client, "scorer1", "scorer1@example.com")

    team_a = await _make_team_with_players(
        client, scorer, "Team A", ["A1", "A2", "A3", "A4", "A5"]
    )
    team_b = await _make_team_with_players(
        client, scorer, "Team B", ["B1", "B2", "B3", "B4", "B5"]
    )

    match_resp = await client.post(
        "/api/v1/matches",
        json={
            "team_a_id": team_a["team"]["id"],
            "team_b_id": team_b["team"]["id"],
            "match_type": "T20",
            "overs_limit": overs_limit,
        },
        headers=_auth_header(scorer),
    )
    assert match_resp.status_code == 200, match_resp.text
    match = match_resp.json()["data"]

    toss_resp = await client.post(
        f"/api/v1/matches/{match['id']}/toss",
        json={"toss_winner_team_id": team_a["team"]["id"], "toss_decision": "BAT"},
        headers=_auth_header(scorer),
    )
    assert toss_resp.status_code == 200, toss_resp.text

    a_players = team_a["players"]
    b_players = team_b["players"]

    start_resp = await client.post(
        f"/api/v1/matches/{match['id']}/start",
        json={
            "striker_id": a_players[0]["id"],
            "non_striker_id": a_players[1]["id"],
            "bowler_id": b_players[0]["id"],
        },
        headers=_auth_header(scorer),
    )
    assert start_resp.status_code == 200, start_resp.text

    return {
        "scorer": scorer,
        "match": match,
        "team_a": team_a,
        "team_b": team_b,
    }


async def _deliver(client: AsyncClient, scorer: dict, match_id: str, **payload) -> dict:
    response = await client.post(
        f"/api/v1/scoring/{match_id}/deliveries", json=payload, headers=_auth_header(scorer)
    )
    return response


async def _live(client: AsyncClient, match_id: str) -> dict:
    response = await client.get(f"/api/v1/scoring/{match_id}/live")
    assert response.status_code == 200, response.text
    return response.json()["data"]


async def test_dot_ball(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]

    resp = await _deliver(client, scorer, match["id"], runs_off_bat=0)
    assert resp.status_code == 200, resp.text

    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 0
    assert state["innings"]["legal_balls_bowled"] == 1
    assert state["striker"]["id"] == setup["team_a"]["players"][0]["id"]


async def test_single_rotates_strike(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]
    striker1 = setup["team_a"]["players"][1]["id"]

    resp = await _deliver(client, scorer, match["id"], runs_off_bat=1)
    assert resp.status_code == 200

    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 1
    assert state["striker"]["id"] == striker1
    assert state["non_striker"]["id"] == striker0


async def test_four_and_six_do_not_rotate_strike(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]

    await _deliver(client, scorer, match["id"], runs_off_bat=4)
    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 4
    assert state["striker"]["id"] == striker0

    resp = await _deliver(client, scorer, match["id"], runs_off_bat=6)
    assert resp.status_code == 200
    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 10
    assert state["striker"]["id"] == striker0


async def test_wide_adds_run_no_legal_ball_no_rotation(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]

    resp = await _deliver(client, scorer, match["id"], extra_type="WIDE")
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["is_legal_ball"] is False
    assert body["extra_runs"] == 1

    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 1
    assert state["innings"]["legal_balls_bowled"] == 0
    assert state["striker"]["id"] == striker0


async def test_no_ball_with_bat_runs(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]
    striker1 = setup["team_a"]["players"][1]["id"]

    resp = await _deliver(client, scorer, match["id"], runs_off_bat=1, extra_type="NO_BALL")
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["is_legal_ball"] is False
    assert body["extra_runs"] == 1
    assert body["runs_off_bat"] == 1

    state = await _live(client, match["id"])
    # 1 run off the bat + 1 no-ball penalty = 2
    assert state["innings"]["total_runs"] == 2
    assert state["innings"]["legal_balls_bowled"] == 0
    # odd runs_off_bat (1) still rotates strike
    assert state["striker"]["id"] == striker1


async def test_bye(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]

    resp = await _deliver(client, scorer, match["id"], extra_type="BYE", extra_runs=2)
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["is_legal_ball"] is True
    assert body["runs_off_bat"] == 0

    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 2
    assert state["innings"]["legal_balls_bowled"] == 1


async def test_leg_bye(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]

    resp = await _deliver(client, scorer, match["id"], extra_type="LEG_BYE", extra_runs=1)
    assert resp.status_code == 200

    state = await _live(client, match["id"])
    assert state["innings"]["total_runs"] == 1
    assert state["innings"]["legal_balls_bowled"] == 1


async def test_wicket_bowled_requires_next_batsman(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]

    resp = await _deliver(
        client, scorer, match["id"], is_wicket=True, wicket_type="BOWLED"
    )
    assert resp.status_code == 400


async def test_wicket_bowled_with_replacement(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]
    striker1 = setup["team_a"]["players"][1]["id"]
    next_batsman = setup["team_a"]["players"][2]["id"]

    resp = await _deliver(
        client,
        scorer,
        match["id"],
        is_wicket=True,
        wicket_type="BOWLED",
        next_batsman_id=next_batsman,
    )
    assert resp.status_code == 200
    body = resp.json()["data"]
    assert body["out_player_id"] == striker0
    assert body["runs_off_bat"] == 0

    state = await _live(client, match["id"])
    assert state["innings"]["total_wickets"] == 1
    assert state["striker"]["id"] == next_batsman
    assert state["non_striker"]["id"] == striker1


async def test_run_out_non_striker(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]
    non_striker1 = setup["team_a"]["players"][1]["id"]
    fielder = setup["team_b"]["players"][1]["id"]
    next_batsman = setup["team_a"]["players"][2]["id"]

    resp = await _deliver(
        client,
        scorer,
        match["id"],
        runs_off_bat=1,
        is_wicket=True,
        wicket_type="RUN_OUT",
        out_player_id=non_striker1,
        fielder_id=fielder,
        next_batsman_id=next_batsman,
    )
    assert resp.status_code == 200

    state = await _live(client, match["id"])
    assert state["innings"]["total_wickets"] == 1
    # the single rotated strike (striker0 -> non_striker1's end), then the
    # run-out replaced whoever ended up at that end with the new batsman
    assert next_batsman in (state["striker"]["id"], state["non_striker"]["id"])
    assert striker0 in (state["striker"]["id"], state["non_striker"]["id"])


async def test_over_completion_rotates_strike_and_clears_bowler(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    striker0 = setup["team_a"]["players"][0]["id"]
    striker1 = setup["team_a"]["players"][1]["id"]

    for _ in range(6):
        resp = await _deliver(client, scorer, match["id"], runs_off_bat=0)
        assert resp.status_code == 200

    state = await _live(client, match["id"])
    assert state["innings"]["legal_balls_bowled"] == 6
    assert state["innings"]["current_bowler_id"] is None
    # over-completion rotation swaps ends even with all dot balls
    assert state["striker"]["id"] == striker1
    assert state["non_striker"]["id"] == striker0

    blocked = await _deliver(client, scorer, match["id"], runs_off_bat=0)
    assert blocked.status_code == 400


async def test_bowler_cannot_bowl_consecutive_overs(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    first_bowler = setup["team_b"]["players"][0]["id"]

    for _ in range(6):
        await _deliver(client, scorer, match["id"], runs_off_bat=0)

    resp = await client.post(
        f"/api/v1/scoring/{match['id']}/next-over",
        json={"bowler_id": first_bowler},
        headers=_auth_header(scorer),
    )
    assert resp.status_code == 400


async def test_next_bowler_selection_allows_scoring_to_continue(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]
    second_bowler = setup["team_b"]["players"][1]["id"]

    for _ in range(6):
        await _deliver(client, scorer, match["id"], runs_off_bat=0)

    select_resp = await client.post(
        f"/api/v1/scoring/{match['id']}/next-over",
        json={"bowler_id": second_bowler},
        headers=_auth_header(scorer),
    )
    assert select_resp.status_code == 200

    resp = await _deliver(client, scorer, match["id"], runs_off_bat=1)
    assert resp.status_code == 200

    state = await _live(client, match["id"])
    assert state["innings"]["legal_balls_bowled"] == 7


async def test_undo_last_delivery(client: AsyncClient):
    setup = await _setup_ready_match(client)
    scorer, match = setup["scorer"], setup["match"]

    await _deliver(client, scorer, match["id"], runs_off_bat=4)
    before_undo = await _live(client, match["id"])
    assert before_undo["innings"]["total_runs"] == 4

    undo_resp = await client.delete(
        f"/api/v1/scoring/{match['id']}/deliveries/last", headers=_auth_header(scorer)
    )
    assert undo_resp.status_code == 200

    after_undo = await _live(client, match["id"])
    assert after_undo["innings"]["total_runs"] == 0
    assert after_undo["innings"]["legal_balls_bowled"] == 0


async def test_innings_completes_when_overs_used_up(client: AsyncClient):
    setup = await _setup_ready_match(client, overs_limit=1)
    scorer, match = setup["scorer"], setup["match"]

    for _ in range(6):
        await _deliver(client, scorer, match["id"], runs_off_bat=1)

    state = await _live(client, match["id"])
    assert state["innings"]["status"] == "COMPLETED"
    assert state["innings"]["legal_balls_bowled"] == 6


async def test_second_innings_target_and_match_end(client: AsyncClient):
    setup = await _setup_ready_match(client, overs_limit=1)
    scorer, match = setup["scorer"], setup["match"]

    # Innings 1: 6 singles = 6 runs
    for _ in range(6):
        await _deliver(client, scorer, match["id"], runs_off_bat=1)

    innings1_state = await _live(client, match["id"])
    assert innings1_state["innings"]["status"] == "COMPLETED"
    assert innings1_state["innings"]["total_runs"] == 6

    b_players = setup["team_b"]["players"]
    a_players = setup["team_a"]["players"]
    next_innings_resp = await client.post(
        f"/api/v1/scoring/{match['id']}/next-innings",
        json={
            "striker_id": b_players[0]["id"],
            "non_striker_id": b_players[1]["id"],
            "bowler_id": a_players[0]["id"],
        },
        headers=_auth_header(scorer),
    )
    assert next_innings_resp.status_code == 200
    innings2 = next_innings_resp.json()["data"]
    assert innings2["target"] == 7

    # Chase it down in 2 balls: a six then a single reaches target (7) early,
    # which should mark innings 2 complete before all overs are used.
    await _deliver(client, scorer, match["id"], runs_off_bat=6)
    resp = await _deliver(client, scorer, match["id"], runs_off_bat=1)
    assert resp.status_code == 200

    state = await _live(client, match["id"])
    assert state["innings"]["status"] == "COMPLETED"
    assert state["innings"]["total_runs"] == 7

    end_resp = await client.post(
        f"/api/v1/scoring/{match['id']}/end", headers=_auth_header(scorer)
    )
    assert end_resp.status_code == 200
    match_body = end_resp.json()["data"]
    assert match_body["status"] == "COMPLETED"
    assert match_body["winner_team_id"] == setup["team_b"]["team"]["id"]
    assert "won by" in match_body["result_summary"]

    scorecard_resp = await client.get(f"/api/v1/scoring/{match['id']}/scorecard")
    assert scorecard_resp.status_code == 200
    scorecard = scorecard_resp.json()["data"]
    assert len(scorecard["innings"]) == 2

    stats_resp = await client.get(f"/api/v1/players/{b_players[0]['id']}/stats")
    assert stats_resp.status_code == 200
    stats = stats_resp.json()["data"]
    assert stats["matches_played"] == 1
    assert stats["runs_scored"] == 7


async def test_non_scorer_cannot_record_delivery(client: AsyncClient):
    setup = await _setup_ready_match(client)
    match = setup["match"]
    stranger = await _register(client, "stranger_scorer", "stranger_scorer@example.com")

    resp = await _deliver(client, stranger, match["id"], runs_off_bat=1)
    assert resp.status_code == 403
