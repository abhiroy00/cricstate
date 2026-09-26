import { createContext, useCallback, useMemo, useState } from "react";

export const CartContext = createContext(null);

function keyOf(productId) {
  return String(productId);
}

export function CartProvider({ children }) {
  const [lines, setLines] = useState([]);

  const add = useCallback((product, qty = 1) => {
    const key = keyOf(product.id);
    setLines((prev) => {
      const found = prev.find((l) => l.key === key);
      if (found) {
        return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + qty } : l));
      }
      return [...prev, { key, product, qty }];
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

  const { count, subtotal } = useMemo(() => {
    let count = 0;
    let subtotal = 0;
    for (const l of lines) {
      count += l.qty;
      subtotal += l.product.price * l.qty;
    }
    return { count, subtotal };
  }, [lines]);

  const value = useMemo(
    () => ({ lines, count, subtotal, add, remove, setQty, clear }),
    [lines, count, subtotal, add, remove, setQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
