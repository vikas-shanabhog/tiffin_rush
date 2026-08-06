import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios.js";
import { useAuth } from "../context/AuthContext.jsx";
import StarRating from "../components/StarRating.jsx";

export default function MenuItemReviews() {
  const { id } = useParams();
  const { user } = useAuth();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: 0, count: 0 });
  const [mine, setMine] = useState({ eligible: false, review: null });
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  const load = () => {
    api.get(`/menu/${id}`).then(({ data }) => setItem(data));
    api.get(`/reviews/menu/${id}`).then(({ data }) => {
      setReviews(data.reviews);
      setStats({ average: data.average, count: data.count });
    });
    if (user?.role === "customer") {
      api.get(`/reviews/menu/${id}/mine`).then(({ data }) => {
        setMine(data);
        if (data.review) setForm({ rating: data.review.rating, comment: data.review.comment || "" });
      });
    }
  };

  useEffect(load, [id, user]);

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await api.post(`/reviews/menu/${id}`, form);
      setSaved(true);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save your rating");
    } finally {
      setSaving(false);
    }
  };

  if (!item) return <p className="max-w-2xl mx-auto px-5 py-12 text-ink/50">Loading…</p>;

  return (
    <div className="max-w-2xl mx-auto px-5 py-12">
      <Link to={`/restaurants/${item.restaurant._id}`} className="text-xs font-mono text-ink/40 hover:text-chili">
        ← Back to {item.restaurant.name}
      </Link>
      <h1 className="text-2xl font-bold mt-2">{item.name} · Ratings</h1>
      <div className="flex items-center gap-2 mt-2">
        <StarRating value={stats.average} readOnly />
        <span className="font-mono text-sm text-ink/60">
          {stats.average?.toFixed(1)} · {stats.count} rating{stats.count === 1 ? "" : "s"}
        </span>
      </div>

      {!user && (
        <p className="mt-8 text-sm text-ink/50">
          <Link to="/login" className="text-chili underline">
            Sign in
          </Link>{" "}
          as a customer to rate this dish.
        </p>
      )}

      {user?.role === "customer" &&
        (mine.eligible ? (
          <form onSubmit={submit} className="mt-8 p-5 border border-line rounded-xl bg-white space-y-3">
            <h2 className="font-semibold text-sm">
              {mine.review ? "Update your rating" : "Rate this dish"}
            </h2>
            <StarRating value={form.rating} onChange={(r) => setForm({ ...form, rating: r })} size="text-2xl" />
            <textarea
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="What did you think? (optional)"
              rows={3}
              maxLength={500}
              className="w-full px-3 py-2 rounded-lg border border-ink/20 text-sm"
            />
            <button
              disabled={saving}
              className="px-4 py-2 rounded-full bg-chili text-paper text-sm font-medium disabled:opacity-50"
            >
              {saving ? "Saving…" : mine.review ? "Update rating" : "Submit rating"}
            </button>
            {saved && <p className="text-sage text-xs">Saved, thank you!</p>}
            {error && <p className="text-chili text-xs">{error}</p>}
          </form>
        ) : (
          <p className="mt-8 text-sm text-ink/50">
            You can rate this dish once an order containing it has been delivered to you.
          </p>
        ))}

      <div className="mt-10 space-y-4">
        {reviews.length === 0 && <p className="text-sm text-ink/40">No ratings yet.</p>}
        {reviews.map((r) => (
          <div key={r._id} className="pb-4 border-b border-line last:border-0">
            <div className="flex items-center justify-between">
              <p className="font-medium text-sm">{r.customer?.name || "Customer"}</p>
              <StarRating value={r.rating} readOnly size="text-sm" />
            </div>
            {r.comment && <p className="text-sm text-ink/60 mt-1">{r.comment}</p>}
            <p className="text-xs text-ink/30 font-mono mt-1">
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
