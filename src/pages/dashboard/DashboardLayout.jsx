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

  // Close mobile sidebar on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && mobileOpen) setMobileOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const SW = 240;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: t.paper }}>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      {/* Sidebar */}
      <aside
        className="xsbl-sidebar"
        style={{
          width: SW,
          flexShrink: 0,
          borderRight: `1px solid ${t.ink08}`,
          background: t.cardBg,
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transition: "transform 0.25s ease",
        }}
      >
        {/* Logo row */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderBottom: `1px solid ${t.ink08}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <NavLink
            to="/dashboard"
            style={{
              fontFamily: "var(--mono)",
              fontWeight: 600,
              fontSize: "1.2rem",
              color: t.ink,
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "4px",
            }}
          >
            <XsblBull />
            xsbl<span style={{ color: t.accent }}>.</span>
          </NavLink>
          <button
            onClick={toggle}
            aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
            style={{
              background: t.ink08,
              border: "none",
              borderRadius: 6,
              padding: "0.3rem 0.45rem",
              cursor: "pointer",
              color: t.ink,
              display: "flex",
              alignItems: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = t.ink20)}
            onMouseLeave={(e) => (e.currentTarget.style.background = t.ink08)}
          >
            {dark ? (
              <Sun size={15} strokeWidth={2} />
            ) : (
              <Moon size={15} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Org pill */}
        {org && (
          <div
            style={{
              padding: "0.9rem 1.4rem",
              borderBottom: `1px solid ${t.ink08}`,
            }}
          >
            <div
              style={{
                fontSize: "0.78rem",
                fontWeight: 600,
                color: t.ink,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginBottom: "0.15rem",
              }}
            >
              {org.name}
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.64rem",
                color: t.accent,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 600,
              }}
            >
              {org.plan} plan
            </div>
          </div>
        )}

        {/* Nav links */}
        <nav
          aria-label="Dashboard navigation"
          style={{ flex: 1, padding: "0.6rem" }}
        >
          {navItems.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              onClick={() => setMobileOpen(false)}
              style={({ isActive }) => ({
                display: "flex",
                alignItems: "center",
                gap: "0.7rem",
                padding: "0.55rem 0.8rem",
                borderRadius: 8,
                marginBottom: "0.15rem",
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                color: isActive ? t.accent : t.ink50,
                background: isActive ? t.accentBg : "transparent",
                transition: "all 0.15s",
              })}
            >
              <Icon size={17} strokeWidth={1.8} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div
          style={{ padding: "1rem 1.4rem", borderTop: `1px solid ${t.ink08}` }}
        >
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 500,
              color: t.ink,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginBottom: "0.2rem",
            }}
          >
            {user?.user_metadata?.full_name || user?.email}
          </div>
          <button
            onClick={handleSignOut}
            style={{
              background: "none",
              border: "none",
              padding: 0,
              color: t.ink50,
              fontSize: "0.75rem",
              cursor: "pointer",
              fontFamily: "var(--body)",
              transition: "color 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = t.red)}
            onMouseLeave={(e) => (e.currentTarget.style.color = t.ink50)}
          >
            <LogOut size={13} strokeWidth={1.8} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" style={{ flex: 1, marginLeft: SW, minWidth: 0 }}>
        {/* Mobile top bar */}
        <div
          className="xsbl-mobile-bar"
          style={{
            display: "none",
            padding: "0.8rem 1rem",
            borderBottom: `1px solid ${t.ink08}`,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={
              mobileOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-expanded={mobileOpen}
            style={{
              background: "none",
              border: "none",
              color: t.ink,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Menu size={22} strokeWidth={1.8} />
          </button>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontWeight: 600,
              fontSize: "1rem",
              color: t.ink,
            }}
          >
            xsbl<span style={{ color: t.accent }}>.</span>
          </span>
          <div style={{ width: 28 }} />
        </div>

        <div
          style={{ padding: "2rem clamp(1.2rem, 3vw, 2.5rem)", maxWidth: 960 }}
        >
          <Outlet />
        </div>
      </main>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 40,
          }}
        />
      )}

      <style>{`
        @media (max-width: 768px) {
          .xsbl-mobile-bar { display: flex !important; }
          .xsbl-sidebar { transform: translateX(${
            mobileOpen ? "0" : "-100%"
          }); }
          main { margin-left: 0 !important; }
        }
      `}</style>
    </div>
  );
}
