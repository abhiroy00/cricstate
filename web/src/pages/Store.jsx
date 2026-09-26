import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../components/common/Button";
import EmptyState from "../components/common/EmptyState";
import ErrorState from "../components/common/ErrorState";
import Input from "../components/common/Input";
import Loader from "../components/common/Loader";
import { formatINR, useCart } from "../hooks/useCart";
import { extractErrorMessage } from "../services/api";
import { listProducts } from "../services/storeService";

export default function Store() {
  const { add } = useCart();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  async function load(params = {}) {
    setLoading(true);
    setError("");
    try {
      const page = await listProducts({ limit: 50, ...params });
      setProducts(page.items || []);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(event) {
    event.preventDefault();
    load({ search: search || undefined, category: category || undefined });
  }

  if (loading) return <Loader label="Loading store..." />;
  if (error && products.length === 0)
    return <ErrorState message={error} onRetry={() => load()} />;

  return (
    <div className="list-page">
      <div className="list-page-header">
        <h1>Store</h1>
        <Link to="/store/cart">
          <Button variant="secondary">Cart</Button>
        </Link>
      </div>

      <form className="inline-form" onSubmit={handleSearch}>
        <Input
          id="store-search"
          label="Search products"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="form-field">
          <label className="form-label" htmlFor="store-category">
            Category
          </label>
          <select
            id="store-category"
            className="form-input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All</option>
            <option value="APPAREL">Apparel</option>
            <option value="EQUIPMENT">Equipment</option>
            <option value="ACCESSORIES">Accessories</option>
            <option value="BESTSELLER">Bestsellers</option>
          </select>
        </div>
        <Button type="submit">Search</Button>
        <Link to="/store/orders">
          <Button variant="secondary" type="button">
            My orders
          </Button>
        </Link>
      </form>

      {error && <p className="form-error-banner">{error}</p>}

      {products.length === 0 ? (
        <EmptyState message="No products in the store yet." />
      ) : (
        <div className="entity-grid">
          {products.map((p) => (
            <div key={p.id} className="entity-card">
              <div className="entity-card-avatar">👕</div>
              <div>
                <Link
                  to={`/store/products/${p.id}`}
                  className="entity-card-title"
                >
                  {p.name}
                </Link>
                <div className="entity-card-subtitle">
                  {formatINR(p.price)}
                  {p.mrp && p.mrp > p.price ? ` · was ${formatINR(p.mrp)}` : ""}
                  {p.stock <= 0 ? " · out of stock" : ""}
                </div>
                <Button
                  variant="secondary"
                  disabled={p.stock <= 0}
                  onClick={() => add(p)}
                >
                  Add to cart
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
