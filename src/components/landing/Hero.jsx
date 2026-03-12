import { useState, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import CodeCard from "./CodeCard";
import "./Hero.css";
import XsblBull from "./XsblBull";
import {
  Lock,
  Sparkles,
  Mail,
  Check,
  Loader2,
  Copy,
  RotateCcw,
} from "lucide-react";

/**
 * Generate realistic-looking code fix previews from scan issues.
 * Maps common axe rule patterns to plausible code diffs.
 */
var FIX_SNIPPETS = [
  {
    match: /alt/i,
    label: "Add descriptive alt text",
    before: '<img src="/hero.jpg" />',
    after:
      '<img src="/hero.jpg"\n     alt="Team collaborating at a whiteboard" />',
  },
  {
    match: /contrast/i,
    label: "Fix color contrast ratio",
    before: '<p style="color: #aaa;">Status: Active</p>',
    after:
      '<p style="color: #595959;">Status: Active</p>\n{/* contrast 4.56:1 → WCAG AA ✓ */}',
  },
  {
    match: /label|form/i,
    label: "Associate label with input",
    before: '<input type="email" placeholder="Email" />',
    after:
      '<label for="email">Email address</label>\n<input id="email" type="email"\n       placeholder="Email" />',
  },
  {
    match: /heading|h[1-6]/i,
    label: "Fix heading hierarchy",
    before: "<h4>Our Services</h4>",
    after: "<h2>Our Services</h2>\n{/* h4 → h2: maintain sequential order */}",
  },
  {
    match: /button|click|interactive/i,
    label: "Use semantic button element",
    before: "<div onClick={handleSubmit}>Submit</div>",
    after:
      '<button onClick={handleSubmit}\n  aria-label="Submit form">\n  Submit\n</button>',
  },
  {
    match: /aria|role|landmark/i,
    label: "Add ARIA landmark role",
    before: '<div class="sidebar">...</div>',
    after:
      '<nav aria-label="Secondary navigation"\n     class="sidebar">...</nav>',
  },
  {
    match: /link|anchor/i,
    label: "Add descriptive link text",
    before: '<a href="/pricing">Click here</a>',
    after: '<a href="/pricing">View pricing plans</a>',
  },
  {
    match: /keyboard|focus|tab/i,
    label: "Make element keyboard-accessible",
    before: '<div class="card" onClick={open}>...</div>',
    after:
      '<div class="card" onClick={open}\n     tabIndex={0} role="button"\n     onKeyDown={handleEnter}>...</div>',
  },
];

var FALLBACK_SNIPPETS = [
  {
    label: "Add missing alt attribute",
    before: '<img src="/product.png" />',
    after: '<img src="/product.png"\n     alt="Product dashboard overview" />',
  },
  {
    label: "Improve color contrast",
    before: '<span style="color: #bbb;">In stock</span>',
    after:
      '<span style="color: #595959;">In stock</span>\n{/* 4.56:1 ratio → AA ✓ */}',
  },
];

function getFixPreviews(issues) {
  if (!issues || issues.length === 0) return FALLBACK_SNIPPETS.slice(0, 2);

  var used = new Set();
  var previews = [];

  for (var i = 0; i < issues.length && previews.length < 2; i++) {
    var desc = issues[i].description || "";
    for (var s = 0; s < FIX_SNIPPETS.length; s++) {
      if (used.has(s)) continue;
      if (FIX_SNIPPETS[s].match.test(desc)) {
        used.add(s);
        previews.push(FIX_SNIPPETS[s]);
        break;
      }
    }
  }

  // Fill remaining slots with fallbacks
  var fi = 0;
  while (previews.length < 2 && fi < FALLBACK_SNIPPETS.length) {
    previews.push(FALLBACK_SNIPPETS[fi]);
    fi++;
  }

  return previews;
}

export default function Hero() {
  const { t } = useTheme();
  const [url, setUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadSending, setLeadSending] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [quickCopied, setQuickCopied] = useState(false);
  const scanInputRef = useRef(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  var EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  var handleScanAnother = function () {
    setUrl("");
    setResult(null);
    setError(null);
    setLeadEmail("");
    setLeadSent(false);
    setQuickCopied(false);
    if (scanInputRef.current) {
      scanInputRef.current.focus();
      scanInputRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };

  var handleCopyQuickScore = function () {
    if (!result) return;
    var siteUrl = url || result.page_info?.title || "Site";
    var score = result.score != null ? Math.round(result.score) : "N/A";
    var parts = [siteUrl + " — Accessibility: " + score + "/100 (WCAG 2.2 AA)"];
    var impact = result.impact || {};
    var issueParts = [];
    if (impact.critical) issueParts.push(impact.critical + " critical");
    if (impact.serious) issueParts.push(impact.serious + " serious");
    if (issueParts.length > 0) {
      parts.push(
        (result.issues_found || 0) + " issues (" + issueParts.join(", ") + ")"
      );
    } else {
      parts.push((result.issues_found || 0) + " issues");
    }
    parts.push("Scanned with xsbl.io");
    navigator.clipboard.writeText(parts.join(" — ")).then(function () {
      setQuickCopied(true);
      setTimeout(function () {
        setQuickCopied(false);
      }, 2000);
    });
  };

  var handleEmailSubmit = async function () {
    if (!leadEmail.trim() || !EMAIL_REGEX.test(leadEmail.trim())) return;
    setLeadSending(true);
    try {
      await fetch(supabaseUrl + "/functions/v1/capture-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail.trim(),
          url: url,
          score: result?.score,
          issues_found: result?.issues_found,
          token: result?.token,
          impact: result?.impact,
          top_issues: result?.top_issues,
          page_info: result?.page_info,
          source: "quick-scan",
        }),
      });
    } catch (e) {
      // Silently ignore — we still show success since the primary CTA is signup
    }
    setLeadSent(true);
    setLeadSending(false);
  };

  var URL_REGEX =
    /^https?:\/\/[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+([\/\w\-.~:?#[\]@!$&'()*+,;=%]*)?$/;

  const handleScan = async (e) => {
    e.preventDefault();
    var trimmed = url.trim();
    if (!trimmed) return;

    // Auto-prepend https:// if missing protocol
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = "https://" + trimmed;
      setUrl(trimmed);
    }

    if (!URL_REGEX.test(trimmed)) {
      setError("Please enter a valid URL (e.g. https://example.com)");
      return;
    }

    setScanning(true);
    setError(null);
    setResult(null);
    setLeadEmail("");
    setLeadSent(false);
    setQuickCopied(false);

    try {
      // Quick reachability check — catches DNS failures client-side
      // (uses HEAD to the target URL via no-cors to detect network errors)
      try {
        var reachController = new AbortController();
        var reachTimeout = setTimeout(function () {
          reachController.abort();
        }, 6000);
        await fetch(trimmed, {
          method: "HEAD",
          mode: "no-cors",
          signal: reachController.signal,
        });
        clearTimeout(reachTimeout);
      } catch (reachErr) {
        // Network error likely means DNS failure or site is down
        var errStr = String(reachErr);
        if (
          errStr.indexOf("TypeError") !== -1 ||
          errStr.indexOf("Failed to fetch") !== -1 ||
          errStr.indexOf("NetworkError") !== -1 ||
          errStr.indexOf("AbortError") !== -1 ||
          errStr.indexOf("TimeoutError") !== -1
        ) {
          throw new Error(
            "Could not reach this website. Check that the URL is correct and the site is online."
          );
        }
        // Other errors (e.g. CORS blocking the response) are fine — it means the site exists
      }

      const res = await fetch(`${supabaseUrl}/functions/v1/quick-scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Scan failed (${res.status})`);
      }

      const data = await res.json();

      // Check for explicit errors from the backend
      if (data.error) {
        var errorMsg = data.error;
        if (data.advice && data.advice !== errorMsg) {
          errorMsg += " " + data.advice;
        }
        throw new Error(errorMsg);
      }

      // Validate the response has real scan data
      if (
        data.score == null &&
        (!data.impact ||
          (!data.impact.critical &&
            !data.impact.serious &&
            !data.impact.moderate &&
            !data.impact.minor))
      ) {
        throw new Error(
          "Could not scan this website. The site may be unreachable, behind a firewall, or returning an error."
        );
      }

      // Check for suspiciously empty scans (site returned blank/error page)
      if (
        data.page_info &&
        data.page_info.bodyLength != null &&
        data.page_info.bodyLength < 50 &&
        data.page_info.elementCount != null &&
        data.page_info.elementCount < 10
      ) {
        throw new Error(
          "This page appears to be empty or unreachable. Check the URL and make sure the site is live."
        );
      }

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
              ref={scanInputRef}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://your-site.com"
              disabled={scanning}
              className="hero__input"
              aria-label="Website URL to scan"
              onKeyDown={(e) => e.key === "Enter" && handleScan(e)}
            />
            <button
              onClick={handleScan}
              disabled={scanning}
              className="hero__scan-btn"
            >
              {scanning && <span className="hero__spinner" />}
              {scanning ? "Scanning" : "Scan free"}
            </button>
          </div>
        </FadeIn>

        {/* Live region for scan results — announced to screen readers */}
        <div aria-live="polite" aria-atomic="false">
          {/* Error */}
          {error && (
            <FadeIn>
              <div className="hero__error" role="alert">
                {error}
              </div>
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
                    <button
                      onClick={handleCopyQuickScore}
                      title={quickCopied ? "Copied!" : "Copy score summary"}
                      aria-label={
                        quickCopied
                          ? "Copied to clipboard"
                          : "Copy score summary"
                      }
                      className="hero__copy-btn"
                    >
                      {quickCopied ? (
                        <Check size={12} strokeWidth={2.5} />
                      ) : (
                        <Copy size={12} strokeWidth={2} />
                      )}
                    </button>
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

                {/* Blurred fix previews teaser */}
                <div className="hero__fixes-teaser">
                  <div className="hero__fixes-label">
                    <Sparkles size={12} strokeWidth={2} color={t.accent} />
                    AI-generated fixes for your site
                  </div>

                  <div className="hero__fixes-preview">
                    {getFixPreviews(result.top_issues).map(function (fix, i) {
                      return (
                        <div key={i} className="hero__fix-card">
                          <div className="hero__fix-card-label">
                            {fix.label}
                          </div>
                          <div
                            className="hero__fix-card-code"
                            aria-hidden="true"
                          >
                            <div className="hero__fix-line hero__fix-line--del">
                              {fix.before}
                            </div>
                            <div className="hero__fix-line hero__fix-line--add">
                              {fix.after}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Blur overlay */}
                    <div className="hero__fixes-overlay">
                      <Lock size={16} strokeWidth={2.5} />
                      <span>
                        {(result.impact?.critical || 0) +
                          (result.impact?.serious || 0) +
                          (result.impact?.moderate || 0) +
                          (result.impact?.minor || 0)}{" "}
                        fixes available
                      </span>
                    </div>
                  </div>

                  <a href="/signup" className="hero__result-cta">
                    Sign up free to unlock all fixes
                  </a>

                  {/* Email capture — lower friction alternative */}
                  <div className="hero__email-capture">
                    {leadSent ? (
                      <div className="hero__email-sent">
                        <Check size={14} strokeWidth={2.5} />
                        We'll email your full report shortly.
                      </div>
                    ) : (
                      <>
                        <div className="hero__email-divider">
                          <span className="hero__email-divider-line" />
                          <span className="hero__email-divider-text">
                            or get the full report by email
                          </span>
                          <span className="hero__email-divider-line" />
                        </div>
                        <div className="hero__email-row">
                          <Mail
                            size={14}
                            strokeWidth={2}
                            color={t.ink50}
                            style={{
                              position: "absolute",
                              left: 10,
                              top: "50%",
                              transform: "translateY(-50%)",
                              pointerEvents: "none",
                            }}
                          />
                          <input
                            type="email"
                            value={leadEmail}
                            onChange={function (e) {
                              setLeadEmail(e.target.value);
                            }}
                            placeholder="you@company.com"
                            className="hero__email-input"
                            aria-label="Email address for report"
                            onKeyDown={function (e) {
                              if (e.key === "Enter") handleEmailSubmit();
                            }}
                          />
                          <button
                            onClick={handleEmailSubmit}
                            disabled={
                              leadSending ||
                              !leadEmail.trim() ||
                              !EMAIL_REGEX.test(leadEmail.trim())
                            }
                            className="hero__email-btn"
                          >
                            {leadSending ? (
                              <Loader2 size={13} className="hero__spinner" />
                            ) : (
                              "Send"
                            )}
                          </button>
                        </div>
                        <p className="hero__email-note">
                          No spam. Just your accessibility report.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Scan another site */}
                  <button
                    onClick={handleScanAnother}
                    className="hero__scan-another"
                  >
                    <RotateCcw size={12} strokeWidth={2} />
                    Scan another site
                  </button>
                </div>
              </div>
            </FadeIn>
          )}
        </div>
        {/* end aria-live region */}

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
