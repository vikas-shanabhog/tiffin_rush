import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { distanceKm, deliveryFeeForDistance } from "../utils/deliveryFee.js";

const emptyAddress = {
  firstName: "",
  lastName: "",
  email: "",
  street: "",
  city: "",
  state: "",
  zipcode: "",
  country: "",
  phone: "",
};

const draftKey = (userId) => `checkout-draft:${userId || "guest"}`;

const loadDraft = (userId) => {
  try {
    const raw = localStorage.getItem(draftKey(userId));
    return raw ? { ...emptyAddress, ...JSON.parse(raw) } : emptyAddress;
  } catch {
    return emptyAddress;
  }
};

export default function Checkout() {
  const { items, restaurantId, itemsTotal } = useCart();
  const { user } = useAuth();
  const [address, setAddress] = useState(() => loadDraft(user?._id));
  const [coords, setCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("locating");
  const [restaurant, setRestaurant] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!restaurantId) return;
    api.get(`/restaurants/${restaurantId}`).then(({ data }) => setRestaurant(data.restaurant));
  }, [restaurantId]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocationStatus("ok");
      },
      () => setLocationStatus("denied"),
      { enableHighAccuracy: false, timeout: 8000 }
    );
  }, []);

  const distance =
    coords && restaurant?.address?.lat != null
      ? distanceKm(restaurant.address.lat, restaurant.address.lng, coords.lat, coords.lng)
      : null;
  const deliveryFee = distance != null ? deliveryFeeForDistance(distance) : restaurant?.deliveryFee ?? 0;
  const total = itemsTotal + deliveryFee;

  useEffect(() => {
    localStorage.setItem(draftKey(user?._id), JSON.stringify(address));
  }, [address, user?._id]);

  const update = (field) => (e) => setAddress({ ...address, [field]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const { data: order } = await api.post("/orders", {
        restaurantId,
        items,
        deliveryAddress: { ...address, lat: coords?.lat, lng: coords?.lng },
      });
      const { data } = await api.post(`/payments/${order._id}/create-checkout-session`);
      localStorage.removeItem(draftKey(user?._id));
      window.location.href = data.url;
    } catch (err) {
      console.error("Checkout failed:", err);
      setError(err.response?.data?.message || "Could not start checkout");
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-5 py-12">
      <h1 className="text-2xl font-bold mb-6">Delivery Information</h1>
      <form onSubmit={placeOrder} className="grid md:grid-cols-[1fr_320px] gap-10">
        <div className="grid grid-cols-2 gap-4">
          <input required placeholder="First Name" value={address.firstName} onChange={update("firstName")}
            className="px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="Last Name" value={address.lastName} onChange={update("lastName")}
            className="px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required type="email" placeholder="emailaddress" value={address.email} onChange={update("email")}
            className="col-span-2 px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="street" value={address.street} onChange={update("street")}
            className="col-span-2 px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="City" value={address.city} onChange={update("city")}
            className="px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="State" value={address.state} onChange={update("state")}
            className="px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="zipcode" value={address.zipcode} onChange={update("zipcode")}
            className="px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="Country" value={address.country} onChange={update("country")}
            className="px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
          <input required placeholder="phonenumber" value={address.phone} onChange={update("phone")}
            className="col-span-2 px-4 py-3 rounded-lg border border-line focus:outline-none focus:border-chili" />
        </div>

        <div>
          <h2 className="text-lg font-bold mb-4">Cart Total</h2>
          <div className="space-y-3">
            <div className="flex justify-between font-semibold pb-2 border-b-2 border-chili">
              <span>Subtotal</span>
              <span>{itemsTotal}</span>
            </div>
            <div className="flex justify-between font-semibold pb-2 border-b-2 border-chili">
              <span>
                Delivery Fee
                {distance != null && (
                  <span className="block text-xs font-normal text-ink/40">~{distance.toFixed(1)} km away</span>
                )}
              </span>
              <span>{deliveryFee}</span>
            </div>
            <div className="flex justify-between font-semibold pb-2 border-b-2 border-chili">
              <span>Total</span>
              <span>{total}</span>
            </div>
          </div>
          {error && <p className="text-chili text-sm mt-3">{error}</p>}
          {locationStatus === "denied" && (
            <p className="text-xs text-ink/40 mt-3">
              Enable location access for an accurate distance-based delivery fee — showing the restaurant's standard fee for now.
            </p>
          )}
          <button
            disabled={submitting || !items.length}
            className="w-full mt-6 py-3 rounded-lg border border-chili bg-mustard/40 font-semibold tracking-wide uppercase disabled:opacity-50"
          >
            {submitting ? "Redirecting…" : "Proceed to Pay"}
          </button>
        </div>
      </form>
    </div>
  );
}