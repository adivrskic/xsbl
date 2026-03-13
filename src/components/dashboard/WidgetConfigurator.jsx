import { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Settings2,
  X,
  GripVertical,
  Eye,
  EyeOff,
  RotateCcw,
} from "lucide-react";

/**
 * WidgetConfigurator — lets users toggle and reorder dashboard overview widgets.
 *
 * Config is stored in localStorage as JSON: { order: string[], hidden: string[] }
 * Widgets not in the config get appended at the end (forward-compatible).
 */

var STORAGE_KEY = "xsbl-dashboard-widgets";

var WIDGET_DEFS = [
  {
    id: "stats",
    label: "Stats overview",
    description: "Sites, avg score, plan usage",
    icon: "📊",
  },
  {
    id: "quick_wins",
    label: "Quick wins",
    description: "Fix-these-first card for your worst site",
    icon: "⚡",
  },
  {
    id: "trends",
    label: "Issue trends",
    description: "Chart of issues over time",
    icon: "📈",
  },
  {
    id: "activity",
    label: "Activity feed",
    description: "Recent scan and issue events",
    icon: "🔔",
  },
  {
    id: "sites",
    label: "Your sites",
    description: "Site list with scores",
    icon: "🌐",
  },
];

var DEFAULT_ORDER = WIDGET_DEFS.map(function (w) {
  return w.id;
});

export function loadWidgetConfig() {
  try {
    var raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: DEFAULT_ORDER.slice(), hidden: [] };
    var parsed = JSON.parse(raw);
    var order = parsed.order || [];
    var hidden = parsed.hidden || [];
    // Ensure all known widget IDs are in the order (forward-compatible)
    var orderSet = new Set(order);
    for (var i = 0; i < DEFAULT_ORDER.length; i++) {
      if (!orderSet.has(DEFAULT_ORDER[i])) {
        order.push(DEFAULT_ORDER[i]);
      }
    }
    // Remove any IDs that no longer exist
    var knownSet = new Set(DEFAULT_ORDER);
    order = order.filter(function (id) {
      return knownSet.has(id);
    });
    hidden = hidden.filter(function (id) {
      return knownSet.has(id);
    });
    return { order: order, hidden: hidden };
  } catch (e) {
    return { order: DEFAULT_ORDER.slice(), hidden: [] };
  }
}

function saveWidgetConfig(config) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getVisibleWidgets() {
  var config = loadWidgetConfig();
  return config.order.filter(function (id) {
    return config.hidden.indexOf(id) === -1;
  });
}

export default function WidgetConfigurator({ onUpdate }) {
  var { t } = useTheme();
  var [open, setOpen] = useState(false);
  var [config, setConfig] = useState(loadWidgetConfig);
  var dragItem = useRef(null);
  var dragOverItem = useRef(null);

  var handleToggle = function (widgetId) {
    setConfig(function (prev) {
      var hidden = prev.hidden.slice();
      var idx = hidden.indexOf(widgetId);
      if (idx !== -1) {
        hidden.splice(idx, 1);
      } else {
        hidden.push(widgetId);
      }
      var next = { order: prev.order, hidden: hidden };
      saveWidgetConfig(next);
      if (onUpdate) onUpdate(next);
      return next;
    });
  };

  var handleDragStart = function (idx) {
    dragItem.current = idx;
  };

  var handleDragEnter = function (idx) {
    dragOverItem.current = idx;
  };

  var handleDragEnd = function () {
    if (dragItem.current === null || dragOverItem.current === null) return;
    setConfig(function (prev) {
      var order = prev.order.slice();
      var dragged = order.splice(dragItem.current, 1)[0];
      order.splice(dragOverItem.current, 0, dragged);
      var next = { order: order, hidden: prev.hidden };
      saveWidgetConfig(next);
      if (onUpdate) onUpdate(next);
      dragItem.current = null;
      dragOverItem.current = null;
      return next;
    });
  };

  var handleReset = function () {
    var next = { order: DEFAULT_ORDER.slice(), hidden: [] };
    saveWidgetConfig(next);
    setConfig(next);
    if (onUpdate) onUpdate(next);
  };

  var widgetMap = {};
  WIDGET_DEFS.forEach(function (w) {
    widgetMap[w.id] = w;
  });

  if (!open) {
    return (
      <button
        onClick={function () {
          setOpen(true);
        }}
        title="Customize dashboard"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          padding: "0.3rem 0.6rem",
          borderRadius: 6,
          border: "1px solid " + t.ink08,
          background: "none",
          color: t.ink50,
          fontFamily: "var(--mono)",
          fontSize: "0.62rem",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.15s",
        }}
        onMouseEnter={function (e) {
          e.currentTarget.style.borderColor = t.accent;
          e.currentTarget.style.color = t.accent;
        }}
        onMouseLeave={function (e) {
          e.currentTarget.style.borderColor = t.ink08;
          e.currentTarget.style.color = t.ink50;
        }}
      >
        <Settings2 size={12} strokeWidth={2} />
        Customize
      </button>
    );
  }

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        padding: "1rem 1.2rem",
        marginBottom: "1.5rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.7rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <Settings2 size={15} color={t.accent} strokeWidth={2} />
          <span style={{ fontSize: "0.86rem", fontWeight: 600, color: t.ink }}>
            Customize dashboard
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.3rem" }}>
          <button
            onClick={handleReset}
            title="Reset to defaults"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.25rem",
              padding: "0.25rem 0.5rem",
              borderRadius: 5,
              border: "1px solid " + t.ink08,
              background: "none",
              color: t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              cursor: "pointer",
            }}
          >
            <RotateCcw size={10} /> Reset
          </button>
          <button
            onClick={function () {
              setOpen(false);
            }}
            style={{
              display: "flex",
              padding: "0.2rem",
              borderRadius: 4,
              border: "none",
              background: "none",
              color: t.ink50,
              cursor: "pointer",
            }}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      <p
        style={{
          fontSize: "0.72rem",
          color: t.ink50,
          marginBottom: "0.7rem",
          lineHeight: 1.5,
        }}
      >
        Drag to reorder. Toggle visibility with the eye icon.
      </p>

      {/* Widget list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {config.order.map(function (widgetId, idx) {
          var def = widgetMap[widgetId];
          if (!def) return null;
          var isHidden = config.hidden.indexOf(widgetId) !== -1;

          return (
            <div
              key={widgetId}
              draggable
              onDragStart={function () {
                handleDragStart(idx);
              }}
              onDragEnter={function () {
                handleDragEnter(idx);
              }}
              onDragEnd={handleDragEnd}
              onDragOver={function (e) {
                e.preventDefault();
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.6rem",
                borderRadius: 7,
                border: "1px solid " + t.ink08,
                background: isHidden ? t.ink04 : t.paper,
                opacity: isHidden ? 0.5 : 1,
                cursor: "grab",
                transition: "opacity 0.15s",
                userSelect: "none",
              }}
            >
              {/* Drag handle */}
              <GripVertical
                size={14}
                color={t.ink50}
                style={{ flexShrink: 0, cursor: "grab" }}
              />

              {/* Icon + label */}
              <span style={{ fontSize: "0.82rem", flexShrink: 0 }}>
                {def.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    color: isHidden ? t.ink50 : t.ink,
                    textDecoration: isHidden ? "line-through" : "none",
                  }}
                >
                  {def.label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                  }}
                >
                  {def.description}
                </div>
              </div>

              {/* Toggle */}
              <button
                onClick={function () {
                  handleToggle(widgetId);
                }}
                title={isHidden ? "Show widget" : "Hide widget"}
                style={{
                  display: "flex",
                  padding: "0.25rem",
                  borderRadius: 4,
                  border: "none",
                  background: "none",
                  color: isHidden ? t.ink50 : t.accent,
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                {isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
