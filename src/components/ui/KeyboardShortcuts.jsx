import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";

/*
  useKeyboardShortcuts — registers keyboard shortcuts with cleanup.
  
  Usage:
    useKeyboardShortcuts([
      { key: "s", description: "Start scan", handler: () => handleScan() },
      { key: "j", description: "Next issue", handler: () => selectNext() },
    ]);
    
  Modifiers: ctrl, meta, shift, alt prefixed with +
    { key: "ctrl+k", handler: ... }
    
  Shortcuts are suppressed when focus is in an input, textarea, or select.
*/

export function useKeyboardShortcuts(shortcuts) {
  useEffect(
    function () {
      if (!shortcuts || shortcuts.length === 0) return;

      var handler = function (e) {
        // Don't fire shortcuts when typing in inputs
        var tag = document.activeElement?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        if (document.activeElement?.isContentEditable) return;

        for (var i = 0; i < shortcuts.length; i++) {
          var sc = shortcuts[i];
          var parts = sc.key.toLowerCase().split("+");
          var targetKey = parts[parts.length - 1];
          var needsCtrl = parts.indexOf("ctrl") !== -1;
          var needsMeta = parts.indexOf("meta") !== -1;
          var needsShift = parts.indexOf("shift") !== -1;
          var needsAlt = parts.indexOf("alt") !== -1;

          if (
            e.key.toLowerCase() === targetKey &&
            e.ctrlKey === needsCtrl &&
            e.metaKey === needsMeta &&
            e.shiftKey === needsShift &&
            e.altKey === needsAlt
          ) {
            e.preventDefault();
            sc.handler();
            return;
          }
        }
      };

      document.addEventListener("keydown", handler);
      return function () {
        document.removeEventListener("keydown", handler);
      };
    },
    [shortcuts]
  );
}

/*
  ShortcutHelpOverlay — shows all available shortcuts in a modal.
  Triggered by pressing "?"
*/
export function ShortcutHelpOverlay({ shortcuts, onClose }) {
  var { t } = useTheme();

  useEffect(
    function () {
      var handler = function (e) {
        if (e.key === "Escape") onClose();
      };
      document.addEventListener("keydown", handler);
      return function () {
        document.removeEventListener("keydown", handler);
      };
    },
    [onClose]
  );

  // Group shortcuts by category
  var groups = {};
  for (var i = 0; i < shortcuts.length; i++) {
    var sc = shortcuts[i];
    var cat = sc.category || "General";
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(sc);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 14,
          background: t.cardBg,
          border: "1px solid " + t.ink08,
          boxShadow: "0 16px 48px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1rem 1.2rem",
            borderBottom: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontSize: "0.92rem",
              fontWeight: 600,
              color: t.ink,
            }}
          >
            Keyboard shortcuts
          </span>
          <Kbd t={t}>Esc</Kbd>
        </div>

        {/* Shortcuts */}
        <div
          style={{
            padding: "0.8rem 1.2rem",
            maxHeight: 400,
            overflowY: "auto",
          }}
        >
          {Object.entries(groups).map(function (entry) {
            var category = entry[0];
            var items = entry[1];
            return (
              <div key={category} style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: t.ink50,
                    marginBottom: "0.4rem",
                  }}
                >
                  {category}
                </div>
                {items.map(function (sc) {
                  return (
                    <div
                      key={sc.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.35rem 0",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: t.ink,
                        }}
                      >
                        {sc.description}
                      </span>
                      <div style={{ display: "flex", gap: "0.2rem" }}>
                        {sc.key.split("+").map(function (k, ki) {
                          return (
                            <Kbd key={ki} t={t}>
                              {k === "?" ? "?" : k}
                            </Kbd>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Kbd({ children, t }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 22,
        height: 22,
        padding: "0 0.35rem",
        borderRadius: 4,
        background: t.ink04,
        border: "1px solid " + t.ink08,
        fontFamily: "var(--mono)",
        fontSize: "0.62rem",
        fontWeight: 600,
        color: t.ink50,
        textTransform: "capitalize",
      }}
    >
      {children}
    </span>
  );
}
