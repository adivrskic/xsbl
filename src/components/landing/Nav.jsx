import { useTheme } from "../../context/ThemeContext";
import { useScrolled } from "../../hooks/useScrolled";
import { useAuth } from "../../context/AuthContext";
import { Sun, Moon, LayoutDashboard } from "lucide-react";
import XsblBull from "./XsblBull";

var landingLinks = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "features" },
  { label: "GitHub PRs", id: "github" },
  { label: "Simulator", id: "simulator" },
  { label: "Pricing", id: "pricing" },
  // { label: "Docs", href: "/docs" },
  // { label: "Blog", href: "/blog" },
  // { label: "Contact", href: "/contact" },
];

var pageLinks = [
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
  { label: "Pricing", href: "/#pricing" },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function Nav() {
  var { t, dark, toggle } = useTheme();
  var scrolled = useScrolled();
  var { user } = useAuth();

  var isLanding =
    typeof window !== "undefined" &&
    (window.location.pathname === "/" || window.location.pathname === "");
  var links = isLanding ? landingLinks : pageLinks;

  return (
    <nav
      aria-label="Main navigation"
      style={{
        position: "fixed",
        top: 0,
        width: "100%",
        zIndex: 100,
        padding: "0 clamp(1rem, 3vw, 3rem)",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: t.navBg,
        backdropFilter: "blur(24px) saturate(1.6)",
        WebkitBackdropFilter: "blur(24px) saturate(1.6)",
        borderBottom: "1px solid " + (scrolled ? t.navBorder : "transparent"),
        transition: "border-color 0.3s, background 0.3s",
      }}
    >
      {/* Logo — always links to / */}
      <a
        href="/"
        style={{
          display: "flex",
          gap: "4px",
          fontFamily: "var(--mono)",
          fontWeight: 600,
          fontSize: "1.3rem",
          letterSpacing: "-0.04em",
          color: t.ink,
          textDecoration: "none",
        }}
      >
        <XsblBull />
        xsbl<span style={{ color: t.accent }}>.</span>
      </a>

      {/* Center links — context-aware */}
      <div
        className="hide-mobile"
        style={{
          display: "flex",
          gap: "2.2rem",
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      >
        {links.map(function (link) {
          var isPageLink = !!link.href;
          return (
            <a
              key={link.label}
              href={isPageLink ? link.href : "#" + link.id}
              onClick={
                !isPageLink
                  ? function (e) {
                      e.preventDefault();
                      scrollTo(link.id);
                    }
                  : undefined
              }
              style={{
                color: t.ink50,
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={function (e) {
                e.target.style.color = t.ink;
              }}
              onMouseLeave={function (e) {
                e.target.style.color = t.ink50;
              }}
            >
              {link.label}
            </a>
          );
        })}
      </div>

      {/* Right actions */}
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
        <button
          onClick={toggle}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          style={{
            background: t.ink08,
            border: "none",
            borderRadius: 8,
            padding: "0.45rem 0.55rem",
            cursor: "pointer",
            color: t.ink,
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={function (e) {
            e.currentTarget.style.background = t.ink20;
          }}
          onMouseLeave={function (e) {
            e.currentTarget.style.background = t.ink08;
          }}
        >
          {dark ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>
        {user ? (
          <a
            href="/dashboard"
            style={{
              background: t.ink,
              color: t.paper,
              border: "none",
              fontFamily: "var(--body)",
              fontSize: "0.85rem",
              fontWeight: 600,
              padding: "0.55rem 1.3rem",
              borderRadius: 8,
              cursor: "pointer",
              textDecoration: "none",
              transition: "all 0.25s",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
            onMouseEnter={function (e) {
              e.currentTarget.style.background = t.accent;
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={function (e) {
              e.currentTarget.style.background = t.ink;
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            <LayoutDashboard size={15} strokeWidth={2} />
            Dashboard
          </a>
        ) : (
          <>
            <a
              href="/login"
              style={{
                color: t.ink50,
                textDecoration: "none",
                fontSize: "0.85rem",
                fontWeight: 500,
                transition: "color 0.2s",
              }}
              onMouseEnter={function (e) {
                e.target.style.color = t.ink;
              }}
              onMouseLeave={function (e) {
                e.target.style.color = t.ink50;
              }}
            >
              Log in
            </a>
            <a
              href="/signup"
              style={{
                background: t.ink,
                color: t.paper,
                border: "none",
                fontFamily: "var(--body)",
                fontSize: "0.85rem",
                fontWeight: 600,
                padding: "0.55rem 1.3rem",
                borderRadius: 8,
                cursor: "pointer",
                textDecoration: "none",
                transition: "all 0.25s",
              }}
              onMouseEnter={function (e) {
                e.currentTarget.style.background = t.accent;
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.background = t.ink;
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Get started
            </a>
          </>
        )}
      </div>
    </nav>
  );
}
