import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import { formatINR, useCart } from "../hooks/useCart";
import { extractErrorMessage } from "../services/api";
import { createOrder } from "../services/storeService";

export default function Cart() {
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  async function handleCheckout() {
    if (placing || lines.length === 0) return;
    setPlacing(true);
    setError("");
    try {
      await createOrder(
        lines.map((l) => ({ product_id: l.product.id, quantity: l.qty }))
      );
      clear();
      navigate("/store/orders");
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setPlacing(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="list-page">
        <h1>Cart</h1>
        <EmptyState message="Your cart is empty." />
        <Link to="/store">
          <Button>Browse store</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Cart ({lines.length})</h1>
      </div>

      {error && <p className="form-error-banner">{error}</p>}

      <div className="entity-grid">
        {lines.map((l) => (
          <div key={l.key} className="entity-card">
            <div>
              <div className="entity-card-title">{l.product.name}</div>
              <div className="entity-card-subtitle">
                {formatINR(l.product.price)} each
              </div>
              <div className="inline-form">
                <div className="form-field">
                  <label className="form-label" htmlFor={`qty-${l.key}`}>
                    Qty
                  </label>
                  <input
                    id={`qty-${l.key}`}
                    className="form-input"
                    type="number"
                    min="0"
                    value={l.qty}
                    onChange={(e) => setQty(l.key, Number(e.target.value) || 0)}
                  />
                </div>
                <Button variant="secondary" onClick={() => remove(l.key)}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2>Total: {formatINR(subtotal)}</h2>
      <div className="inline-form">
        <Button onClick={handleCheckout} loading={placing}>
          Place order
        </Button>
        <Link to="/store">
          <Button variant="secondary">Continue shopping</Button>
        </Link>
      </div>
    </div>
  );
}
