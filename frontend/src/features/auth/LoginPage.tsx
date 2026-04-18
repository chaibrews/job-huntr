import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    // Prevent the browser's default form submission (page reload)
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      // On success, redirect to the board
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <img src="/huntr.svg" alt="Logo" className="w-8" />
            <h1 className="text-3xl  text-primary-darker mb-1">huntR.</h1>
          </div>
          <p className="text-lg mb-6">Welcome back to the job hunt.</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border border-primary-darker/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs uppercase tracking-wider">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-background border border-primary-darker/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
            />
          </div>

          {/* Only shown when there's an error */}
          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="primary-button disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          No account?{" "}
          <Link to="/register" className="text-primary-darker hover:underline">
            Register here.
          </Link>
        </p>
      </div>
    </div>
  );
}
