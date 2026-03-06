import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { X, Play, Globe, FileText, List, Loader2 } from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-modals.css";

export default function ScanConfigModal({
  site,
  plan,
  onScan,
  onClose,
  scanning,
}) {
  const { t } = useTheme();
  const [mode, setMode] = useState("auto");
  const [manualUrls, setManualUrls] = useState("");
  const dialogRef = useRef(null);
  const previousFocus = useRef(null);

  useEffect(() => {
    previousFocus.current = document.activeElement;
    const dialog = dialogRef.current;
    if (dialog) {
      const close = dialog.querySelector("button");
      if (close) close.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
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
  }, [onClose]);

  const PAGE_LIMITS = { free: 5, starter: 10, pro: 25, agency: 50 };
  const maxPages = PAGE_LIMITS[plan] || PAGE_LIMITS.free;

  const handleScan = () => {
    if (mode === "manual") {
      const urls = manualUrls
        .split("\n")
        .map((u) => u.trim())
        .filter((u) => u.length > 0)
        .slice(0, maxPages);
      onScan({ urls });
    } else {
      onScan({});
    }
  };

  const modes = [
    {
      id: "auto",
      label: "Auto-crawl",
      desc: "Discovers pages from sitemap.xml or by following links",
      icon: Globe,
    },
    {
      id: "manual",
      label: "Specific URLs",
      desc: "Scan only the pages you specify",
      icon: List,
    },
  ];

  return (
    <div
      className="dash-modal"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="scan-config-title"
        className="dash-modal__dialog"
        style={{ maxWidth: 460 }}
      >
        <div className="dash-modal__header">
          <h3 id="scan-config-title" className="dash-modal__title">
            Configure scan
          </h3>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="dash-modal__close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="dash-modal__body">
          <p className="dash-modal__desc">
            Scanning{" "}
            <strong style={{ color: "var(--ink)" }}>{site.domain}</strong> — up
            to {maxPages} pages on your{" "}
            <span
              style={{
                color: "var(--accent)",
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {plan}
            </span>{" "}
            plan.
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.4rem",
              marginBottom: "1.2rem",
            }}
          >
            {modes.map(({ id, label, desc, icon: Icon }) => (
              <div
                key={id}
                onClick={() => setMode(id)}
                className={
                  "dash-option" + (mode === id ? " dash-option--active" : "")
                }
              >
                <div className="dash-option__label">
                  <Icon
                    size={15}
                    color={mode === id ? t.accent : t.ink50}
                    strokeWidth={1.8}
                  />
                  {label}
                </div>
                <p className="dash-option__desc">{desc}</p>
              </div>
            ))}
          </div>

          {mode === "manual" && (
            <div style={{ marginBottom: "1rem" }}>
              <label className="dash-config-label">
                URLs to scan (one per line, max {maxPages})
              </label>
              <textarea
                value={manualUrls}
                onChange={(e) => setManualUrls(e.target.value)}
                placeholder={`https://${site.domain}/\nhttps://${site.domain}/about\nhttps://${site.domain}/contact`}
                rows={5}
                className="dash-config-textarea"
              />
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: "var(--ink50)",
                  marginTop: "0.2rem",
                }}
              >
                {manualUrls.split("\n").filter((u) => u.trim()).length} /{" "}
                {maxPages} URLs
              </div>
            </div>
          )}

          <div className="dash-info-box">
            <FileText
              size={14}
              style={{ flexShrink: 0, marginTop: 2, color: "var(--ink50)" }}
            />
            <span>
              {mode === "auto"
                ? "We'll try your sitemap.xml first. If not found, we'll follow internal links from your homepage."
                : "Each URL will be loaded in a real browser and scanned with axe-core against WCAG 2.2."}
            </span>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleScan}
              disabled={scanning || (mode === "manual" && !manualUrls.trim())}
              className="auth-submit"
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                fontSize: "0.88rem",
              }}
            >
              {scanning ? (
                <Loader2 size={16} className="xsbl-spin" />
              ) : (
                <Play size={16} fill="white" />
              )}
              {scanning ? "Scanning…" : `Scan up to ${maxPages} pages`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
