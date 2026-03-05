import { useTheme } from "../../context/ThemeContext";
import { marqueeItems } from "../../data/content";

export default function Marquee() {
  const { t } = useTheme();
  const tripled = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  return (
    <div
      style={{
        background: t.marquee,
        color: t.marqueeText,
        padding: "0.9rem 0",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "2.5rem",
          animation: "scrollLeft 40s linear infinite",
          width: "max-content",
        }}
      >
        {tripled.map((text, i) => (
          <span
            key={i}
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.05em",
              whiteSpace: "nowrap",
              opacity: 0.55,
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "0.7rem",
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: t.accentLight,
              }}
            />
            {text}
          </span>
        ))}
      </div>
    </div>
  );
}
