import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { X, Play, Globe, FileText, List, Loader2 } from "lucide-react";

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
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(5px)",
        padding: "1rem",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: t.cardBg,
          borderRadius: 14,
          width: "100%",
          maxWidth: 460,
          border: `1px solid ${t.ink08}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderBottom: `1px solid ${t.ink08}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: t.ink,
              margin: 0,
            }}
          >
            Configure scan
          </h3>
          <button
            onClick={onClose}
            style={{
              background: t.ink04,
              border: "none",
              borderRadius: 8,
              padding: "0.3rem",
              cursor: "pointer",
              color: t.ink50,
              display: "flex",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.3rem 1.4rem" }}>
          <p
            style={{
              fontSize: "0.84rem",
              color: t.ink50,
              marginBottom: "1rem",
              lineHeight: 1.6,
            }}
          >
            Scanning <strong style={{ color: t.ink }}>{site.domain}</strong> —
            up to {maxPages} pages on your{" "}
            <span
              style={{
                color: t.accent,
                fontWeight: 600,
                textTransform: "capitalize",
              }}
            >
              {plan}
            </span>{" "}
            plan.
          </p>

          {/* Mode selector */}
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
                style={{
                  padding: "0.8rem 1rem",
                  borderRadius: 8,
                  cursor: "pointer",
                  border: `1.5px solid ${mode === id ? t.accent : t.ink08}`,
                  background: mode === id ? t.accentBg : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.15rem",
                  }}
                >
                  <Icon
                    size={15}
                    color={mode === id ? t.accent : t.ink50}
                    strokeWidth={1.8}
                  />
                  <span
                    style={{
                      fontSize: "0.86rem",
                      fontWeight: 600,
                      color: mode === id ? t.accent : t.ink,
                    }}
                  >
                    {label}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "0.74rem",
                    color: t.ink50,
                    margin: 0,
                    paddingLeft: "1.55rem",
                  }}
                >
                  {desc}
                </p>
              </div>
            ))}
          </div>

          {/* Manual URL input */}
          {mode === "manual" && (
            <div style={{ marginBottom: "1rem" }}>
              <label
                style={{
                  display: "block",
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.3rem",
                }}
              >
                URLs to scan (one per line, max {maxPages})
              </label>
              <textarea
                value={manualUrls}
                onChange={(e) => setManualUrls(e.target.value)}
                placeholder={`https://${site.domain}/\nhttps://${site.domain}/about\nhttps://${site.domain}/contact`}
                rows={5}
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem",
                  borderRadius: 8,
                  border: `1.5px solid ${t.ink20}`,
                  background: t.paper,
                  color: t.ink,
                  fontFamily: "var(--mono)",
                  fontSize: "0.76rem",
                  lineHeight: 1.7,
                  outline: "none",
                  resize: "vertical",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e) => (e.target.style.borderColor = t.ink20)}
              />
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  marginTop: "0.2rem",
                }}
              >
                {manualUrls.split("\n").filter((u) => u.trim()).length} /{" "}
                {maxPages} URLs
              </div>
            </div>
          )}

          {/* Info box */}
          <div
            style={{
              padding: "0.7rem 0.9rem",
              borderRadius: 8,
              background: t.ink04,
              fontSize: "0.76rem",
              color: t.ink50,
              lineHeight: 1.6,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <FileText
              size={14}
              color={t.ink50}
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <span>
              {mode === "auto"
                ? "We'll try your sitemap.xml first. If not found, we'll follow internal links from your homepage."
                : "Each URL will be loaded in a real browser and scanned with axe-core against WCAG 2.2."}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={handleScan}
              disabled={scanning || (mode === "manual" && !manualUrls.trim())}
              style={{
                flex: 1,
                padding: "0.65rem",
                borderRadius: 8,
                border: "none",
                background: t.accent,
                color: "white",
                fontFamily: "var(--body)",
                fontSize: "0.88rem",
                fontWeight: 600,
                cursor: scanning ? "not-allowed" : "pointer",
                opacity:
                  scanning || (mode === "manual" && !manualUrls.trim())
                    ? 0.5
                    : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
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

      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
