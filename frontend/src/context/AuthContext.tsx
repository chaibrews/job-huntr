import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "../hooks/useAuth";

// createContext creates a shared container for the auth state
const AuthContext = createContext<ReturnType<typeof useAuth> | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  // useAuth runs once here — all consumers share this one instance
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

// Custom hook so components don't import AuthContext directly
export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
}
