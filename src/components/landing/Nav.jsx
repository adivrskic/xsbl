import { useTheme } from "../../context/ThemeContext";
import { useScrolled } from "../../hooks/useScrolled";
import { Sun, Moon } from "lucide-react";
import XsblBull from "./XsblBull";
import "./Nav.css";

var landingLinks = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "agent" },
  { label: "GitHub PRs", id: "github" },
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

  var isLanding =
    typeof window !== "undefined" &&
    (window.location.pathname === "/" || window.location.pathname === "");
  var links = isLanding ? landingLinks : pageLinks;

  return (
    <nav
      aria-label="Main navigation"
      className={"nav" + (scrolled ? " nav--scrolled" : "")}
    >
      {/* Logo — always links to / */}
      <a href="/" className="nav__logo">
        <XsblBull />
        xsbl<span className="nav__logo-dot">.</span>
      </a>

      {/* Center links — context-aware */}
      <div className="hide-mobile nav__center">
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
              className="nav-link"
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
          className="theme-toggle"
        >
          {dark ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>
        <a href="/login" className="nav-link">
          Log in
        </a>
        <a href="/signup" className="btn btn-primary">
          Get started
        </a>
      </div>
    </nav>
  );
}
