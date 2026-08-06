import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/restaurants", { params: { search } }).then(({ data }) => {
      setRestaurants(data);
      setLoading(false);
    });
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-12">
      <section className="mb-12">
        <p className="font-mono text-xs tracking-[0.3em] text-chili mb-3">LOCAL KITCHENS · LIVE TRACKING</p>
        <h1 className="text-4xl md:text-5xl font-bold leading-[1.05] max-w-2xl">
          Order the tiffin your street already trusts.
        </h1>
        <p className="text-ink/60 mt-4 max-w-lg">
          Every order prints a live kitchen ticket — placed, confirmed, cooking, on the way, delivered.
        </p>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search restaurants…"
          className="mt-6 w-full max-w-md px-4 py-3 rounded-full border border-ink/20 bg-white focus:outline-none focus:ring-2 focus:ring-chili"
        />
      </section>

      {loading ? (
        <p className="text-ink/50">Loading restaurants…</p>
      ) : restaurants.length === 0 ? (
        <p className="text-ink/50">No restaurants found.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <Link
              key={r._id}
              to={`/restaurants/${r._id}`}
              className="block border border-line rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow"
            >
              {r.image ? (
                <img src={r.image} alt={r.name} className="h-32 w-full object-cover" />
              ) : (
                <div className="h-32 bg-paperdim flex items-center justify-center font-display text-2xl text-ink/20">
                  {r.name[0]}
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{r.name}</h3>
                  <span className="font-mono text-xs bg-sage/15 text-sage px-2 py-0.5 rounded-full">
                    ★ {r.rating?.toFixed?.(1) ?? r.rating}
                    {r.numReviews ? ` (${r.numReviews})` : ""}
                  </span>
                </div>
                <p className="text-sm text-ink/50 mt-1">{r.cuisine?.join(" · ")}</p>
                <p className="text-xs text-ink/40 mt-2 font-mono">
                  ₹{r.deliveryFee} delivery · min ₹{r.minOrder}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
