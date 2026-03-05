import { useTheme } from "../../context/ThemeContext";

export function Eyebrow({ children }) {
  const { t } = useTheme();
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.7rem",
        textTransform: "uppercase",
        letterSpacing: "0.14em",
        color: t.accent,
        fontWeight: 600,
        marginBottom: "1rem",
        display: "flex",
        alignItems: "center",
        gap: "0.6rem",
      }}
    >
      <span style={{ width: 20, height: 1.5, background: t.accent }} />
      {children}
    </div>
  );
}

export function H2({ children }) {
  const { t } = useTheme();
  return (
    <h2
      style={{
        fontFamily: "var(--serif)",
        fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
        lineHeight: 1.18,
        fontWeight: 700,
        letterSpacing: "-0.015em",
        maxWidth: 640,
        marginBottom: "1.2rem",
        color: t.ink,
      }}
    >
      {children}
    </h2>
  );
}

export function SubText({ children }) {
  const { t } = useTheme();
  return (
    <p
      style={{
        fontSize: "1.02rem",
        color: t.ink50,
        maxWidth: 520,
        lineHeight: 1.75,
        marginBottom: "3rem",
      }}
    >
      {children}
    </p>
  );
}

export function Italic({ children }) {
  const { t } = useTheme();
  return (
    <span style={{ fontWeight: 400, fontStyle: "italic", color: t.accent }}>
      {children}
    </span>
  );
}
