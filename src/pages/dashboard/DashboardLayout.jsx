import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
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
  Home,
  BookOpen,
  Mail,
  MessageSquare,
  X,
  Send,
  Bug,
  Lightbulb,
  Heart,
  Sparkles,
  Shield,
  Package,
  Code,
  Wrench,
} from "lucide-react";
import XsblBull from "../../components/landing/XsblBull";
import HelpSearch from "../../components/ui/HelpSearch";
import {
  useKeyboardShortcuts,
  ShortcutHelpOverlay,
} from "../../components/ui/KeyboardShortcuts";

const navItems = [
  { label: "Overview", path: "/dashboard", icon: LayoutDashboard, end: true },
  { label: "Sites", path: "/dashboard/sites", icon: Globe },
  { label: "Element Tester", path: "/dashboard/tester", icon: Code },
  { label: "Tools", path: "/dashboard/tools", icon: Wrench },
  {
    label: "Audit Log",
    path: "/dashboard/audit-log",
    icon: Shield,
    plans: ["agency"],
    hideForClient: true,
  },
  {
    label: "Evidence Export",
    path: "/dashboard/evidence",
    icon: Package,
    plans: ["agency"],
    hideForClient: true,
  },
  {
    label: "Settings",
    path: "/dashboard/settings",
    icon: Settings,
    hideForClient: true,
  },
  {
    label: "Billing",
    path: "/dashboard/billing",
    icon: CreditCard,
    hideForClient: true,
    ownerOnly: true,
  },
];

/* ── Feedback Modal ── */
function FeedbackModal({ onClose, t, user }) {
  var [type, setType] = useState("suggestion");
  var [message, setMessage] = useState("");
  var [sending, setSending] = useState(false);
  var [sent, setSent] = useState(false);

  var handleSubmit = async function () {
    if (!message.trim()) return;
    setSending(true);
    try {
      await supabase.from("feedback").insert({
        user_id: user?.id || null,
        email: user?.email || null,
        type: type,
        message: message.trim(),
        page_url: window.location.href,
      });

      var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (supabaseUrl) {
        fetch(supabaseUrl + "/functions/v1/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: user?.email || "Anonymous",
            email: user?.email || "no-reply@xsbl.io",
            subject: "Dashboard feedback: " + type,
            message: message.trim(),
            page_url: window.location.href,
          }),
        }).catch(function () {});
      }

      setSent(true);
    } catch (e) {
      console.error("Feedback error:", e);
    }
    setSending(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          borderRadius: 14,
          background: t.cardBg,
          border: "1px solid " + t.ink08,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1rem 1.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid " + t.ink08,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <MessageSquare size={16} color={t.accent} />
            <span
              style={{ fontSize: "0.92rem", fontWeight: 600, color: t.ink }}
            >
              Send feedback
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.ink50,
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          <div style={{ padding: "2rem 1.2rem", textAlign: "center" }}>
            <div style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
              <Sparkles size={24} color={t.accent} />
            </div>
            <div
              style={{
                fontSize: "0.92rem",
                fontWeight: 600,
                color: t.ink,
                marginBottom: "0.3rem",
              }}
            >
              Thanks for your feedback!
            </div>
            <div style={{ fontSize: "0.8rem", color: t.ink50 }}>
              We read every message and it helps us improve xsbl.
            </div>
            <button
              onClick={onClose}
              style={{
                marginTop: "1rem",
                padding: "0.45rem 1.2rem",
                borderRadius: 7,
                border: "1px solid " + t.ink20,
                background: "transparent",
                color: t.ink,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--body)",
              }}
            >
              Close
            </button>
          </div>
        ) : (
          <div style={{ padding: "1.2rem" }}>
            <div
              style={{ display: "flex", gap: "0.3rem", marginBottom: "0.8rem" }}
            >
              {[
                { id: "bug", label: "Bug", icon: <Bug size={13} /> },
                {
                  id: "suggestion",
                  label: "Suggestion",
                  icon: <Lightbulb size={13} />,
                },
                { id: "praise", label: "Praise", icon: <Heart size={13} /> },
                {
                  id: "other",
                  label: "Other",
                  icon: <MessageSquare size={13} />,
                },
              ].map(function (opt) {
                var active = type === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={function () {
                      setType(opt.id);
                    }}
                    style={{
                      padding: "0.35rem 0.65rem",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: "var(--body)",
                      border:
                        "1px solid " + (active ? t.accent + "40" : t.ink08),
                      background: active ? t.accentBg : "transparent",
                      color: active ? t.accent : t.ink50,
                      transition: "all 0.15s",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.3rem",
                      }}
                    >
                      {opt.icon} {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>

            <textarea
              value={message}
              onChange={function (e) {
                setMessage(e.target.value);
              }}
              placeholder="What's on your mind?"
              style={{
                width: "100%",
                minHeight: 100,
                padding: "0.7rem",
                borderRadius: 8,
                border: "1px solid " + t.ink08,
                background: t.paper,
                color: t.ink,
                fontSize: "0.84rem",
                fontFamily: "var(--body)",
                resize: "vertical",
                lineHeight: 1.6,
                outline: "none",
                boxSizing: "border-box",
              }}
              onFocus={function (e) {
                e.target.style.borderColor = t.accent + "40";
              }}
              onBlur={function (e) {
                e.target.style.borderColor = t.ink08;
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "0.8rem",
              }}
            >
              <button
                onClick={handleSubmit}
                disabled={!message.trim() || sending}
                style={{
                  padding: "0.5rem 1.2rem",
                  borderRadius: 7,
                  border: "none",
                  background: t.accent,
                  color: "white",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor:
                    !message.trim() || sending ? "not-allowed" : "pointer",
                  opacity: !message.trim() || sending ? 0.5 : 1,
                  fontFamily: "var(--body)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                }}
              >
                <Send size={13} />
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const { t, dark, toggle } = useTheme();
  const { user, org, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // ── Global dashboard keyboard shortcuts ──
  var globalShortcuts = [
    {
      key: "?",
      description: "Show keyboard shortcuts",
      category: "General",
      handler: function () {
        setShowShortcutHelp(function (v) {
          return !v;
        });
      },
    },
    {
      key: "t",
      description: "Toggle dark/light theme",
      category: "General",
      handler: toggle,
    },
    {
      key: "escape",
      description: "Close overlay",
      category: "General",
      handler: function () {
        if (showShortcutHelp) setShowShortcutHelp(false);
        if (showFeedback) setShowFeedback(false);
        if (mobileOpen) setMobileOpen(false);
      },
    },
  ];
  useKeyboardShortcuts(globalShortcuts);

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
          {navItems
            .filter(function (item) {
              if (item.hideForClient && org?.role === "client") return false;
              if (item.ownerOnly && org?.role !== "owner") return false;
              if (!item.plans) return true;
              return item.plans.indexOf(org?.plan || "free") !== -1;
            })
            .map(({ label, path, icon: Icon, end }) => (
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

        {/* User footer with links + feedback */}
        <div style={{ padding: "0.6rem", borderTop: `1px solid ${t.ink08}` }}>
          <HelpSearch />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.1rem",
              marginBottom: "0.5rem",
            }}
          >
            {[
              { label: "Home", href: "/", icon: Home },
              { label: "Blog", href: "/blog", icon: BookOpen },
              { label: "Contact", href: "/contact", icon: Mail },
            ].map(function (link) {
              return (
                <NavLink
                  key={link.label}
                  to={link.href}
                  onClick={function () {
                    setMobileOpen(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.4rem 0.8rem",
                    borderRadius: 7,
                    textDecoration: "none",
                    fontSize: "0.78rem",
                    fontWeight: 500,
                    color: t.ink50,
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.background = t.ink04;
                    e.currentTarget.style.color = t.ink;
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = t.ink50;
                  }}
                >
                  <link.icon size={14} strokeWidth={1.8} />
                  {link.label}
                </NavLink>
              );
            })}
            <button
              onClick={handleSignOut}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.4rem 0.8rem",
                borderRadius: 7,
                border: "none",
                background: "transparent",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: t.ink50,
                cursor: "pointer",
                fontFamily: "var(--body)",
                width: "100%",
                textAlign: "left",
                transition: "all 0.15s",
              }}
              onMouseEnter={function (e) {
                e.currentTarget.style.background = t.red + "08";
                e.currentTarget.style.color = t.red;
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = t.ink50;
              }}
            >
              <LogOut size={14} strokeWidth={1.8} />
              Sign out
            </button>
          </div>

          <button
            onClick={function () {
              setShowFeedback(true);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              width: "100%",
              padding: "0.5rem",
              borderRadius: 8,
              border: "1px dashed " + t.ink20,
              background: "transparent",
              color: t.ink50,
              fontFamily: "var(--body)",
              fontSize: "0.75rem",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={function (e) {
              e.currentTarget.style.borderColor = t.accent;
              e.currentTarget.style.color = t.accent;
              e.currentTarget.style.background = t.accentBg;
            }}
            onMouseLeave={function (e) {
              e.currentTarget.style.borderColor = t.ink20;
              e.currentTarget.style.color = t.ink50;
              e.currentTarget.style.background = "transparent";
            }}
          >
            <MessageSquare size={13} strokeWidth={1.8} />
            Send feedback
          </button>

          <div
            style={{
              fontSize: "0.68rem",
              color: t.ink50,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: "0.5rem",
              paddingLeft: "0.8rem",
            }}
          >
            {user?.email}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main id="main-content" style={{ flex: 1, marginLeft: SW, minWidth: 0 }}>
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

      {/* Feedback modal */}
      {showFeedback && (
        <FeedbackModal
          onClose={function () {
            setShowFeedback(false);
          }}
          t={t}
          user={user}
        />
      )}

      {/* Global keyboard shortcut help overlay */}
      {showShortcutHelp && (
        <ShortcutHelpOverlay
          shortcuts={globalShortcuts}
          onClose={function () {
            setShowShortcutHelp(false);
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
