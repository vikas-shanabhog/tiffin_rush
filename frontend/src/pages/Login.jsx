import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(form.email, form.password);
      navigate(data.role === "restaurant" ? "/dashboard" : "/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="max-w-sm mx-auto px-5 py-16">
      <h1 className="text-2xl font-bold mb-6">Sign in</h1>
      <form onSubmit={submit} className="space-y-4">
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
        {error && <p className="text-chili text-sm">{error}</p>}
        <button className="w-full py-3 rounded-full bg-chili text-paper font-medium">Sign in</button>
      </form>
      <p className="text-sm text-ink/50 mt-4">
        New here? <Link to="/register" className="text-chili underline">Create an account</Link>
      </p>
    </div>
  );
}
