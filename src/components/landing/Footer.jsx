import { useTheme } from "../../context/ThemeContext";
import XsblBull from "./XsblBull";
import "./Footer.css";

var footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "GitHub PRs", href: "/#github" },
      { label: "How it works", href: "/#how" },
      { label: "Pricing", href: "/#pricing" },
      { label: "Simulator", href: "/#simulator" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Agency plan", href: "/agency" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
      { label: "Documentation", href: "/docs" },
      { label: "RSS feed", href: "/blog/feed.xml" },
      { label: "WCAG reference", href: "/wcag" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Security", href: "/security" },
      { label: "Terms of service", href: "/terms" },
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
          Building a web that works for everyone.
        </span>
      </div>
    </footer>
  );
}
