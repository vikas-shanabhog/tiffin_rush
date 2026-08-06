import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

const STATUS_LABEL = {
  placed: "Placed",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api.get("/orders/mine").then(({ data }) => setOrders(data));
  }, []);

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="text-2xl font-bold mb-6">My orders</h1>
      {orders.length === 0 ? (
        <p className="text-ink/50">No orders yet.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link
              key={o._id}
              to={`/orders/${o._id}`}
              className="flex items-center justify-between p-4 border border-line rounded-xl bg-white hover:shadow-sm"
            >
              <div>
                <p className="font-medium">{o.restaurant?.name}</p>
                <p className="text-xs text-ink/40 font-mono">{new Date(o.createdAt).toLocaleString()}</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded-full bg-paperdim">
                {STATUS_LABEL[o.status]}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
