import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const draftKey = "register-draft";
const emptyDraft = { name: "", email: "", role: "customer" };

const loadDraft = () => {
  try {
    const raw = localStorage.getItem(draftKey);
    return raw ? { ...emptyDraft, ...JSON.parse(raw) } : emptyDraft;
  } catch {
    return emptyDraft;
  }
};

export default function Register() {
  const { register } = useAuth();
  const [form, setForm] = useState(() => ({ ...loadDraft(), password: "" }));
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Password is deliberately left out of what's saved — everything else
  // survives a refresh.
  useEffect(() => {
    const { name, email, role } = form;
    localStorage.setItem(draftKey, JSON.stringify({ name, email, role }));
  }, [form.name, form.email, form.role]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await register(form);
      localStorage.removeItem(draftKey);
      navigate(data.role === "restaurant" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      <form onSubmit={submit} className="space-y-4">
        <input
          required
          placeholder="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-ink/20"
        />
        <input
          required
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-ink/20"
        />
        <input
          required
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-ink/20"
        />
        <select
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="w-full px-4 py-3 rounded-lg border border-ink/20"
        >
          <option value="customer">I want to order food</option>
          <option value="restaurant">I run a restaurant</option>
          <option value="delivery">I deliver orders</option>
        </select>
        {error && <p className="text-chili text-sm">{error}</p>}
        <button className="w-full py-3 rounded-full bg-chili text-paper font-medium">Create account</button>
      </form>
    </div>
  );
}