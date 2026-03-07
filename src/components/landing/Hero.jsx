import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import CodeCard from "./CodeCard";
import "./Hero.css";
import XsblBull from "./XsblBull";

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
    <section className="hero-layout hero">
      <div className="hero__content">
        <FadeIn>
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-line" />
            Accessibility scanning
          </div>
        </FadeIn>

        <FadeIn delay={0.07}>
          <h1 className="hero__title">
            No Bull. Make it{" "}
            <span className="italic-accent">
              xsbl.
              <XsblBull size={84} />
            </span>
          </h1>
        </FadeIn>

        <FadeIn delay={0.14}>
          <p className="hero__subtitle">
            xsbl scans your site in a real browser, finds WCAG&nbsp;2.2
            violations, and opens pull requests with the fixes. No overlays. No
            runtime scripts. No bull — just accessible code.
          </p>
        </FadeIn>

        {/* URL scan input */}
        <FadeIn delay={0.2}>
          <div
            className="hero__scan-row"
            style={{ marginBottom: result ? "1rem" : "2rem" }}
          >
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              disabled={scanning}
              className="hero__input"
              onKeyDown={(e) => e.key === "Enter" && handleScan(e)}
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              className="hero__scan-btn"
            >
              {scanning && <span className="hero__spinner" />}
              {scanning ? "Scanning\u2026" : "Scan free"}
            </button>
          </div>
        </FadeIn>

        {/* Error */}
        {error && (
          <FadeIn>
            <div className="hero__error">{error}</div>
          </FadeIn>
        )}

        {/* Quick scan results */}
        {result && (
          <FadeIn>
            <div className="hero__result">
              <div className="hero__result-header">
                <div className="hero__result-title">
                  {result.page_info?.title || result.title || result.url}
                </div>
                <div
                  className="hero__result-score"
                  style={{
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

              <div className="hero__result-impacts">
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
                  <div key={label} className="hero__result-impact">
                    <div
                      className="hero__result-impact-count"
                      style={{ color }}
                    >
                      {count}
                    </div>
                    <div className="hero__result-impact-label">{label}</div>
                  </div>
                ))}
              </div>

              {/* Top issues preview */}
              {result.top_issues?.slice(0, 3).map((issue, i) => (
                <div key={i} className="hero__result-issue">
                  <span
                    className="hero__result-issue-badge"
                    style={{
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
                    }}
                  >
                    {issue.impact}
                  </span>
                  <span>{issue.description}</span>
                </div>
              ))}

              <a href="/signup" className="hero__result-cta">
                Sign up to see full report & fixes →
              </a>
            </div>
          </FadeIn>
        )}

        {/* Trust badges */}
        {!result && (
          <FadeIn delay={0.26}>
            <div className="hero__trust">
              <span>No signup required</span>
              <span className="hero__pipe" />
              <span>WCAG 2.2 AA + AAA</span>
              <span className="hero__pipe" />
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
