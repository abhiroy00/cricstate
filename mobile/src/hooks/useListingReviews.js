import { useCallback, useEffect, useState } from "react";

import {
  createReview,
  getListing,
  listReviews,
} from "../services/engagementService";

// Loads real reviews + rating aggregate for a community directory listing.
// backendId is null for bundled seeds / locally registered entries — the
// hook then stays idle and screens keep their local-only behaviour.
export function useListingReviews(backendId) {
  const [apiReviews, setApiReviews] = useState([]);
  const [agg, setAgg] = useState(null);

  const refresh = useCallback(async () => {
    if (!backendId) return;
    try {
      const [page, detail] = await Promise.all([
        listReviews(backendId, { limit: 20 }),
        getListing(backendId),
      ]);
      setApiReviews(page.items || []);
      setAgg({
        avg: detail.avg_rating,
        count: detail.review_count || 0,
      });
    } catch {
      // Offline — screens fall back to seeds + local reviews.
    }
  }, [backendId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const submit = useCallback(
    async (rating, text) => {
      await createReview(backendId, { rating, text });
      await refresh();
    },
    [backendId, refresh]
  );

  return { apiReviews, agg, refresh, submit };
}
