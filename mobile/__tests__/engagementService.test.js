import { api } from "../src/services/api";
import { getCommunityOverview } from "../src/services/engagementService";

jest.mock("../src/services/api", () => ({
  api: { get: jest.fn() },
}));

describe("engagementService.getCommunityOverview", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("requests /community/overview with the selected city", async () => {
    api.get.mockResolvedValue({ data: { data: { city: "Delhi", counts: {} } } });

    const result = await getCommunityOverview({ city: "Delhi" });

    expect(api.get).toHaveBeenCalledWith("/community/overview", {
      params: { city: "Delhi", featured_limit: 6 },
    });
    expect(result).toEqual({ city: "Delhi", counts: {} });
  });
});
