const STEPS = [
  { key: "placed", label: "Order placed" },
  { key: "confirmed", label: "Confirmed by kitchen" },
  { key: "preparing", label: "Preparing" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

// Signature element: a live "kitchen ticket" — reads like a thermal-printer
// receipt that stamps each stage as it happens, with a perforated top edge.
export default function KitchenTicket({ order }) {
  if (!order) return null;
  const cancelled = order.status === "cancelled";
  const currentIndex = STEPS.findIndex((s) => s.key === order.status);

  const timeFor = (key) =>
    order.statusHistory?.find((h) => h.status === key)?.at;

  return (
    <div className="max-w-sm mx-auto">
      <div className="ticket-edge" />
      <div className="bg-ink text-paper font-mono text-xs px-6 py-6 shadow-lg">
        <p className="text-center tracking-[0.3em] text-mustard mb-1">TIFFIN RUN</p>
        <p className="text-center text-paper/50 mb-4">ORDER #{String(order._id).slice(-6).toUpperCase()}</p>
        <div className="border-t border-dashed border-paper/30 my-3" />

        {cancelled ? (
          <p className="text-center text-chili py-4">ORDER CANCELLED</p>
        ) : (
          <ul className="space-y-3">
            {STEPS.map((step, idx) => {
              const done = idx <= currentIndex;
              const active = idx === currentIndex;
              const stamp = timeFor(step.key);
              return (
                <li key={step.key} className="flex items-center justify-between">
                  <span className={done ? "text-paper" : "text-paper/30"}>
                    {done ? "✓" : "·"} {step.label}
                    {active && <span className="animate-pulse text-mustard"> ●</span>}
                  </span>
                  <span className="text-paper/40">
                    {stamp ? new Date(stamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                  </span>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t border-dashed border-paper/30 my-4" />
        <div className="flex justify-between text-paper/70">
          <span>Items</span>
          <span>₹{order.itemsTotal}</span>
        </div>
        <div className="flex justify-between text-paper/70">
          <span>Delivery</span>
          <span>₹{order.deliveryFee}</span>
        </div>
        <div className="flex justify-between mt-1 text-paper font-bold">
          <span>Total</span>
          <span>₹{order.total}</span>
        </div>
      </div>
      <div className="ticket-edge rotate-180" />
    </div>
  );
}
