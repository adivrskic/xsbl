import { useTheme } from "../../context/ThemeContext";
import { footerLinks } from "../../data/content";

export default function Footer() {
  const { t } = useTheme();

  return (
    <footer
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "2.5rem clamp(1.5rem, 3vw, 3rem)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "1rem",
        fontSize: "0.78rem",
        color: t.ink50,
        borderTop: `1px solid ${t.ink08}`,
      }}
    >
      <span>xsbl · Accessibility scanning, powered by AI.</span>
      <div style={{ display: "flex", gap: "2rem" }}>
        {footerLinks.map(function (link) {
          return (
            <a
              key={link.label}
              href={link.href}
              style={{
                color: t.ink50,
                textDecoration: "none",
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
    </footer>
  );
}
