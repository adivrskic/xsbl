import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Globe,
  Settings,
  CreditCard,
  Sun,
  Moon,
  Menu,
  LogOut,
} from "lucide-react";
import XsblBull from "../../components/landing/XsblBull";
import "../../styles/dashboard.css";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Sites", path: "/dashboard/sites", icon: Globe },
  { label: "Settings", path: "/dashboard/settings", icon: Settings },
  { label: "Billing", path: "/dashboard/billing", icon: CreditCard },
];

export default function DashboardLayout() {
  const { t, dark, toggle } = useTheme();
  const { user, org, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  return (
    <div className="dash-wrapper">
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Sidebar */}
      <aside
        className={"dash-sidebar" + (mobileOpen ? " dash-sidebar--open" : "")}
      >
        <div className="dash-sidebar__header">
          <NavLink to="/dashboard" className="dash-sidebar__logo">
            <XsblBull />
            xsbl<span className="dash-sidebar__logo-dot">.</span>
          </NavLink>
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            className="theme-toggle"
            style={{ borderRadius: 6, padding: "0.3rem 0.45rem" }}
          >
            {dark ? (
              <Sun size={15} strokeWidth={2} />
            ) : (
              <Moon size={15} strokeWidth={2} />
            )}
          </button>
        </div>

        {org && (
          <div className="dash-sidebar__org">
            <div className="dash-sidebar__org-name">{org.name}</div>
            <div className="dash-sidebar__org-plan">{org.plan} plan</div>
          </div>
        )}

        <nav aria-label="Dashboard navigation" className="dash-sidebar__nav">
          {navItems.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                "dash-nav-link" + (isActive ? " dash-nav-link--active" : "")
              }
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-sidebar__footer">
          <div className="dash-sidebar__user">
            {user?.user_metadata?.full_name || user?.email}
          </div>
          <button onClick={handleSignOut} className="dash-signout">
            <LogOut size={13} strokeWidth={1.8} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" className="dash-main">
        <div className="dash-mobile-bar">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            className="dash-mobile-bar__toggle"
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>
          <span className="dash-mobile-bar__brand">
            xsbl<span className="dash-sidebar__logo-dot">.</span>
          </span>
          <div style={{ width: 28 }} />
        </div>

        <div className="dash-main__content">
          <Outlet />
        </div>
      </main>

      {mobileOpen && (
        <div
          className="dash-mobile-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </div>
  );
}
