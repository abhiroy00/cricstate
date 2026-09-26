import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Button from "../components/common/Button";
import ErrorState from "../components/common/ErrorState";
import Loader from "../components/common/Loader";
import { formatINR, useCart } from "../hooks/useCart";
import { extractErrorMessage } from "../services/api";
import { getProduct } from "../services/storeService";

export default function ProductDetail() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        setProduct(await getProduct(productId));
      } catch (err) {
        setError(extractErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [productId]);

  if (loading) return <Loader label="Loading product..." />;
  if (error || !product)
    return <ErrorState message={error || "Product not found"} onRetry={() => navigate("/store")} />;

  return (
    <div className="detail-page">
      <h1>{product.name}</h1>
      <p className="detail-subtitle">
        {product.category} · {formatINR(product.price)}
        {product.mrp && product.mrp > product.price
          ? ` · was ${formatINR(product.mrp)}`
          : ""}
      </p>
      {product.description && <p>{product.description}</p>}
      <p className="detail-subtitle">
        {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
      </p>

      <div className="inline-form">
        <div className="form-field">
          <label className="form-label" htmlFor="qty">
            Quantity
          </label>
          <input
            id="qty"
            className="form-input"
            type="number"
            min="1"
            max="99"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          />
        </div>
        <Button
          disabled={product.stock <= 0}
          onClick={() => {
            add(product, qty);
            navigate("/store/cart");
          }}
        >
          Add to cart
        </Button>
        <Button variant="secondary" onClick={() => navigate("/store")}>
          Back to store
        </Button>
      </div>
    </div>
  );
}
