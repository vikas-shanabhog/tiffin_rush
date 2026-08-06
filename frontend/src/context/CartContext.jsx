import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

// Each signed-in user (or "guest" when logged out) gets its own cart, saved
// under its own localStorage key, so switching accounts on the same browser
// never shows one user's cart to another.
const cartKey = (userId) => `cart:${userId || "guest"}`;

const loadCart = (userId) => {
  try {
    const raw = localStorage.getItem(cartKey(userId));
    return raw ? JSON.parse(raw) : { restaurantId: null, items: [] };
  } catch {
    return { restaurantId: null, items: [] };
  }
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?._id || null;

  // Lazy-init straight from localStorage so the very first render already
  // has the right cart — loading it inside a useEffect instead caused a
  // race where the "persist" effect below fired first, before that load's
  // setState took effect, and immediately overwrote the saved cart with
  // empty initial state, wiping it on every refresh.
  const [restaurantId, setRestaurantId] = useState(() => loadCart(userId).restaurantId);
  const [items, setItems] = useState(() => loadCart(userId).items); // { menuItem, name, price, quantity }

  // Tracks which user's cart is currently loaded into state. Kept as state
  // (not a ref) so it updates in the same batch as restaurantId/items —
  // that's what lets the persist effect below reliably tell "is this render
  // still mid-switch" apart from "switch finished, safe to save".
  const [cartOwner, setCartOwner] = useState(userId);

  // Reload when the logged-in user actually changes (login, logout, switch
  // account) — the initial load is already handled by useState above.
  useEffect(() => {
    if (cartOwner === userId) return;
    const saved = loadCart(userId);
    setRestaurantId(saved.restaurantId);
    setItems(saved.items);
    setCartOwner(userId);
  }, [userId, cartOwner]);

  // Persist this user's cart on every change — but not while a user switch
  // is still in flight (cartOwner hasn't caught up to userId yet), or we'd
  // save the outgoing user's cart under the incoming user's key.
  useEffect(() => {
    if (cartOwner !== userId) return;
    localStorage.setItem(cartKey(userId), JSON.stringify({ restaurantId, items }));
  }, [userId, cartOwner, restaurantId, items]);

  const addItem = (restaurant, item) => {
    if (restaurantId && restaurantId !== restaurant._id) {
      const confirmSwitch = window.confirm(
        "Your cart has items from another restaurant. Start a new cart?"
      );
      if (!confirmSwitch) return;
      setItems([]);
    }
    setRestaurantId(restaurant._id);
    setItems((prev) => {
      const existing = prev.find((i) => i.menuItem === item._id);
      if (existing) {
        return prev.map((i) =>
          i.menuItem === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { menuItem: item._id, name: item.name, price: item.price, quantity: 1 }];
    });
  };

  const updateQuantity = (menuItemId, quantity) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.menuItem !== menuItemId));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.menuItem === menuItemId ? { ...i, quantity } : i))
    );
  };

  const clearCart = () => {
    setItems([]);
    setRestaurantId(null);
  };

  const itemsTotal = useMemo(
    () => items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [items]
  );

  return (
    <CartContext.Provider
      value={{ restaurantId, items, addItem, updateQuantity, clearCart, itemsTotal }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);