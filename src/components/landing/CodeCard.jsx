import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { codeLines } from "../../data/content";

export default function CodeCard() {
  const { t, dark } = useTheme();
  const [hovered, setHovered] = useState(false);

  const diffBg = {
    del: dark ? "rgba(224,85,69,0.08)" : "rgba(192,57,43,0.08)",
    add: dark ? "rgba(52,211,153,0.07)" : "rgba(26,135,84,0.07)",
  };

  const colorMap = {
    del: t.red,
    add: t.green,
    comment: t.ink20,
    blank: "transparent",
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-hidden="true"
      style={{
        borderRadius: 14,
        overflow: "hidden",
        position: "relative",
        boxShadow:
          "0 2px 4px rgba(0,0,0,0.04), 0 8px 28px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.14)",
        transform: hovered ? "rotate(0deg)" : "rotate(1.2deg)",
        transition: "transform 0.45s cubic-bezier(0.22,1,0.36,1)",
      }}
    >
      {/* Floating badge */}
      <div
        className="hide-mobile"
        style={{
          position: "absolute",
          right: -12,
          top: "42%",
          background: t.paper,
          border: `1.5px solid ${t.accentBg2}`,
          padding: "0.4rem 0.75rem",
          borderRadius: 8,
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          color: t.accent,
          fontWeight: 600,
          boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          transform: "rotate(-2deg)",
          zIndex: 2,
          whiteSpace: "nowrap",
        }}
      >
        xsbl fix suggestion
      </div>

      {/* Window bar */}
      <div
        style={{
          padding: "0.8rem 1.2rem",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        {["#ff5f57", "#ffbd2e", "#28ca41"].map((c) => (
          <span
            key={c}
            style={{
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: c,
            }}
          />
        ))}
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            color: `${t.ink}`,
          }}
        >
          ProductCard.jsx — 4 fixes suggested
        </span>
      </div>

      {/* Code body */}
      <div
        style={{
          padding: "1.2rem 1.5rem",
          fontFamily: "var(--mono)",
          fontSize: "0.76rem",
          lineHeight: 1.85,
          overflowX: "auto",
        }}
      >
        {codeLines.map((line, i) => {
          const isDiff = line.type === "del" || line.type === "add";
          return (
            <div
              key={i}
              style={{
                background: isDiff ? diffBg[line.type] : "transparent",
                margin: isDiff ? "0 -1.5rem" : 0,
                padding: isDiff ? "0 1.5rem" : 0,
                color: colorMap[line.type] || "rgba(255,255,255,0.35)",
                textDecoration: line.type === "del" ? "line-through" : "none",
                textDecorationColor:
                  line.type === "del" ? `${t.red}44` : undefined,
                fontStyle: line.type === "comment" ? "italic" : "normal",
                minHeight: line.type === "blank" ? "1.2em" : undefined,
                whiteSpace: "pre",
              }}
            >
              {line.text || ""}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: "0.85rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            color: "#28ca41",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#28ca41",
              animation: "pulse 2s infinite",
            }}
          />
          Copy to clipboard
        </span>
        <span style={{ color: "rgba(255,255,255,0.18)" }}>
          WCAG 2.2 AA · 3 issues fixed
        </span>
      </div>
    </div>
  );
}
