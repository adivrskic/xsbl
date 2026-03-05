import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import CodeCard from "./CodeCard";

export default function Hero() {
  const { t } = useTheme();
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  const handleScan = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/quick-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    }
    setScanning(false);
  };

  return (
    <section
      className="hero-layout"
      style={{
        padding: "10rem clamp(1.5rem, 3vw, 3rem) 6rem",
        maxWidth: 1200,
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "4rem",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <div style={{ maxWidth: 540 }}>
        <FadeIn>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: t.accent,
              fontWeight: 600,
              marginBottom: "1.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span style={{ width: 24, height: 1.5, background: t.accent }} />
            Accessibility scanning
          </div>
        </FadeIn>

        <FadeIn delay={0.07}>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(2.5rem, 4.5vw, 3.8rem)",
              lineHeight: 1.12,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
              color: t.ink,
            }}
          >
            No Bull. Make it{" "}
            <span
              style={{ fontWeight: 400, fontStyle: "italic", color: t.accent }}
            >
              xsbl.
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.14}>
          <p
            style={{
              fontSize: "1.08rem",
              color: t.ink50,
              lineHeight: 1.75,
              marginBottom: "2rem",
              maxWidth: 440,
              fontWeight: 400,
            }}
          >
            xsbl scans your site in a real browser, finds WCAG&nbsp;2.2
            violations, and opens pull requests with the fixes. No overlays. No
            runtime scripts. No bull — just accessible code.
          </p>
        </FadeIn>

        {/* URL scan input */}
        <FadeIn delay={0.2}>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: result ? "1rem" : "2rem",
            }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              disabled={scanning}
              style={{
                flex: 1,
                padding: "0.72rem 1rem",
                borderRadius: 8,
                border: `1.5px solid ${t.ink20}`,
                background: t.cardBg,
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.9rem",
                outline: "none",
                transition: "border-color 0.2s",
                minWidth: 0,
                opacity: scanning ? 0.6 : 1,
              }}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.ink20)}
              onKeyDown={(e) => e.key === "Enter" && handleScan(e)}
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              style={{
                background: t.accent,
                color: "white",
                border: "none",
                fontFamily: "var(--body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                padding: "0.72rem 1.4rem",
                borderRadius: 8,
                cursor: scanning ? "not-allowed" : "pointer",
                transition: "all 0.25s",
                whiteSpace: "nowrap",
                flexShrink: 0,
                opacity: scanning ? 0.7 : 1,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {scanning && (
                <span
                  style={{
                    width: 14,
                    height: 14,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "xsbl-spin 0.6s linear infinite",
                    flexShrink: 0,
                  }}
                />
              )}
              {scanning ? "Scanning" : "Scan free "}
            </button>
          </div>
          <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
        </FadeIn>

        {/* Error */}
        {error && (
          <FadeIn>
            <div
              style={{
                padding: "0.7rem 1rem",
                borderRadius: 8,
                marginBottom: "1.5rem",
                background: `${t.red}08`,
                border: `1px solid ${t.red}20`,
                color: t.red,
                fontSize: "0.82rem",
              }}
            >
              {error}
            </div>
          </FadeIn>
        )}

        {/* Quick scan results */}
        {result && (
          <FadeIn>
            <div
              style={{
                padding: "1.2rem",
                borderRadius: 12,
                marginBottom: "1.5rem",
                background: t.cardBg,
                border: `1px solid ${t.ink08}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.8rem",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    color: t.ink50,
                  }}
                >
                  {result.page_info?.title || result.title || result.url}
                </div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color:
                      result.score >= 80
                        ? t.green
                        : result.score >= 50
                        ? t.amber
                        : t.red,
                  }}
                >
                  {Math.round(result.score)}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "0.4rem",
                  marginBottom: "0.8rem",
                }}
              >
                {[
                  {
                    label: "Critical",
                    count: result.impact?.critical || 0,
                    color: t.red,
                  },
                  {
                    label: "Serious",
                    count: result.impact?.serious || 0,
                    color: t.red,
                  },
                  {
                    label: "Moderate",
                    count: result.impact?.moderate || 0,
                    color: t.amber,
                  },
                  {
                    label: "Minor",
                    count: result.impact?.minor || 0,
                    color: t.accent,
                  },
                ].map(({ label, count, color }) => (
                  <div
                    key={label}
                    style={{
                      textAlign: "center",
                      padding: "0.4rem",
                      borderRadius: 6,
                      background: t.ink04,
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "var(--serif)",
                        fontSize: "1.1rem",
                        fontWeight: 700,
                        color,
                      }}
                    >
                      {count}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.55rem",
                        color: t.ink50,
                        textTransform: "uppercase",
                      }}
                    >
                      {label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Top issues preview */}
              {result.top_issues?.slice(0, 3).map((issue, i) => (
                <div
                  key={i}
                  style={{
                    padding: "0.5rem 0",
                    fontSize: "0.78rem",
                    color: t.ink50,
                    borderTop: i > 0 ? `1px solid ${t.ink04}` : "none",
                    lineHeight: 1.5,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.4rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.55rem",
                      fontWeight: 600,
                      padding: "0.1rem 0.3rem",
                      borderRadius: 3,
                      flexShrink: 0,
                      marginTop: "0.15rem",
                      background:
                        issue.impact === "critical" ||
                        issue.impact === "serious"
                          ? `${t.red}12`
                          : `${t.amber}12`,
                      color:
                        issue.impact === "critical" ||
                        issue.impact === "serious"
                          ? t.red
                          : t.amber,
                      textTransform: "uppercase",
                    }}
                  >
                    {issue.impact}
                  </span>
                  <span>{issue.description}</span>
                </div>
              ))}

              <a
                href="/signup"
                style={{
                  display: "block",
                  textAlign: "center",
                  marginTop: "0.8rem",
                  padding: "0.55rem",
                  borderRadius: 8,
                  background: t.accent,
                  color: "white",
                  fontFamily: "var(--body)",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Sign up to see full report & fixes →
              </a>
            </div>
          </FadeIn>
        )}

        {/* Trust badges */}
        {!result && (
          <FadeIn delay={0.26}>
            <div
              style={{
                fontSize: "0.79rem",
                color: t.ink50,
                display: "flex",
                alignItems: "center",
                gap: "1.3rem",
                flexWrap: "wrap",
              }}
            >
              <span>No signup required</span>
              <span style={{ width: 1, height: 14, background: t.ink20 }} />
              <span>WCAG 2.2 AA + AAA</span>
              <span style={{ width: 1, height: 14, background: t.ink20 }} />
              <span>Auto GitHub PRs</span>
            </div>
          </FadeIn>
        )}
      </div>

      <FadeIn delay={0.2}>
        <CodeCard />
      </FadeIn>
    </section>
  );
}
