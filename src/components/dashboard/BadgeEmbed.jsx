import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { Copy, Check } from "lucide-react";

const STYLES = [
  { value: "flat", label: "Flat" },
  { value: "plastic", label: "Plastic" },
  { value: "minimal", label: "Minimal" },
];

export default function BadgeEmbed({ site }) {
  const { t } = useTheme();
  const [style, setStyle] = useState("flat");
  const [label, setLabel] = useState("accessibility");
  const [format, setFormat] = useState("markdown");
  const [copied, setCopied] = useState(false);

  // Pull the Supabase URL from the client — no hardcoding needed
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
      style={{
        padding: "1.3rem",
        borderRadius: 10,
        border: `1px solid ${t.ink08}`,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          color: t.ink,
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
          background: t.paper,
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
        {/* Style selector */}
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.25rem",
            }}
          >
            Style
          </div>
          <div style={{ display: "flex", gap: "0.2rem" }}>
            {STYLES.map((s) => (
              <button
                key={s.value}
                onClick={() => setStyle(s.value)}
                style={{
                  padding: "0.25rem 0.5rem",
                  borderRadius: 5,
                  fontSize: "0.72rem",
                  fontFamily: "var(--mono)",
                  cursor: "pointer",
                  border: `1px solid ${style === s.value ? t.accent : t.ink08}`,
                  background: style === s.value ? t.accentBg : "transparent",
                  color: style === s.value ? t.accent : t.ink50,
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Label input */}
        <div style={{ flex: 1, minWidth: 120 }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.25rem",
            }}
          >
            Label
          </div>
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="accessibility"
            style={{
              width: "100%",
              padding: "0.3rem 0.5rem",
              borderRadius: 5,
              border: `1px solid ${t.ink20}`,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.74rem",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => (e.target.style.borderColor = t.accent)}
            onBlur={(e) => (e.target.style.borderColor = t.ink20)}
          />
        </div>
      </div>

      {/* Format tabs */}
      <div style={{ display: "flex", gap: "0.15rem", marginBottom: "0.4rem" }}>
        {["markdown", "html", "rst", "url"].map((f) => (
          <button
            key={f}
            onClick={() => setFormat(f)}
            style={{
              padding: "0.2rem 0.5rem",
              borderRadius: 4,
              fontSize: "0.65rem",
              fontFamily: "var(--mono)",
              textTransform: "uppercase",
              cursor: "pointer",
              border: "none",
              background: format === f ? t.ink : t.ink04,
              color: format === f ? t.paper : t.ink50,
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Embed code */}
      <div style={{ position: "relative" }}>
        <pre
          style={{
            padding: "0.7rem 0.8rem",
            borderRadius: 6,
            background: t.codeBg,
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            color: "#a3a3a3",
            overflowX: "auto",
            whiteSpace: "pre-wrap",
            wordBreak: "break-all",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {code}
        </pre>
        <button
          onClick={handleCopy}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            background: "rgba(255,255,255,0.08)",
            border: "none",
            borderRadius: 4,
            padding: "0.25rem 0.4rem",
            cursor: "pointer",
            color: "#999",
            display: "flex",
            alignItems: "center",
            gap: "0.2rem",
            fontSize: "0.6rem",
            fontFamily: "var(--mono)",
          }}
        >
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
          color: t.ink50,
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
