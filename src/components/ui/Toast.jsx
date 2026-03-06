import { createContext, useContext, useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { Check, X, AlertTriangle, Info } from "lucide-react";
import "./Toast.css";

const ToastCtx = createContext(null);

const ICONS = {
  success: Check,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

const ICON_COLORS = {
  success: "var(--green)",
  error: "var(--red)",
  warning: "var(--amber)",
  info: "var(--accent)",
};

function Toast({ id, type, message, onDismiss }) {
  const Icon = ICONS[type] || Info;

  return (
    <div className={"toast toast--" + (type || "info")}>
      <Icon
        size={16}
        color={ICON_COLORS[type] || ICON_COLORS.info}
        strokeWidth={2}
        style={{ flexShrink: 0 }}
      />
      <span className="toast__message">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
        className="toast__dismiss"
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
      <div
        role="status"
        aria-live="polite"
        aria-atomic="false"
        className="toast-container"
      >
        {toasts.map((t) => (
          <div key={t.id}>
            <Toast {...t} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be inside <ToastProvider>");
  return ctx;
}
