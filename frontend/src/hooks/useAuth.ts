import { useState, useEffect } from "react";
import type { User } from "../types";
import { fetchCurrentUser, loginUser, registerUser } from "../api/auth";

// This hook manages the logged-in user state for the whole app.
// It's the single source of truth for "who is logged in".

export function useAuth() {
  // null = not logged in, User object = logged in
  const [user, setUser] = useState<User | null>(null);

  // loading = true while we're checking if there's a saved token
  // We start as true so the app doesn't flash the login page
  // for a split second before realising the user is already logged in
  const [loading, setLoading] = useState(true);

  // On first mount, check if there's a token saved in localStorage.
  // If there is, verify it's still valid by calling /api/auth/me.
  // This handles the case where the user refreshes the page —
  // we restore their session automatically.
  useEffect(() => {
    const token = localStorage.getItem("huntr:token");

    if (!token) {
      // No token at all — definitely not logged in
      setLoading(false);
      return;
    }

    fetchCurrentUser()
      .then((u) => setUser(u))
      .catch(() => {
        // Token exists but is invalid/expired — clear it
        localStorage.removeItem("huntr:token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const { token, user } = await loginUser(email, password);
    // Store the token so it persists across page refreshes
    localStorage.setItem("huntr:token", token);
    setUser(user);
  }

  async function register(email: string, password: string) {
    const { token, user } = await registerUser(email, password);
    localStorage.setItem("huntr:token", token);
    setUser(user);
  }

  function logout() {
    localStorage.removeItem("huntr:token");
    setUser(null);
  }

  return { user, loading, login, register, logout };
}
