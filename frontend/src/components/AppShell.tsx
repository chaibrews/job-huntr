// Fixed sidebar layout shared by all authenticated pages.
// The sidebar contains the logo, nav links, and user footer.
// Page content is rendered in the right panel via {children}.

import { type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
import {
  LayoutDashboard,
  Calendar,
  BarChart2,
  UserCircle,
  type LucideIcon,
  LogOut,
} from "lucide-react";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Board", icon: LayoutDashboard },
  { to: "/calendar", label: "Calendar", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: BarChart2 },
  { to: "/profile", label: "Profile", icon: UserCircle },
];

interface Props {
  children: ReactNode;
  // Optional header content rendered in the right panel's top bar
  headerLeft?: ReactNode;
  headerRight?: ReactNode;
}

export default function AppShell({ children, headerLeft, headerRight }: Props) {
  const { logout } = useAuthContext();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── SIDEBAR ── */}
      <aside className="w-60 shrink-0 border-r border-shadow flex flex-col fixed top-0 left-0 h-screen z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6">
          <img src="/huntr-logo.svg" className="w-10" />
          <span className="text-2xl font-medium tracking-wide text-foreground">
            hunt<span className="text-primary-darker">R</span>.
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-3 py-4 flex-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${
                   isActive
                     ? "bg-primary/15 text-primary-darker border-l-2 border-primary-darker -ml-px pl-[13px]"
                     : "text-foreground/50 hover:text-foreground hover:bg-background"
                 }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="px-6 py-8 flex">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer text-foreground/50 hover:text-red-400 hover:bg-background"
          >
            <LogOut size={20} />
            <span className="text-sm font-medium transition-colors">
              Log out
            </span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 ml-[240px] flex flex-col min-h-screen">
        {/* Top bar — only rendered if header content is provided */}
        {(headerLeft || headerRight) && (
          <header className="sticky top-0 z-30 backdrop-blur-sm flex items-center justify-between px-6 py-6 shrink-0">
            <div className="flex items-center gap-4">{headerLeft}</div>
            <div className="flex items-center gap-3">{headerRight}</div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
