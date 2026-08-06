import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();
  const count = items.reduce((n, i) => n + i.quantity, 0);

  return (
    <header className="sticky top-0 z-30 bg-paper/95 backdrop-blur border-b border-line">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold tracking-tight text-ink">
          Tiffin<span className="text-chili">Run</span>
        </Link>

        <nav className="flex items-center gap-5 text-sm font-medium">
          <Link to="/" className="hover:text-chili transition-colors">Restaurants</Link>
          {user?.role === "customer" && (
            <Link to="/orders" className="hover:text-chili transition-colors">My orders</Link>
          )}
          {user?.role === "restaurant" && (
            <Link to="/dashboard" className="hover:text-chili transition-colors">Dashboard</Link>
          )}
          {user?.role === "customer" && (
            <Link
              to="/cart"
              className="relative px-3 py-1.5 rounded-full bg-ink text-paper font-mono text-xs"
            >
              Cart · {count}
            </Link>
          )}
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate("/");
              }}
              className="text-ink/60 hover:text-chili transition-colors"
            >
              Sign out
            </button>
          ) : (
            <Link to="/login" className="px-3 py-1.5 rounded-full bg-chili text-paper">
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
