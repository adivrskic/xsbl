import {
  useState,
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useTheme } from "../../context/ThemeContext";
import { AlertTriangle } from "lucide-react";
import "./ConfirmModal.css";

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
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) {
      const focusable = dialog.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) focusable[focusable.length - 1].focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onCancel();
        return;
      }
      if (e.key === "Tab" && dialog) {
        const focusable = dialog.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus.current) previousFocus.current.focus();
    };
  }, [onCancel]);

  return (
    <div
      className="overlay"
      style={{ zIndex: 9998 }}
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        className="confirm-dialog"
      >
        <div className="confirm-dialog__header">
          {danger && <AlertTriangle size={18} color={t.red} strokeWidth={2} />}
          <h3 id="confirm-dialog-title" className="confirm-dialog__title">
            {title}
          </h3>
        </div>
        <p className="confirm-dialog__message">{message}</p>
        <div className="confirm-dialog__actions">
          <button onClick={onCancel} className="btn-outline">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={danger ? "btn btn-danger" : "btn btn-accent"}
            style={{ padding: "0.5rem 1rem", fontSize: "0.84rem" }}
          >
            {confirmLabel || "Confirm"}
          </button>
        </div>
      </div>
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
