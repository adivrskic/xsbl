import { createContext, useContext, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Check, X, AlertTriangle, Info } from "lucide-react";

const ToastCtx = createContext(null);

const ICONS = {
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

function Toast({ id, type, message, onDismiss }) {
  const { t } = useTheme();
  const Icon = ICONS[type] || Info;

  const colors = {
    success: { bg: t.greenBg, border: `${t.green}20`, icon: t.green },
    error: { bg: `${t.red}08`, border: `${t.red}20`, icon: t.red },
    warning: { bg: `${t.amber}08`, border: `${t.amber}20`, icon: t.amber },
    info: { bg: t.accentBg, border: `${t.accent}20`, icon: t.accent },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      style={{
        padding: "0.7rem 1rem",
        borderRadius: 10,
        background: c.bg,
        border: `1px solid ${c.border}`,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        animation: "toastIn 0.3s ease",
        maxWidth: 400,
      }}
    >
      <Icon
        size={16}
        color={c.icon}
        strokeWidth={2}
        style={{ flexShrink: 0 }}
      />
      <span
        style={{ fontSize: "0.84rem", color: t.ink, flex: 1, lineHeight: 1.5 }}
      >
        {message}
      </span>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        style={{
          background: "none",
          border: "none",
          padding: "0.15rem",
          cursor: "pointer",
          color: t.ink50,
          display: "flex",
          flexShrink: 0,
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, message, duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    if (duration > 0) {
      setTimeout(
        () => setToasts((prev) => prev.filter((t) => t.id !== id)),
        duration
      );
    }
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = {
    success: (msg) => addToast("success", msg),
    error: (msg) => addToast("error", msg, 6000),
    warning: (msg) => addToast("warning", msg, 5000),
    info: (msg) => addToast("info", msg),
  };

  return (
    <ToastCtx.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: "auto" }}>
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}
