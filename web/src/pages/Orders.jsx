import { useEffect, useState } from "react";

import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import { formatINR } from "../hooks/useCart";
import { extractErrorMessage } from "../services/api";
import { listMyOrders } from "../services/storeService";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const page = await listMyOrders({ limit: 20 });
      setOrders(page.items || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  if (loading) return <Loader label="Loading orders..." />;
  if (error && !orders) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>My orders</h1>
      </div>

      {orders.length === 0 ? (
        <EmptyState message="You have not placed any orders yet." />
      ) : (
        <div className="entity-grid">
          {orders.map((o) => (
            <div key={o.id} className="entity-card">
              <div>
                <div className="entity-card-title">
                  Order #{String(o.id).slice(0, 8)}
                </div>
                <div className="entity-card-subtitle">
                  {o.status} · {o.items?.length || 0} item(s) ·{" "}
                  {formatINR(o.total)}
                </div>
                <div className="entity-card-subtitle">
                  {o.created_at
                    ? new Date(o.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : ""}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
