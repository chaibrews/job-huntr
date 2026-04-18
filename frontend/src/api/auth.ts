import type { AuthResponse, User } from "../types";

// const BASE = `${process.env.BACKEND_URL}/api/auth`;
const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/auth`;

function authHeaders(): HeadersInit {
  const token = localStorage.getItem("huntr:token");
  return {
    "Content-Type": "application/json",
    //  If a token exists, add an Authorization header
    // in the format Bearer <token>.
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function registerUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Registration failed");
  }

  return res.json();
}

export async function loginUser(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const res = await fetch(`${BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error ?? "Login failed");
  }

  return res.json();
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${BASE}/me`, {
    headers: authHeaders(),
  });

  if (!res.ok) throw new Error("Not authenticated");

  return res.json();
}
