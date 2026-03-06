import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { Copy, Check } from "lucide-react";
import "../../styles/dashboard.css";

const STYLES = [
  { value: "flat", label: "Flat" },
  { value: "plastic", label: "Plastic" },
  { value: "minimal", label: "Minimal" },
];

export default function BadgeEmbed({ site }) {
  const [style, setStyle] = useState("flat");
  const [label, setLabel] = useState("accessibility");
  const [format, setFormat] = useState("markdown");
  const [copied, setCopied] = useState(false);

  const supabaseUrl =
    supabase.supabaseUrl || supabase.restUrl?.replace("/rest/v1", "") || "";

  const badgeUrl = `${supabaseUrl}/functions/v1/badge?domain=${encodeURIComponent(
    site.domain
  )}&style=${style}&label=${encodeURIComponent(label)}`;
  const siteUrl = `https://${site.domain}`;

  const embedCodes = {
    markdown: `[![${label}](${badgeUrl})](${siteUrl})`,
    html: `<a href="${siteUrl}"><img src="${badgeUrl}" alt="${label}" /></a>`,
    rst: `.. image:: ${badgeUrl}\n   :target: ${siteUrl}\n   :alt: ${label}`,
    url: badgeUrl,
  };

  const code = embedCodes[format];

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="dash-card"
      style={{ marginBottom: "1rem", padding: "1.3rem" }}
    >
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          color: "var(--ink)",
          marginBottom: "0.8rem",
        }}
      >
        Score badge
      </div>

      {/* Live preview */}
      <div
        style={{
          padding: "1rem",
          borderRadius: 8,
          background: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "1rem",
          minHeight: 44,
        }}
      >
        <img
          src={badgeUrl}
          alt={`${label} badge preview`}
          style={{ display: "block" }}
          key={`${style}-${label}`}
        />
      </div>

      {/* Style + label controls */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          marginBottom: "0.8rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="dash-small-label">Style</div>
          <div style={{ display: "flex", gap: "0.2rem" }}>
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                className={
                  "dash-toggle-btn" +
                  (style === s.value ? " dash-toggle-btn--active" : "")
                }
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 120 }}>
          <div className="dash-small-label">Label</div>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="accessibility"
            className="auth-input"
            style={{
              padding: "0.3rem 0.5rem",
              fontSize: "0.74rem",
              fontFamily: "var(--mono)",
            }}
          />
        </div>
      </div>

      {/* Format tabs */}
      <div style={{ display: "flex", gap: "0.15rem", marginBottom: "0.4rem" }}>
        {["markdown", "html", "rst", "url"].map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            className={
              "dash-tab-btn" + (format === f ? " dash-tab-btn--active" : "")
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Embed code */}
      <div style={{ position: "relative" }}>
        <pre className="dash-code-block">{code}</pre>
        <button onClick={handleCopy} className="dash-code-copy">
          {copied ? (
            <>
              <Check size={11} color="#34d399" /> copied
            </>
          ) : (
            <>
              <Copy size={11} /> copy
            </>
          )}
        </button>
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          fontSize: "0.68rem",
          color: "var(--ink50)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        Badge updates automatically when your score changes. Cached for 5
        minutes.
      </div>
    </div>
  );
}
