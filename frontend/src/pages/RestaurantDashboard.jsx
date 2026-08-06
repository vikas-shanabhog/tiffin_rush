import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { socket } from "../api/socket.js";

const NEXT_STATUS = {
  placed: "confirmed",
  confirmed: "preparing",
  preparing: "out_for_delivery",
  out_for_delivery: "delivered",
};

// Uploads a single image file and returns its public URL (e.g. /uploads/xyz.jpg)
async function uploadImage(file) {
  const formData = new FormData();
  formData.append("image", file);
  const { data } = await api.post("/uploads", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data.url;
}

function ImagePicker({ value, onUploaded, label = "Photo" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file);
      onUploaded(url);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {value && (
        <img src={value} alt="" className="w-14 h-14 rounded-lg object-cover border border-line" />
      )}
      <div>
        <label className="text-xs px-3 py-1.5 rounded-full border border-ink/20 cursor-pointer inline-block">
          {uploading ? "Uploading…" : value ? `Change ${label.toLowerCase()}` : `Add ${label.toLowerCase()}`}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
        {error && <p className="text-chili text-xs mt-1">{error}</p>}
      </div>
    </div>
  );
}

function CreateRestaurantForm({ onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", city: "", deliveryFee: 30, image: "" });

  const submit = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/restaurants", {
      name: form.name,
      description: form.description,
      address: { city: form.city },
      deliveryFee: Number(form.deliveryFee),
      image: form.image,
    });
    onCreated(data);
  };

  return (
    <form onSubmit={submit} className="max-w-sm space-y-4">
      <h2 className="text-xl font-bold">Set up your restaurant</h2>
      <ImagePicker value={form.image} onUploaded={(url) => setForm({ ...form, image: url })} label="Restaurant photo" />
      <input
        required
        placeholder="Restaurant name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-ink/20"
      />
      <input
        placeholder="Short description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-ink/20"
      />
      <input
        required
        placeholder="City"
        value={form.city}
        onChange={(e) => setForm({ ...form, city: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-ink/20"
      />
      <input
        type="number"
        placeholder="Delivery fee"
        value={form.deliveryFee}
        onChange={(e) => setForm({ ...form, deliveryFee: e.target.value })}
        className="w-full px-4 py-3 rounded-lg border border-ink/20"
      />
      <button className="w-full py-3 rounded-full bg-chili text-paper font-medium">Create</button>
    </form>
  );
}

function RestaurantPhoto({ restaurant, onUpdated }) {
  const updateImage = async (url) => {
    const { data } = await api.put(`/restaurants/${restaurant._id}`, { image: url });
    onUpdated(data);
  };

  return (
    <div className="mb-8">
      <ImagePicker value={restaurant.image} onUploaded={updateImage} label="Restaurant photo" />
    </div>
  );
}

function MenuManager({ restaurant, menu, onChange }) {
  const [form, setForm] = useState({ name: "", price: "", category: "Mains", isVeg: true, image: "" });

  const addItem = async (e) => {
    e.preventDefault();
    const { data } = await api.post("/menu", { ...form, price: Number(form.price) });
    onChange([...menu, data]);
    setForm({ name: "", price: "", category: "Mains", isVeg: true, image: "" });
  };

  const toggleAvailable = async (item) => {
    const { data } = await api.put(`/menu/${item._id}`, { available: !item.available });
    onChange(menu.map((m) => (m._id === data._id ? data : m)));
  };

  const updateItemImage = async (item, url) => {
    const { data } = await api.put(`/menu/${item._id}`, { image: url });
    onChange(menu.map((m) => (m._id === data._id ? data : m)));
  };

  const removeItem = async (item) => {
    await api.delete(`/menu/${item._id}`);
    onChange(menu.filter((m) => m._id !== item._id));
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Menu</h2>
      <div className="border border-line rounded-xl bg-white divide-y divide-line mb-6">
        {menu.map((item) => (
          <div key={item._id} className="flex items-center justify-between p-3 gap-3">
            <div className="flex items-center gap-3">
              {item.image && (
                <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover border border-line" />
              )}
              <div>
                <p className="font-medium text-sm">{item.name}</p>
                <p className="font-mono text-xs text-ink/40">₹{item.price} · {item.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-ink/50 cursor-pointer underline">
                {item.image ? "Change photo" : "Add photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const url = await uploadImage(file);
                    updateItemImage(item, url);
                  }}
                />
              </label>
              <button
                onClick={() => toggleAvailable(item)}
                className="text-xs px-2 py-1 rounded-full border border-ink/20"
              >
                {item.available ? "Available" : "Sold out"}
              </button>
              <button onClick={() => removeItem(item)} className="text-xs text-chili">Remove</button>
            </div>
          </div>
        ))}
        {menu.length === 0 && <p className="p-3 text-sm text-ink/40">No items yet.</p>}
      </div>

      <div className="space-y-2">
        <ImagePicker value={form.image} onUploaded={(url) => setForm({ ...form, image: url })} label="Item photo" />
        <form onSubmit={addItem} className="flex flex-wrap gap-2">
          <input
            required
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="flex-1 min-w-[140px] px-3 py-2 rounded-lg border border-ink/20 text-sm"
          />
          <input
            required
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-24 px-3 py-2 rounded-lg border border-ink/20 text-sm"
          />
          <input
            placeholder="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-28 px-3 py-2 rounded-lg border border-ink/20 text-sm"
          />
          <button className="px-4 py-2 rounded-lg bg-ink text-paper text-sm">Add item</button>
        </form>
      </div>
    </div>
  );
}

function OrdersPanel({ restaurantId, orders, setOrders }) {
  useEffect(() => {
    if (!restaurantId) return;
    socket.emit("join_restaurant", restaurantId);
    const onNew = (order) => setOrders((prev) => [order, ...prev]);
    socket.on("new_order", onNew);
    return () => socket.off("new_order", onNew);
  }, [restaurantId, setOrders]);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    const { data } = await api.patch(`/orders/${order._id}/status`, { status: next });
    setOrders((prev) => prev.map((o) => (o._id === data._id ? data : o)));
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-3">Incoming orders</h2>
      <div className="space-y-3">
        {orders.map((o) => (
          <div key={o._id} className="p-4 border border-line rounded-xl bg-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-sm">{o.customer?.name || "Customer"}</p>
                <p className="text-xs text-ink/40 font-mono">₹{o.total} · {o.items.length} items</p>
              </div>
              <span className="font-mono text-xs px-2 py-1 rounded-full bg-paperdim">{o.status}</span>
            </div>
            {NEXT_STATUS[o.status] && (
              <button
                onClick={() => advance(o)}
                className="mt-3 text-xs px-3 py-1.5 rounded-full bg-chili text-paper"
              >
                Mark as {NEXT_STATUS[o.status].replace(/_/g, " ")}
              </button>
            )}
          </div>
        ))}
        {orders.length === 0 && <p className="text-sm text-ink/40">No orders yet.</p>}
      </div>
    </div>
  );
}

export default function RestaurantDashboard() {
  const [restaurant, setRestaurant] = useState(null);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    api
      .get("/restaurants/mine")
      .then(({ data }) => {
        setRestaurant(data.restaurant);
        setMenu(data.menu);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (restaurant) {
      api.get("/orders/restaurant").then(({ data }) => setOrders(data));
    }
  }, [restaurant]);

  if (!loaded) return <p className="max-w-4xl mx-auto px-5 py-12 text-ink/50">Loading dashboard…</p>;

  if (!restaurant) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-12">
        <CreateRestaurantForm onCreated={setRestaurant} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="text-2xl font-bold mb-4">{restaurant.name} · Dashboard</h1>
      <RestaurantPhoto restaurant={restaurant} onUpdated={setRestaurant} />
      <div className="grid md:grid-cols-2 gap-10">
        <MenuManager restaurant={restaurant} menu={menu} onChange={setMenu} />
        <OrdersPanel restaurantId={restaurant._id} orders={orders} setOrders={setOrders} />
      </div>
    </div>
  );
}
