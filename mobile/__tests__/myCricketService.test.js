import { api } from "../src/services/api";
import { fetchCurrentUser } from "../src/services/authService";
import { getMyCricket } from "../src/services/myCricketService";

jest.mock("../src/services/api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("../src/services/authService", () => ({
  fetchCurrentUser: jest.fn(),
}));

function page(items) {
  return { data: { data: { items } } };
}

describe("myCricketService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches the aggregated overview from /mycricket", async () => {
    api.get.mockResolvedValue({ data: { data: { user_id: "u1", teams: [] } } });

    const result = await getMyCricket();

    expect(api.get).toHaveBeenCalledWith("/mycricket", { params: { limit: 20 } });
    expect(result).toEqual({ user_id: "u1", teams: [] });
  });

  it("passes a custom limit through", async () => {
    api.get.mockResolvedValue({ data: { data: {} } });

    await getMyCricket({ limit: 5 });

    expect(api.get).toHaveBeenCalledWith("/mycricket", { params: { limit: 5 } });
  });

  it("falls back to existing endpoints when /mycricket is missing", async () => {
    fetchCurrentUser.mockResolvedValue({ id: "u1" });
    api.get.mockImplementation((url) => {
      switch (url) {
        case "/mycricket":
          return Promise.reject({ response: { status: 404 } });
        case "/matches":
          return Promise.resolve(
            page([
              { id: "m1", status: "LIVE" },
              { id: "m2", status: "COMPLETED" },
            ])
          );
        case "/teams":
          return Promise.resolve(page([{ id: "t1", name: "Falcons XI" }]));
        case "/tournaments":
          return Promise.resolve(page([{ id: "tr1" }]));
        case "/players/me":
          return Promise.resolve({ data: { data: { id: "p1" } } });
        case "/players/p1/stats":
          return Promise.resolve({ data: { data: { player_id: "p1" } } });
        default:
          return Promise.reject(new Error(`unexpected ${url}`));
      }
    });

    const result = await getMyCricket();

    expect(result.teams).toEqual([{ id: "t1", name: "Falcons XI" }]);
    expect(result.matches.your).toHaveLength(2);
    expect(result.matches.live).toHaveLength(1);
    expect(result.matches.played).toHaveLength(1);
    expect(result.tournaments.organized).toHaveLength(1);
    expect(result.player).toEqual({ id: "p1" });
    expect(result.counts.teams).toBe(1);
  });

  it("does not fall back on non-404 errors", async () => {
    api.get.mockRejectedValue({ response: { status: 500 } });

    await expect(getMyCricket()).rejects.toEqual({ response: { status: 500 } });
  });
});
