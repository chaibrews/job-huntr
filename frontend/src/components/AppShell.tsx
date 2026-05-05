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
    <div className="min-h-screen bg-background">
      {/* ── SIDEBAR ── */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-shadow flex-col fixed top-0 left-0 h-screen z-40">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6">
          <img src="/huntr-logo.svg" className="w-10" />
          <span className="text-2xl font-medium tracking-wide text-foreground">
            hunt<span className="text-primary-darker">R</span>.
          </span>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-1 px-6 py-4 flex-1">
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

      {/* ── MOBILE NAV ── */}
      <div className="md:hidden sticky top-0 z-40 border-b border-shadow bg-background/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4 md:px-4 md:py-4">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/huntr-logo.svg" className="w-9 shrink-0" />
            <span className="text-xl font-medium tracking-wide text-foreground">
              hunt<span className="text-primary-darker">R</span>.
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="h-9 rounded-lg flex items-center justify-center shrink-0 cursor-pointer text-foreground/50 hover:text-red-400 hover:bg-white/50"
            aria-label="Log out"
          >
            <LogOut size={18} />
          </button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-6 pb-3">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors
                 ${
                   isActive
                     ? "bg-primary/15 text-primary-darker"
                     : "text-foreground/50 hover:text-foreground hover:bg-white/40"
                 }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="flex min-h-screen flex-col md:ml-[240px]">
        {/* Top bar — only rendered if header content is provided */}
        {(headerLeft || headerRight) && (
          <header className=" top-[112px] z-30 flex flex-col gap-3 px-6 py-4 md:px-4 backdrop-blur-sm shrink-0 sm:px-6 md:top-0 md:flex-row md:items-center md:justify-between md:py-6">
            <div className="flex min-w-0 items-center gap-4">{headerLeft}</div>
            <div className="flex min-w-0 items-center gap-3">{headerRight}</div>
          </header>
        )}

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
