import { api } from "./api";
import { fetchCurrentUser } from "./authService";

function isEmptyCounts() {
  return {
    matches: 0,
    played_matches: 0,
    live_matches: 0,
    tournaments: 0,
    teams: 0,
  };
}

// The deployed backend may predate the aggregated /mycricket route. When it
// 404s we rebuild the same overview shape from the per-section endpoints that
// have existed since Phase 3, so the screen still renders.
async function composeOverviewFromExistingEndpoints() {
  const user = await fetchCurrentUser();

  const [matchesRes, teamsRes, tournamentsRes] = await Promise.all([
    api.get("/matches", { params: { limit: 50 } }),
    api.get("/teams", { params: { created_by: user.id, limit: 100 } }),
    api.get("/tournaments", { params: { organizer_id: user.id, limit: 100 } }),
  ]);

  const matches = matchesRes.data.data.items || [];
  const teams = teamsRes.data.data.items || [];
  const tournaments = tournamentsRes.data.data.items || [];

  let player = null;
  let stats = null;
  try {
    player = (await api.get("/players/me")).data.data;
    stats = (await api.get(`/players/${player.id}/stats`)).data.data;
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
  }

  const played = matches.filter((m) => m.status === "COMPLETED");
  const live = matches.filter((m) => m.status === "LIVE");

  return {
    user_id: user.id,
    counts: {
      ...isEmptyCounts(),
      matches: matches.length,
      played_matches: played.length,
      live_matches: live.length,
      tournaments: tournaments.length,
      teams: teams.length,
    },
    matches: { your: matches, played, live },
    tournaments: { organized: tournaments, participating: [] },
    teams,
    player,
    stats,
    highlights: { count: 0, items: [] },
  };
}

export async function getMyCricket({ limit = 20 } = {}) {
  try {
    const response = await api.get("/mycricket", { params: { limit } });
    return response.data.data;
  } catch (error) {
    if (error?.response?.status !== 404) throw error;
    return composeOverviewFromExistingEndpoints();
  }
}
