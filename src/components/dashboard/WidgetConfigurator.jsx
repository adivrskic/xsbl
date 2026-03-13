import { useState, useRef, useCallback, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
  Settings,
  BarChart3,
  Zap,
  TrendingUp,
  Bell,
  Globe,
  ChevronDown,
} from "lucide-react";

var WIDGET_DEFS = [
  {
    id: "stats",
    label: "Stats overview",
    icon: BarChart3,
    description: "Sites, avg score, plan usage",
  },
  {
    id: "quick_wins",
    label: "Quick wins",
    icon: Zap,
    description: "Highest-impact issues to fix first",
  },
  {
    id: "trends",
    label: "Issue trends",
    icon: TrendingUp,
    description: "Open issue count over time",
  },
  {
    id: "activity",
    label: "Activity feed",
    icon: Bell,
    description: "Recent scans, status changes",
  },
  {
    id: "sites",
    label: "Your sites",
    icon: Globe,
    description: "All monitored sites and scores",
  },
];

var DEFAULT_ORDER = WIDGET_DEFS.map(function (w) {
  return w.id;
});
var STORAGE_KEY = "xsbl-dash-widgets";

export function loadWidgetConfig() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: DEFAULT_ORDER.slice(), hidden: [] };
    var parsed = JSON.parse(raw);
    var order = parsed.order || DEFAULT_ORDER.slice();
    var hidden = parsed.hidden || [];
    // Forward-compatible: append any new widgets not in saved order
    DEFAULT_ORDER.forEach(function (id) {
      if (order.indexOf(id) === -1) order.push(id);
    });
    // Remove any widgets that no longer exist
    order = order.filter(function (id) {
      return DEFAULT_ORDER.indexOf(id) !== -1;
    });
    return { order: order, hidden: hidden };
  } catch (e) {
    return { order: DEFAULT_ORDER.slice(), hidden: [] };
  }
}

export function getVisibleWidgets() {
  var config = loadWidgetConfig();
  return config.order.filter(function (id) {
    return config.hidden.indexOf(id) === -1;
  });
}

function saveWidgetConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}
}

export default function WidgetConfigurator({ onChange }) {
  var { t } = useTheme();
  var [open, setOpen] = useState(false);
  var [config, setConfig] = useState(loadWidgetConfig);
  var containerRef = useRef(null);

  // Close on outside click
  useEffect(
    function () {
      if (!open) return;
      var handleClick = function (e) {
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClick);
      return function () {
        document.removeEventListener("mousedown", handleClick);
      };
    },
    [open]
  );

  // Use a ref to always have latest order available to drag handlers
  // This is the fix for the "1 render behind" drag-and-drop bug:
  // drag event handlers close over stale state, so we read from a ref instead
  var orderRef = useRef(config.order);
  var dragItemRef = useRef(null);
  var dragOverRef = useRef(null);

  var updateConfig = useCallback(
    function (newConfig) {
      orderRef.current = newConfig.order;
      setConfig(newConfig);
      saveWidgetConfig(newConfig);
      if (onChange) onChange(newConfig);
    },
    [onChange]
  );

  var handleToggle = function (id) {
    var newHidden =
      config.hidden.indexOf(id) !== -1
        ? config.hidden.filter(function (h) {
            return h !== id;
          })
        : config.hidden.concat([id]);
    updateConfig({ order: config.order, hidden: newHidden });
  };

  var handleReset = function () {
    updateConfig({ order: DEFAULT_ORDER.slice(), hidden: [] });
  };

  // --- Drag handlers using refs to avoid stale closures ---
  var handleDragStart = function (e, index) {
    dragItemRef.current = index;
    e.dataTransfer.effectAllowed = "move";
    // Make the drag ghost slightly transparent
    e.currentTarget.style.opacity = "0.5";
  };

  var handleDragEnd = function (e) {
    e.currentTarget.style.opacity = "1";
    dragItemRef.current = null;
    dragOverRef.current = null;
  };

  var handleDragOver = function (e, index) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragItemRef.current === null || dragItemRef.current === index) return;
    if (dragOverRef.current === index) return;
    dragOverRef.current = index;

    // Immediately compute new order from the ref (not stale state)
    var currentOrder = orderRef.current.slice();
    var draggedId = currentOrder[dragItemRef.current];
    currentOrder.splice(dragItemRef.current, 1);
    currentOrder.splice(index, 0, draggedId);
    dragItemRef.current = index;

    // Update both ref and state synchronously
    orderRef.current = currentOrder;
    var newConfig = { order: currentOrder, hidden: config.hidden };
    setConfig(newConfig);
    saveWidgetConfig(newConfig);
    if (onChange) onChange(newConfig);
  };

  var handleDrop = function (e) {
    e.preventDefault();
  };

  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <button
        onClick={function () {
          setOpen(!open);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.4rem 0.7rem",
          borderRadius: 7,
          border: "1.5px solid " + (open ? t.accent + "40" : t.ink08),
          background: open ? t.accentBg : "transparent",
          color: open ? t.accent : t.ink50,
          fontFamily: "var(--mono)",
          fontSize: "0.66rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
        }}
      >
        <Settings size={13} strokeWidth={2} />
        Customize
        <ChevronDown
          size={12}
          strokeWidth={2}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.15s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 300,
            padding: "0.8rem",
            borderRadius: 10,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            boxShadow: "0 8px 30px " + t.ink08,
            zIndex: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.6rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                fontWeight: 600,
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Dashboard widgets
            </span>
            <button
              onClick={handleReset}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                padding: "0.2rem 0.45rem",
                borderRadius: 4,
                border: "none",
                background: "none",
                color: t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                fontWeight: 500,
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={function (e) {
                e.currentTarget.style.color = t.accent;
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.color = t.ink50;
              }}
            >
              <RotateCcw size={10} strokeWidth={2} /> Reset
            </button>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}
          >
            {config.order.map(function (id, index) {
              var def = WIDGET_DEFS.find(function (w) {
                return w.id === id;
              });
              if (!def) return null;
              var isHidden = config.hidden.indexOf(id) !== -1;
              var Icon = def.icon;

              return (
                <div
                  key={id}
                  draggable
                  onDragStart={function (e) {
                    handleDragStart(e, index);
                  }}
                  onDragEnd={handleDragEnd}
                  onDragOver={function (e) {
                    handleDragOver(e, index);
                  }}
                  onDrop={handleDrop}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.45rem 0.5rem",
                    borderRadius: 7,
                    border: "1px solid transparent",
                    background: "transparent",
                    opacity: isHidden ? 0.45 : 1,
                    cursor: "grab",
                    transition: "opacity 0.15s, background 0.1s",
                    userSelect: "none",
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.background = t.ink04;
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <GripVertical
                    size={14}
                    strokeWidth={1.5}
                    style={{ color: t.ink50, flexShrink: 0, cursor: "grab" }}
                  />
                  <Icon
                    size={14}
                    strokeWidth={2}
                    style={{
                      color: isHidden ? t.ink50 : t.accent,
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--body)",
                        fontSize: "0.76rem",
                        fontWeight: 500,
                        color: isHidden ? t.ink50 : t.ink,
                        textDecoration: isHidden ? "line-through" : "none",
                        lineHeight: 1.3,
                      }}
                    >
                      {def.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.55rem",
                        color: t.ink50,
                      }}
                    >
                      {def.description}
                    </div>
                  </div>
                  <button
                    onClick={function (e) {
                      e.stopPropagation();
                      handleToggle(id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "0.25rem",
                      borderRadius: 5,
                      border: "none",
                      background: "none",
                      color: isHidden ? t.ink50 : t.accent,
                      cursor: "pointer",
                      flexShrink: 0,
                      transition: "color 0.15s",
                    }}
                    title={isHidden ? "Show widget" : "Hide widget"}
                  >
                    {isHidden ? (
                      <EyeOff size={14} strokeWidth={2} />
                    ) : (
                      <Eye size={14} strokeWidth={2} />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
