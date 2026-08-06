import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

export default function Cart() {
  const { items, updateQuantity, itemsTotal } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-5 py-16 text-center">
        <p className="text-ink/50">Your cart is empty.</p>
        <Link to="/" className="inline-block mt-4 text-chili underline">Browse restaurants</Link>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="text-2xl font-bold mb-6">Your cart</h1>
      <div className="border border-line rounded-xl bg-white divide-y divide-line">
        {items.map((i) => (
          <div key={i.menuItem} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{i.name}</p>
              <p className="font-mono text-xs text-ink/50">₹{i.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateQuantity(i.menuItem, i.quantity - 1)}
                className="w-7 h-7 rounded-full border border-ink/20"
              >
                −
              </button>
              <span className="font-mono w-4 text-center">{i.quantity}</span>
              <button
                onClick={() => updateQuantity(i.menuItem, i.quantity + 1)}
                className="w-7 h-7 rounded-full border border-ink/20"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex justify-between font-mono text-lg">
        <span>Subtotal</span>
        <span>₹{itemsTotal}</span>
      </div>

      <button
        onClick={() => navigate("/checkout")}
        className="mt-6 w-full py-3 rounded-full bg-chili text-paper font-medium hover:opacity-90 transition-opacity"
      >
        Proceed to checkout
      </button>
    </div>
  );
}
