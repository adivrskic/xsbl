import { useRef, useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * SegmentedControl — pill-style switcher with a sliding highlight.
 *
 * Props:
 *   items: [{ id, label, icon? (lucide component), iconElement? (raw JSX) }]
 *   value: selected id
 *   onChange: (id) => void
 *   size?: "sm" | "md" (default "md")
 */
export default function SegmentedControl({ items, value, onChange, size }) {
  var { t } = useTheme();
  var containerRef = useRef(null);
  var [indicator, setIndicator] = useState({ left: 0, width: 0, ready: false });
  var sm = size === "sm";

  var measure = useCallback(function () {
    var container = containerRef.current;
    if (!container) return;
    var activeBtn = container.querySelector("[data-active='true']");
    if (!activeBtn) return;
    var cRect = container.getBoundingClientRect();
    var bRect = activeBtn.getBoundingClientRect();
    setIndicator({
      left: bRect.left - cRect.left,
      width: bRect.width,
      ready: true,
    });
  }, []);

  useEffect(
    function () {
      measure();
    },
    [value, items.length, measure]
  );

  // Remeasure on resize
  useEffect(
    function () {
      window.addEventListener("resize", measure);
      return function () {
        window.removeEventListener("resize", measure);
      };
    },
    [measure]
  );

  return (
    <div
      ref={containerRef}
      style={{
        display: "inline-flex",
        flexWrap: "wrap",
        position: "relative",
        borderRadius: sm ? 7 : 9,
        background: t.ink04,
        border: "1px solid " + t.ink08,
        padding: 3,
        gap: 2,
      }}
    >
      {/* Sliding highlight */}
      {indicator.ready && (
        <div
          style={{
            position: "absolute",
            top: 3,
            left: indicator.left,
            width: indicator.width,
            height: sm ? 26 : 32,
            borderRadius: sm ? 5 : 7,
            background: t.cardBg,
            border: "1px solid " + t.ink08,
            boxShadow: "0 1px 3px " + t.ink08,
            transition: "left 0.25s ease, width 0.25s ease",
            zIndex: 0,
          }}
        />
      )}

      {items.map(function (item) {
        var active = item.id === value;
        var Icon = item.icon;
        var iconEl = item.iconElement;
        return (
          <button
            key={item.id}
            data-active={active ? "true" : "false"}
            onClick={function () {
              onChange(item.id);
            }}
            style={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: sm ? "0.2rem" : "0.35rem",
              padding: sm ? "0.25rem 0.5rem" : "0.4rem 0.85rem",
              height: sm ? 26 : 32,
              borderRadius: sm ? 5 : 7,
              border: "none",
              background: "transparent",
              color: active ? t.ink : t.ink50,
              fontFamily: "var(--body)",
              fontSize: sm ? "0.64rem" : "0.8rem",
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              transition: "color 0.2s",
              whiteSpace: "nowrap",
              boxSizing: "border-box",
            }}
          >
            {Icon && (
              <Icon size={sm ? 11 : 14} strokeWidth={active ? 2 : 1.5} />
            )}
            {iconEl && (
              <span style={{ display: "flex", alignItems: "center" }}>
                {iconEl}
              </span>
            )}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
