import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios.js";
import MenuItemCard from "../components/MenuItemCard.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RestaurantMenu() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/restaurants/${id}`).then(({ data }) => setData(data));
  }, [id]);

  if (!data) return <p className="max-w-3xl mx-auto px-5 py-12 text-ink/50">Loading menu…</p>;

  const { restaurant, menu } = data;
  const categories = [...new Set(menu.map((m) => m.category))];

  const handleAdd = (item) => {
    if (!user) return navigate("/login");
    addItem(restaurant, item);
  };

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      {restaurant.image && (
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-48 object-cover rounded-2xl mb-6"
        />
      )}
      <h1 className="text-3xl font-bold">{restaurant.name}</h1>
      <p className="text-ink/50 mt-1">{restaurant.description}</p>
      <p className="font-mono text-xs text-ink/40 mt-2">
        {restaurant.address?.line1}, {restaurant.address?.city} · ₹{restaurant.deliveryFee} delivery
      </p>
      <Link
        to={`/restaurants/${id}/reviews`}
        className="inline-block font-mono text-xs bg-sage/15 text-sage px-2 py-1 rounded-full mt-3 hover:bg-sage/25"
      >
        ★ {restaurant.rating?.toFixed(1)} · {restaurant.numReviews || 0} rating
        {restaurant.numReviews === 1 ? "" : "s"} · Rate this restaurant
      </Link>

      {categories.map((cat) => (
        <div key={cat} className="mt-8">
          <h2 className="text-sm font-mono tracking-[0.2em] text-chili uppercase mb-2">{cat}</h2>
          {menu
            .filter((m) => m.category === cat)
            .map((item) => (
              <MenuItemCard key={item._id} item={item} onAdd={handleAdd} />
            ))}
        </div>
      ))}
    </div>
  );
}
