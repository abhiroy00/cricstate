import { createContext, useCallback, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

function keyOf(productId, size) {
  return `${productId}__${size}`;
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);
  const [wishes, setWishes] = useState({});

  const add = useCallback((product, size, qty = 1) => {
    const key = keyOf(product.id, size);
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) {
        return prev.map((l) =>
          l.key === key ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { key, product, size, qty }];
    });
  }, []);

  const remove = useCallback((key) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  }, []);

  const setQty = useCallback((key, qty) => {
    setLines((prev) =>
      qty <= 0
        ? prev.filter((l) => l.key !== key)
        : prev.map((l) => (l.key === key ? { ...l, qty } : l))
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const toggleWish = useCallback((productId) => {
    setWishes((prev) => ({ ...prev, [productId]: !prev[productId] }));
  }, []);

  const { count, subtotal, savings } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    let savings = 0;
    for (const l of lines) {
      count += l.qty;
      subtotal += l.product.price * l.qty;
      savings += (l.product.mrp - l.product.price) * l.qty;
    }
    return { count, subtotal, savings };
  }, [lines]);

  const value = useMemo(
    () => ({
      lines,
      wishes,
      count,
      subtotal,
      savings,
      add,
      remove,
      setQty,
      clear,
      toggleWish,
      isWished: (id) => !!wishes[id],
    }),
    [lines, wishes, count, subtotal, savings, add, remove, setQty, clear, toggleWish]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
