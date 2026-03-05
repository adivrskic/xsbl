import { useState, createContext, useContext, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { AlertTriangle } from "lucide-react";

const ConfirmCtx = createContext(null);

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}) {
  const { t } = useTheme();

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9998,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        style={{
          background: t.cardBg,
          borderRadius: 14,
          width: "100%",
          maxWidth: 380,
          border: `1px solid ${t.ink08}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          padding: "1.5rem",
          animation: "confirmIn 0.2s ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.6rem",
          }}
        >
          {danger && <AlertTriangle size={18} color={t.red} strokeWidth={2} />}
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.05rem",
              fontWeight: 700,
              color: t.ink,
              margin: 0,
            }}
          >
            {title}
          </h3>
        </div>
        <p
          style={{
            fontSize: "0.86rem",
            color: t.ink50,
            lineHeight: 1.6,
            marginBottom: "1.3rem",
          }}
        >
          {message}
        </p>
        <div
          style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}
        >
          <button
            onClick={onCancel}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: `1.5px solid ${t.ink20}`,
              background: "none",
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.84rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: "none",
              background: danger ? t.red : t.accent,
              color: "white",
              fontFamily: "var(--body)",
              fontSize: "0.84rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes confirmIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);

  const confirm = useCallback(({ title, message, confirmLabel, danger }) => {
    return new Promise((resolve) => {
      setDialog({
        title,
        message,
        confirmLabel,
        danger,
        onConfirm: () => {
          setDialog(null);
          resolve(true);
        },
        onCancel: () => {
          setDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  return (
    <ConfirmCtx.Provider value={confirm}>
      {children}
      {dialog && <ConfirmDialog {...dialog} />}
    </ConfirmCtx.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmCtx);
  if (!ctx) throw new Error("useConfirm must be inside <ConfirmProvider>");
  return ctx;
}
