import { useEffect, useState } from "react";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import { formatINR } from "../hooks/useCart";
import { extractErrorMessage } from "../services/api";
import { cancelOrder, confirmOrderPayment, listMyOrders, payOrder } from "../services/storeService";

export default function Orders() {
  const [orders, setOrders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

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

  // Test-mode checkout: initiate + confirm back-to-back. A real gateway
  // redirects to its hosted page between these two steps instead.
  async function handlePay(orderId) {
    setBusyId(orderId);
    setError("");
    try {
      const init = await payOrder(orderId);
      await confirmOrderPayment(orderId, init.payment.id);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleCancel(orderId) {
    setBusyId(orderId);
    setError("");
    try {
      await cancelOrder(orderId);
      await load();
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Loader label="Loading orders..." />;
  if (error && !orders) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>My orders</h1>
      </div>

      {error && <p className="form-error-banner">{error}</p>}

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
                {o.status === "PENDING" && (
                  <div className="inline-form">
                    <Button
                      onClick={() => handlePay(o.id)}
                      loading={busyId === o.id}
                    >
                      Pay now
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleCancel(o.id)}
                      loading={busyId === o.id}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
