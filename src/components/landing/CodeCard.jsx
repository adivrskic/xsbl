import { codeLines } from "../../data/content";
import "./CodeCard.css";

export default function CodeCard() {
  return (
    <div className="code-card" aria-hidden="true">
      {/* Floating badge */}
      <div className="hide-mobile code-card__badge">xsbl fix suggestion</div>

      {/* Window bar */}
      <div className="code-card__bar">
        {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
          <span key={c} className="code-card__dot" style={{ background: c }} />
        ))}
        <span className="code-card__bar-title">
          ProductCard.jsx — 4 fixes suggested
        </span>
      </div>

      {/* Code body */}
      <div className="code-card__body">
        {codeLines.map((line, i) => {
          const typeClass = line.type
            ? ` code-card__line--${line.type}`
            : " code-card__line--code";
          return (
            <div key={i} className={"code-card__line" + typeClass}>
              {line.text || ""}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="code-card__footer">
        <span className="code-card__footer-status">
          <span className="code-card__footer-dot" />
          Copy to clipboard
        </span>
        <span className="code-card__footer-meta">
          WCAG 2.2 AA · 3 issues fixed
        </span>
      </div>
    </div>
  );
}
