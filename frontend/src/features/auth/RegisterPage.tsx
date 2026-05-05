import { useState, type FormEvent } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const { register } = useAuthContext();
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
      await register(email, password);
      // On success, redirect to the board
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl p-8 z-10">
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <img src="/huntr-logo.svg" alt="Logo" className="w-8" />
            <h1 className="text-3xl  text-primary-darker mb-1">huntR.</h1>
          </div>
          <p className="text-lg mb-6">Welcome to the job hunt.</p>
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
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-background border border-primary-darker/30 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-400"
            />
          </div>

          {/* Only shown when there's an error */}
          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="primary-button text-sm"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="text-sm mt-4 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-primary-darker hover:underline">
            Sign in.
          </Link>
        </p>
      </div>
    </div>
  );
}
