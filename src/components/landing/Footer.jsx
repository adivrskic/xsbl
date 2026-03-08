import { footerLinks } from "../../data/content";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <span>xsbl · Accessibility scanning, powered by AI.</span>
      <nav className="footer__links" aria-label="Footer navigation">
        {footerLinks.map(function (link) {
          return (
            <a key={link.label} href={link.href} className="nav-link">
              {link.label}
            </a>
          );
        })}
      </nav>
    </footer>
  );
}
