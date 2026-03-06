import { useTheme } from "../../context/ThemeContext";
import { marqueeItems } from "../../data/content";

export default function Marquee() {
  const { t } = useTheme();
  const tripled = [...marqueeItems, ...marqueeItems, ...marqueeItems];

  const renderItems = (items, ariaHidden) =>
    items.map((text, i) => (
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
          aria-hidden="true"
          style={{
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: t.accentLight,
          }}
        />
        {text}
      </span>
    ));

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
        {/* First set — visible to screen readers */}
        <span style={{ display: "contents" }}>
          {renderItems(marqueeItems, false)}
        </span>
        {/* Duplicate sets — hidden from screen readers */}
        <span aria-hidden="true" style={{ display: "contents" }}>
          {renderItems(marqueeItems, true)}
        </span>
        <span aria-hidden="true" style={{ display: "contents" }}>
          {renderItems(marqueeItems, true)}
        </span>
      </div>
    </div>
  );
}
