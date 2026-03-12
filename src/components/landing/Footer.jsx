import { useTheme } from "../../context/ThemeContext";
import XsblBull from "./XsblBull";
import "./Footer.css";

var footerColumns = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "/#how" },
      { label: "Features", href: "/#features" },
      { label: "GitHub PRs", href: "/#github" },
      { label: "Simulator", href: "/#simulator" },
      { label: "Pricing", href: "/#pricing" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "WCAG reference", href: "/wcag" },
      { label: "Changelog", href: "/changelog" },
      { label: "Free tools", href: "/tools" },
      { label: "RSS feed", href: "/blog/feed.xml" },
      { label: "Contact", href: "/contact" },
      { label: "Agency plan", href: "/agency" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms of service", href: "/terms" },
      { label: "Security", href: "/security" },
    ],
  },
];

export default function Footer() {
  var { t } = useTheme();
  var year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer__inner">
        {/* Brand column */}
        <div className="footer__brand">
          <a href="/" className="footer__logo">
            <XsblBull size={22} />
            xsbl<span className="footer__logo-dot">.</span>
          </a>
          <p className="footer__tagline">
            Accessibility scanning and automation, powered by AI. No overlays,
            no bull — just accessible code.
          </p>
        </div>

        {/* Link columns */}
        <div className="footer__columns">
          {footerColumns.map(function (col) {
            return (
              <nav
                key={col.title}
                className="footer__column"
                aria-label={col.title + " links"}
              >
                <h3 className="footer__column-title">{col.title}</h3>
                <ul className="footer__column-list">
                  {col.links.map(function (link) {
                    return (
                      <li key={link.label}>
                        <a href={link.href} className="footer__link">
                          {link.label}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            );
          })}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer__bottom">
        <span className="footer__copyright">
          &copy; {year} xsbl. All rights reserved.
        </span>
        <span className="footer__built">
          Built for the web that works for everyone.
        </span>
      </div>
    </footer>
  );
}
