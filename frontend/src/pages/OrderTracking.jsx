import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import { socket } from "../api/socket.js";
import KitchenTicket from "../components/KitchenTicket.jsx";

export default function OrderTracking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [courier, setCourier] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    // Coming back from Stripe Checkout: confirm the session right away so
    // the order shows as paid even if the webhook hasn't landed yet (e.g.
    // in local dev without `stripe listen` running).
    const load = sessionId
      ? api.post(`/payments/${id}/confirm-session`, { sessionId })
      : api.get(`/orders/${id}`);
    load.then(({ data }) => setOrder(data));
    socket.emit("join_order", id);

    const onStatus = (payload) => {
      if (payload.orderId !== id) return;
      setOrder((prev) => (prev ? { ...prev, status: payload.status, statusHistory: payload.statusHistory || prev.statusHistory } : prev));
    };
    const onLocation = (payload) => {
      if (payload.orderId !== id) return;
      setCourier({ lat: payload.lat, lng: payload.lng });
    };

    socket.on("order_status", onStatus);
    socket.on("delivery_location", onLocation);
    return () => {
      socket.off("order_status", onStatus);
      socket.off("delivery_location", onLocation);
    };
  }, [id]);

  if (!order) return <p className="max-w-xl mx-auto px-5 py-12 text-ink/50">Loading order…</p>;

  return (
    <div className="max-w-xl mx-auto px-5 py-12">
      <h1 className="text-2xl font-bold mb-2 text-center">Tracking your order</h1>
      <p className="text-center text-ink/50 text-sm mb-8">{order.restaurant?.name}</p>
      <KitchenTicket order={order} />
      {courier && (
        <p className="text-center font-mono text-xs text-ink/40 mt-6">
          Courier last seen at {courier.lat.toFixed(4)}, {courier.lng.toFixed(4)}
        </p>
      )}
    </div>
  );
}