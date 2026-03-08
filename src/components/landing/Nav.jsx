import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useScrolled } from "../../hooks/useScrolled";
import { useAuth } from "../../context/AuthContext";
import { Sun, Moon, LayoutDashboard, Menu, X } from "lucide-react";
import XsblBull from "./XsblBull";
import "./Nav.css";

var landingLinks = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "features" },
  { label: "GitHub PRs", id: "github" },
  { label: "Simulator", id: "simulator" },
  { label: "Pricing", id: "pricing" },
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
  var [mobileOpen, setMobileOpen] = useState(false);

  var isLanding =
    typeof window !== "undefined" &&
    (window.location.pathname === "/" || window.location.pathname === "");
  var links = isLanding
    ? landingLinks
    : pageLinks.filter(function (link) {
        return link.href !== window.location.pathname;
      });

  // Close mobile menu on Escape
  useEffect(
    function () {
      if (!mobileOpen) return;
      var handler = function (e) {
        if (e.key === "Escape") setMobileOpen(false);
      };
      document.addEventListener("keydown", handler);
      return function () {
        document.removeEventListener("keydown", handler);
      };
    },
    [mobileOpen]
  );

  // Close mobile menu on route change
  useEffect(
    function () {
      setMobileOpen(false);
    },
    [typeof window !== "undefined" ? window.location.pathname : ""]
  );

  // Prevent body scroll when mobile menu is open
  useEffect(
    function () {
      if (mobileOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
      return function () {
        document.body.style.overflow = "";
      };
    },
    [mobileOpen]
  );

  return (
    <nav
      className={"nav" + (scrolled ? " nav--scrolled" : "")}
      aria-label="Main navigation"
    >
      {/* Logo */}
      <a href="/" className="nav__logo">
        <XsblBull />
        xsbl<span className="nav__logo-dot">.</span>
      </a>

      {/* Center links — desktop */}
      <div className="nav__center">
        {links.map(function (link) {
          var isPageLink = !!link.href;
          return (
            <a
              key={link.label}
              href={isPageLink ? link.href : "#" + link.id}
              className="nav__link"
              onClick={
                !isPageLink
                  ? function (e) {
                      e.preventDefault();
                      scrollTo(link.id);
                    }
                  : undefined
              }
            >
              {link.label}
            </a>
          );
        })}
      </div>

      {/* Right actions */}
      <div className="nav__actions">
        <button
          onClick={toggle}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          className="nav__theme-btn"
        >
          {dark ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>

        {user ? (
          <a href="/dashboard" className="nav__cta">
            <LayoutDashboard size={15} strokeWidth={2} />
            Dashboard
          </a>
        ) : (
          <>
            <a href="/login" className="nav__login-link">
              Log in
            </a>
            <a href="/signup" className="nav__cta">
              Get started
            </a>
          </>
        )}

        {/* Hamburger — mobile only */}
        <button
          className="nav__hamburger"
          onClick={function () {
            setMobileOpen(!mobileOpen);
          }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="nav-mobile-menu"
        >
          {mobileOpen ? (
            <X size={22} strokeWidth={1.8} />
          ) : (
            <Menu size={22} strokeWidth={1.8} />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        id="nav-mobile-menu"
        className={
          "nav__mobile-menu" + (mobileOpen ? " nav__mobile-menu--open" : "")
        }
        role="dialog"
        aria-label="Navigation menu"
      >
        {links.map(function (link) {
          var isPageLink = !!link.href;
          return (
            <a
              key={link.label}
              href={isPageLink ? link.href : "#" + link.id}
              className="nav__mobile-link"
              onClick={
                !isPageLink
                  ? function (e) {
                      e.preventDefault();
                      setMobileOpen(false);
                      scrollTo(link.id);
                    }
                  : function () {
                      setMobileOpen(false);
                    }
              }
            >
              {link.label}
            </a>
          );
        })}

        <div className="nav__mobile-divider" />

        {user ? (
          <a
            href="/dashboard"
            className="nav__mobile-cta"
            onClick={function () {
              setMobileOpen(false);
            }}
          >
            Dashboard
          </a>
        ) : (
          <>
            <a
              href="/login"
              className="nav__mobile-link"
              onClick={function () {
                setMobileOpen(false);
              }}
            >
              Log in
            </a>
            <a
              href="/signup"
              className="nav__mobile-cta"
              onClick={function () {
                setMobileOpen(false);
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
