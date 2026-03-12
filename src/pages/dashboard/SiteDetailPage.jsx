import { useState, useEffect, useCallback, useRef } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { logAudit } from "../../lib/audit";
import {
  useKeyboardShortcuts,
  ShortcutHelpOverlay,
} from "../../components/ui/KeyboardShortcuts";
import {
  AlertTriangle,
  Play,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Filter,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
  HelpCircle,
  X,
  Lightbulb,
  FileText,
} from "lucide-react";
import IssueDetailModal from "../../components/dashboard/IssueDetailModal";
import ScoreChart from "../../components/dashboard/ScoreChart";
import PageBreakdown from "../../components/dashboard/PageBreakdown";
import ScanConfigModal from "../../components/dashboard/ScanConfigModal";
import BulkFixBar from "../../components/dashboard/BulkFixBar";
import ReportButton from "../../components/dashboard/ReportButton";
import AccessibilitySimulator from "../../components/dashboard/AccessibilitySimulator";
import GitHubConnect from "../../components/dashboard/GithubConnect";
import SchedulePicker from "../../components/dashboard/SchedulePicker";
import ScanProfileEditor from "../../components/dashboard/ScanProfileEditor";
import PlanGate from "../../components/ui/PlanGate";
import CIWorkflowPanel from "../../components/dashboard/CIWorkflowPanel";
import ScanCompare from "../../components/dashboard/ScanCompare";
import AccessibilityStatementGenerator from "../../components/dashboard/AccessibilityStatementGenerator";
import { timeAgo, fullDate } from "../../lib/timeAgo";

/* ── GitHub icon (no lucide brand icons) ── */
/* ── CSV Export ── */
function exportIssuesToCSV(issues, siteName) {
  var headers = [
    "Rule ID",
    "Impact",
    "Status",
    "Description",
    "Page URL",
    "Element Selector",
    "Element HTML",
    "WCAG Tags",
    "Fix Suggestion",
  ];
  var rows = issues.map(function (iss) {
    return [
      iss.rule_id || "",
      iss.impact || "",
      iss.status || "",
      (iss.description || "").replace(/"/g, '""'),
      iss.page_url || "",
      (iss.element_selector || "").replace(/"/g, '""'),
      (iss.element_html || "").replace(/"/g, '""').substring(0, 500),
      (iss.wcag_tags || []).join("; "),
      (iss.fix_suggestion || "").replace(/"/g, '""').substring(0, 300),
    ]
      .map(function (cell) {
        return '"' + cell + '"';
      })
      .join(",");
  });
  var csv = headers.join(",") + "\n" + rows.join("\n");
  var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = (siteName || "issues") + "-accessibility-issues.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function GitHubIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/* ── Verification Token with show/hide ── */
function VerificationTokenPanel({ site }) {
  const { t } = useTheme();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  var token = site.verification_token || "";
  var masked = token.substring(0, 8) + "••••••••••";

  var handleCopy = function () {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: t.ink,
          marginBottom: "0.4rem",
        }}
      >
        Verification token
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <code
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: t.accent,
            flex: 1,
          }}
        >
          {show ? token : masked}
        </code>
        <button
          onClick={function () {
            setShow(!show);
          }}
          style={{
            background: "none",
            border: "1px solid " + t.ink20,
            borderRadius: 5,
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: t.ink50,
          }}
        >
          {show ? "Hide" : "Show"}
        </button>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "1px solid " + t.ink20,
            borderRadius: 5,
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: copied ? t.green : t.ink50,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Impact badge ── */
function ImpactBadge({ impact }) {
  const { t } = useTheme();
  const colors = {
    critical: { bg: `${t.red}15`, text: t.red },
    serious: { bg: `${t.red}10`, text: t.red },
    moderate: { bg: `${t.amber}12`, text: t.amber },
    minor: { bg: t.accentBg, text: t.accent },
  };
  const c = colors[impact] || colors.minor;
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.6rem",
        fontWeight: 600,
        padding: "0.15rem 0.4rem",
        borderRadius: 3,
        background: c.bg,
        color: c.text,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        width: 62,
        textAlign: "center",
        flexShrink: 0,
        display: "inline-block",
        boxSizing: "border-box",
      }}
    >
      {impact}
    </span>
  );
}

function FixBadge({ count, total }) {
  const { t } = useTheme();
  if (!count) return null;
  var label = count === total ? "fix" : count + "/" + total + " fix";
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.55rem",
        fontWeight: 600,
        padding: "0.12rem 0.35rem",
        borderRadius: 3,
        background: t.greenBg,
        color: t.green,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        gap: "0.2rem",
        whiteSpace: "nowrap",
      }}
    >
      <Lightbulb size={9} strokeWidth={2.5} />
      {label}
    </span>
  );
}

/* ── Verify panel ── */
function VerifyPanel({ site, onVerified }) {
  const { t } = useTheme();
  const { session } = useAuth();
  const [method, setMethod] = useState("meta_tag");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const tk = site.verification_token;
  const snippets = {
    meta_tag: `<meta name="xsbl-verification" content="${tk}" />`,
    dns_txt: `xsbl-verification=${tk}`,
    well_known: tk,
  };
  const hints = {
    meta_tag: "Add this meta tag to your site\u2019s <head>:",
    dns_txt: "Add a TXT record to your domain\u2019s DNS:",
    well_known: `Create https://${site.domain}/.well-known/xsbl-verify.txt with:`,
  };
  const tabs = [
    { id: "meta_tag", label: "Meta tag" },
    { id: "dns_txt", label: "DNS" },
    { id: "well_known", label: "File" },
  ];

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("verify-site", {
        body: { site_id: site.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      setResult(data);
      if (data?.verified) {
        onVerified?.(data);
      }
    } catch (err) {
      setResult({ verified: false, error: err.message });
    }
    setVerifying(false);
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: 12,
        border: `1px solid ${t.amber}30`,
        background: `${t.amber}06`,
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <AlertTriangle size={16} color={t.amber} strokeWidth={2} />
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          Verify ownership
        </h2>
      </div>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.84rem",
          marginBottom: "1rem",
          lineHeight: 1.6,
        }}
      >
        Verify to unlock scheduled scans and compliance reports. You can still
        run manual scans without verification.
      </p>
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1rem",
          background: t.ink04,
          padding: "0.25rem",
          borderRadius: 8,
          width: "fit-content",
        }}
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: 6,
              border: "none",
              background: method === id ? t.cardBg : "transparent",
              color: method === id ? t.ink : t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: method === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p style={{ color: t.ink50, fontSize: "0.8rem", marginBottom: "0.5rem" }}>
        {hints[method]}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: t.codeBg,
          padding: "0.7rem 1rem",
          borderRadius: 8,
          marginBottom: "1rem",
        }}
      >
        <code
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            color: t.green,
            flex: 1,
            overflowX: "auto",
            whiteSpace: "pre",
          }}
        >
          {snippets[method]}
        </code>
        <button
          onClick={() => handleCopy(snippets[method])}
          style={{
            background: "none",
            border: `1px solid ${t.ink20}`,
            borderRadius: 6,
            padding: "0.25rem 0.55rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: copied ? t.green : t.ink50,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={verifying}
        style={{
          padding: "0.55rem 1.2rem",
          borderRadius: 8,
          border: "none",
          background: t.accent,
          color: "white",
          fontFamily: "var(--body)",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: verifying ? "not-allowed" : "pointer",
          opacity: verifying ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        {verifying ? (
          <Loader2 size={15} className="xsbl-spin" />
        ) : (
          <Check size={15} />
        )}
        {verifying ? "Checking\u2026" : "Verify now"}
      </button>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "0.8rem",
            padding: "0.7rem 0.9rem",
            borderRadius: 8,
            background: result.verified ? t.greenBg : `${t.red}08`,
            border: `1px solid ${
              result.verified ? `${t.green}20` : `${t.red}20`
            }`,
            fontSize: "0.82rem",
            color: result.verified ? t.green : t.red,
          }}
        >
          {result.verified ? (
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Check size={14} strokeWidth={2.5} /> Verified via{" "}
              {result.method === "meta_tag"
                ? "meta tag"
                : result.method === "dns_txt"
                ? "DNS TXT record"
                : "well-known file"}
              !
            </span>
          ) : (
            <div>
              <div style={{ marginBottom: "0.3rem", fontWeight: 600 }}>
                Verification failed
              </div>
              <div style={{ fontSize: "0.76rem", color: t.ink50 }}>
                We checked all three methods and couldn't find your token. Make
                sure the meta tag, DNS record, or file is live, then try again.
                {result.checks && (
                  <div style={{ marginTop: "0.3rem" }}>
                    {result.checks.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {c.found ? "\u2713" : "\u2717"}{" "}
                        {c.method.replace("_", " ")}
                        {c.error ? ` (${c.error})` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Filter bar ── */
function IssueFilters({ filters, setFilters, issues }) {
  const { t } = useTheme();
  const [open, setOpen] = useState(false);

  const impacts = ["critical", "serious", "moderate", "minor"];
  const statuses = ["open", "fixed", "ignored", "removed", "false_positive"];

  // Collect unique WCAG tags
  const allTags = [...new Set(issues.flatMap((i) => i.wcag_tags || []))].sort();

  const impactCounts = {};
  impacts.forEach((imp) => {
    impactCounts[imp] = issues.filter((i) => i.impact === imp).length;
  });

  const statusCounts = {};
  statuses.forEach((s) => {
    statusCounts[s] = issues.filter((i) => i.status === s).length;
  });

  const toggleFilter = (key, value) => {
    setFilters((prev) => {
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter((v) => v !== value)
          : [...arr, value],
      };
    });
  };

  const activeCount =
    (filters.impact?.length || 0) +
    (filters.status?.length || 0) +
    (filters.wcag?.length || 0) +
    (filters.page?.length || 0);

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: activeCount > 0 ? t.accentBg : t.ink04,
          border: `1px solid ${activeCount > 0 ? t.accent : t.ink08}`,
          borderRadius: 7,
          padding: "0.4rem 0.8rem",
          cursor: "pointer",
          fontFamily: "var(--body)",
          fontSize: "0.78rem",
          fontWeight: 500,
          color: activeCount > 0 ? t.accent : t.ink50,
        }}
      >
        <Filter size={13} strokeWidth={2} />
        Filters {activeCount > 0 && `(${activeCount})`}
        <ChevronDown
          size={13}
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            marginTop: "0.6rem",
            padding: "1rem",
            borderRadius: 10,
            border: `1px solid ${t.ink08}`,
            background: t.cardBg,
          }}
        >
          {/* Impact */}
          <div style={{ marginBottom: "0.8rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.35rem",
              }}
            >
              Impact
            </div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {impacts.map((imp) => {
                const active = filters.impact?.includes(imp);
                return (
                  <button
                    key={imp}
                    onClick={() => toggleFilter("impact", imp)}
                    style={{
                      padding: "0.25rem 0.55rem",
                      borderRadius: 5,
                      fontSize: "0.7rem",
                      fontFamily: "var(--mono)",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${active ? t.accent : t.ink08}`,
                      background: active ? t.accentBg : "transparent",
                      color: active ? t.accent : t.ink50,
                      textTransform: "uppercase",
                    }}
                  >
                    {imp} ({impactCounts[imp]})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status */}
          <div style={{ marginBottom: "0.8rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "0.35rem",
              }}
            >
              Status
            </div>
            <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
              {statuses.map((s) => {
                const active = filters.status?.includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggleFilter("status", s)}
                    style={{
                      padding: "0.25rem 0.55rem",
                      borderRadius: 5,
                      fontSize: "0.7rem",
                      fontFamily: "var(--mono)",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: `1px solid ${active ? t.accent : t.ink08}`,
                      background: active ? t.accentBg : "transparent",
                      color: active ? t.accent : t.ink50,
                    }}
                  >
                    {s.replace("_", " ")} ({statusCounts[s]})
                  </button>
                );
              })}
            </div>
          </div>

          {/* WCAG tags */}
          {allTags.length > 0 && (
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.35rem",
                }}
              >
                WCAG criterion
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "0.25rem",
                  flexWrap: "wrap",
                  maxHeight: 80,
                  overflowY: "auto",
                }}
              >
                {allTags.map((tag) => {
                  const active = filters.wcag?.includes(tag);
                  return (
                    <button
                      key={tag}
                      onClick={() => toggleFilter("wcag", tag)}
                      style={{
                        padding: "0.2rem 0.45rem",
                        borderRadius: 4,
                        fontSize: "0.62rem",
                        fontFamily: "var(--mono)",
                        cursor: "pointer",
                        border: `1px solid ${active ? t.accent : t.ink08}`,
                        background: active ? t.accentBg : "transparent",
                        color: active ? t.accent : t.ink50,
                      }}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeCount > 0 && (
            <button
              onClick={() => setFilters({})}
              style={{
                marginTop: "0.6rem",
                background: "none",
                border: "none",
                padding: 0,
                color: t.red,
                fontSize: "0.72rem",
                fontWeight: 500,
                cursor: "pointer",
                fontFamily: "var(--body)",
              }}
            >
              Clear all filters
            </button>
          )}

          {/* Page URL filter */}
          {(() => {
            const allPages = [
              ...new Set(issues.map((i) => i.page_url).filter(Boolean)),
            ];
            if (allPages.length <= 1) return null;
            return (
              <div style={{ marginTop: "0.8rem" }}>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.35rem",
                  }}
                >
                  Page
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "0.25rem",
                    flexWrap: "wrap",
                    maxHeight: 80,
                    overflowY: "auto",
                  }}
                >
                  {allPages.map((pageUrl) => {
                    const active = filters.page?.includes(pageUrl);
                    let label;
                    try {
                      label = new URL(pageUrl).pathname;
                    } catch {
                      label = pageUrl;
                    }
                    const count = issues.filter(
                      (i) => i.page_url === pageUrl
                    ).length;
                    return (
                      <button
                        key={pageUrl}
                        onClick={() => toggleFilter("page", pageUrl)}
                        style={{
                          padding: "0.2rem 0.45rem",
                          borderRadius: 4,
                          fontSize: "0.62rem",
                          fontFamily: "var(--mono)",
                          cursor: "pointer",
                          border: `1px solid ${active ? t.accent : t.ink08}`,
                          background: active ? t.accentBg : "transparent",
                          color: active ? t.accent : t.ink50,
                          maxWidth: 180,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

function BadgeEmbedPanel({ site }) {
  const { t } = useTheme();
  const [style, setStyle] = useState("flat");
  const [copied, setCopied] = useState(false);

  var supabaseUrl = supabase.supabaseUrl || "";
  var badgeUrl =
    supabaseUrl +
    "/functions/v1/badge?domain=" +
    encodeURIComponent(site.domain) +
    "&style=" +
    style;

  var formats = {
    markdown: "![accessibility](" + badgeUrl + ")",
    html: '<img src="' + badgeUrl + '" alt="Accessibility score" />',
    url: badgeUrl,
  };
  const [fmt, setFmt] = useState("markdown");

  var handleCopy = function () {
    navigator.clipboard.writeText(formats[fmt]);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          color: t.ink,
          marginBottom: "0.5rem",
        }}
      >
        Score Badge
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: t.ink50,
          marginBottom: "0.6rem",
          lineHeight: 1.5,
        }}
      >
        Embed your accessibility score in README, docs, or your website.
      </p>
      {site.score != null && (
        <div style={{ marginBottom: "0.6rem" }}>
          <img
            src={badgeUrl}
            alt="accessibility badge"
            style={{ height: 20 }}
          />
        </div>
      )}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
        {["flat", "plastic", "minimal"].map(function (s) {
          return (
            <button
              key={s}
              onClick={function () {
                setStyle(s);
              }}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 4,
                border: "none",
                background: style === s ? t.accent : t.ink04,
                color: style === s ? "white" : t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
        {["markdown", "html", "url"].map(function (f) {
          return (
            <button
              key={f}
              onClick={function () {
                setFmt(f);
              }}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 4,
                border: "none",
                background: fmt === f ? t.ink08 : "transparent",
                color: fmt === f ? t.ink : t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: t.codeBg,
          padding: "0.5rem 0.7rem",
          borderRadius: 6,
        }}
      >
        <code
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: "#a3a3a3",
            flex: 1,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {formats[fmt]}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "1px solid " + t.ink20,
            borderRadius: 4,
            padding: "0.15rem 0.4rem",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: "0.55rem",
            color: copied ? t.green : t.ink50,
            flexShrink: 0,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Ignore Rules Panel ── */
function IgnoreRulesPanel({ site, onUpdate }) {
  var { t } = useTheme();
  var rules = site.ignore_rules || [];
  var [removing, setRemoving] = useState(null);

  var handleRemove = async function (index) {
    setRemoving(index);
    var updated = rules.filter(function (_, i) {
      return i !== index;
    });
    var { data } = await supabase
      .from("sites")
      .update({ ignore_rules: updated })
      .eq("id", site.id)
      .select()
      .single();
    if (data) onUpdate(data);
    setRemoving(null);
  };

  if (rules.length === 0) return null;

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.5rem",
        }}
      >
        <EyeOff size={15} color={t.amber} strokeWidth={2} />
        <h3
          style={{
            fontSize: "0.92rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          Ignore rules
        </h3>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            fontWeight: 700,
            padding: "0.1rem 0.35rem",
            borderRadius: 4,
            background: t.amber + "15",
            color: t.amber,
          }}
        >
          {rules.length}
        </span>
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: t.ink50,
          margin: "0 0 0.6rem",
          lineHeight: 1.5,
        }}
      >
        These rules are auto-ignored on new scans. Issues matching these
        patterns won't appear as open.
      </p>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        {rules.map(function (rule, i) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.7rem",
                borderRadius: 7,
                border: "1px solid " + t.ink08,
                background: t.paper,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: t.accent,
                }}
              >
                {rule.rule_id}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "0.74rem",
                  color: t.ink50,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {rule.description || ""}
              </span>
              <button
                onClick={function () {
                  handleRemove(i);
                }}
                disabled={removing === i}
                aria-label={"Remove ignore rule for " + rule.rule_id}
                style={{
                  padding: "0.2rem",
                  borderRadius: 4,
                  border: "none",
                  background: "none",
                  color: t.ink50,
                  cursor: "pointer",
                  display: "flex",
                  opacity: removing === i ? 0.3 : 1,
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Danger Zone — working delete ── */
function DangerZonePanel({ site }) {
  const { t } = useTheme();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  var handleDelete = async function () {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    // Delete issues first (cascade might not handle it if FK is loose)
    await supabase.from("issues").delete().eq("site_id", site.id);
    await supabase.from("scans").delete().eq("site_id", site.id);
    await supabase.from("sites").delete().eq("id", site.id);
    logAudit({
      action: "site.deleted",
      resourceType: "site",
      resourceId: site.id,
      description: "Deleted site " + site.domain,
      metadata: { domain: site.domain },
    });
    navigate("/dashboard/sites");
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.red + "20",
        background: t.red + "04",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: t.red,
          marginBottom: "0.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <Trash2 size={14} strokeWidth={2} /> Danger zone
      </div>
      <p
        style={{ fontSize: "0.76rem", color: t.ink50, marginBottom: "0.7rem" }}
      >
        {confirming
          ? "Are you sure? This permanently deletes all scan history and issues for " +
            site.domain +
            "."
          : "Removing deletes all scan history and issues."}
      </p>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: 6,
            border: confirming ? "none" : "1.5px solid " + t.red,
            background: confirming ? t.red : "none",
            color: confirming ? "white" : t.red,
            fontFamily: "var(--body)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.5 : 1,
          }}
        >
          {deleting
            ? "Deleting..."
            : confirming
            ? "Yes, delete permanently"
            : "Remove site"}
        </button>
        {confirming && !deleting && (
          <button
            onClick={function () {
              setConfirming(false);
            }}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: "none",
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Score Explainer Modal ── */
function ScoreExplainerModal({ t, score, issues, scans, onClose }) {
  var latestScan = scans.length > 0 ? scans[0] : null;
  var pages = latestScan?.summary_json?.pages || [];

  // Only count issues from the latest scan, not all historical open issues
  var latestScanId = latestScan ? latestScan.id : null;
  var scanIssues = latestScanId
    ? issues.filter(function (i) {
        return i.scan_id === latestScanId;
      })
    : [];

  // Per-impact breakdown from latest scan only
  var critNodes = 0,
    seriousNodes = 0,
    moderateNodes = 0,
    minorNodes = 0;
  scanIssues.forEach(function (i) {
    if (i.impact === "critical") critNodes++;
    else if (i.impact === "serious") seriousNodes++;
    else if (i.impact === "moderate") moderateNodes++;
    else minorNodes++;
  });
  var totalDeductions =
    critNodes * 4 + seriousNodes * 3 + moderateNodes * 2 + minorNodes * 1;

  var impactRows = [
    {
      label: "Critical",
      count: critNodes,
      weight: 4,
      points: critNodes * 4,
      color: "#c0392b",
    },
    {
      label: "Serious",
      count: seriousNodes,
      weight: 3,
      points: seriousNodes * 3,
      color: "#e67e22",
    },
    {
      label: "Moderate",
      count: moderateNodes,
      weight: 2,
      points: moderateNodes * 2,
      color: "#b45309",
    },
    {
      label: "Minor",
      count: minorNodes,
      weight: 1,
      points: minorNodes * 1,
      color: "#888",
    },
  ];

  // Top rules from latest scan
  var ruleCounts = {};
  scanIssues.forEach(function (i) {
    var key = i.rule_id || "unknown";
    if (!ruleCounts[key])
      ruleCounts[key] = {
        rule: key,
        impact: i.impact,
        count: 0,
        desc: i.description,
      };
    ruleCounts[key].count++;
  });
  var topRules = Object.values(ruleCounts)
    .sort(function (a, b) {
      var order = { critical: 0, serious: 1, moderate: 2, minor: 3 };
      var diff = (order[a.impact] || 3) - (order[b.impact] || 3);
      return diff !== 0 ? diff : b.count - a.count;
    })
    .slice(0, 5);

  var pagesScanned = pages.length;
  var isMultiPage = pagesScanned > 1;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          maxHeight: "85vh",
          borderRadius: 14,
          background: t.cardBg,
          border: "1px solid " + t.ink08,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid " + t.ink08,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <HelpCircle size={18} color={t.accent} strokeWidth={2} />
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.05rem",
                fontWeight: 700,
                color: t.ink,
                margin: 0,
              }}
            >
              How your score is calculated
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.ink50,
              padding: "0.2rem",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.4rem", overflowY: "auto", flex: 1 }}>
          {/* Score display */}
          <div
            style={{
              textAlign: "center",
              padding: "1.2rem",
              borderRadius: 10,
              background: t.ink04,
              marginBottom: "1.2rem",
            }}
          >
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: "2.5rem",
                fontWeight: 700,
                color: score >= 80 ? t.green : score >= 50 ? t.amber : t.red,
              }}
            >
              {Math.round(score)}
            </div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              out of 100
            </div>
          </div>

          {/* Explanation */}
          <p
            style={{
              fontSize: "0.86rem",
              color: t.ink50,
              lineHeight: 1.7,
              marginBottom: "1rem",
            }}
          >
            Each page starts at <strong style={{ color: t.ink }}>100</strong>{" "}
            and loses points for every accessibility violation, weighted by
            severity. Each affected element on the page counts separately.
            {isMultiPage
              ? " Your site score is the average across all " +
                pagesScanned +
                " pages scanned."
              : ""}
          </p>

          {/* Per-page breakdown (if multi-page) */}
          {isMultiPage && (
            <div style={{ marginBottom: "1.2rem" }}>
              <h3
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: t.ink,
                  marginBottom: "0.6rem",
                }}
              >
                Per-page scores (averaged)
              </h3>
              <div
                style={{
                  borderRadius: 8,
                  border: "1px solid " + t.ink08,
                  overflow: "hidden",
                  marginBottom: "0.5rem",
                }}
              >
                {pages.map(function (pg, idx) {
                  var pgScore = pg.score != null ? Math.round(pg.score) : "—";
                  var pgColor =
                    pg.score != null
                      ? pg.score >= 80
                        ? t.green
                        : pg.score >= 50
                        ? t.amber
                        : t.red
                      : t.ink50;
                  var path = "/";
                  try {
                    path = new URL(pg.url).pathname || "/";
                  } catch (e) {
                    path = pg.url;
                  }
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "0.5rem 0.8rem",
                        borderTop: idx > 0 ? "1px solid " + t.ink08 : "none",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.74rem",
                          color: t.ink50,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          marginRight: "0.5rem",
                        }}
                      >
                        {path}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.82rem",
                          fontWeight: 700,
                          color: pgColor,
                          flexShrink: 0,
                        }}
                      >
                        {pgScore}
                      </span>
                    </div>
                  );
                })}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.6rem 0.8rem",
                    borderTop: "1px solid " + t.ink08,
                    background: t.ink04,
                    fontWeight: 700,
                    fontSize: "0.82rem",
                  }}
                >
                  <span>Average</span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      color:
                        score >= 80 ? t.green : score >= 50 ? t.amber : t.red,
                    }}
                  >
                    {Math.round(score)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Single-page formula */}
          {!isMultiPage && (
            <div
              style={{
                padding: "0.8rem 1rem",
                borderRadius: 8,
                background: t.accentBg,
                border: "1px solid " + t.accent + "20",
                fontFamily: "var(--mono)",
                fontSize: "0.78rem",
                color: t.ink,
                textAlign: "center",
                marginBottom: "1.2rem",
                lineHeight: 1.8,
              }}
            >
              100 &minus; {totalDeductions} deductions ={" "}
              <strong
                style={{
                  color: score >= 80 ? t.green : score >= 50 ? t.amber : t.red,
                }}
              >
                {Math.max(0, 100 - totalDeductions)}
              </strong>
              {totalDeductions > 100 && (
                <span style={{ color: t.ink50 }}> (capped at 0)</span>
              )}
            </div>
          )}

          {/* Deduction weights */}
          <h3
            style={{
              fontSize: "0.82rem",
              fontWeight: 700,
              color: t.ink,
              marginBottom: "0.6rem",
            }}
          >
            Deduction weights (latest scan)
          </h3>
          <div
            style={{
              borderRadius: 8,
              border: "1px solid " + t.ink08,
              overflow: "hidden",
              marginBottom: "1.2rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto auto auto",
                gap: 0,
                fontSize: "0.62rem",
                fontFamily: "var(--mono)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: t.ink50,
                padding: "0.5rem 0.8rem",
                background: t.ink04,
              }}
            >
              <span>Impact</span>
              <span style={{ textAlign: "right" }}>Elements</span>
              <span style={{ textAlign: "right" }}>&times; Weight</span>
              <span style={{ textAlign: "right" }}>Points</span>
            </div>
            {impactRows.map(function (row) {
              return (
                <div
                  key={row.label}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto",
                    gap: 0,
                    padding: "0.55rem 0.8rem",
                    borderTop: "1px solid " + t.ink08,
                    fontSize: "0.82rem",
                    opacity: row.count === 0 ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontWeight: 600, color: row.color }}>
                    {row.label}
                  </span>
                  <span
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--mono)",
                      fontSize: "0.78rem",
                    }}
                  >
                    {row.count}
                  </span>
                  <span
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--mono)",
                      fontSize: "0.78rem",
                      color: t.ink50,
                    }}
                  >
                    &times;{row.weight}
                  </span>
                  <span
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--mono)",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      color: row.points > 0 ? t.red : t.ink50,
                    }}
                  >
                    &minus;{row.points}
                  </span>
                </div>
              );
            })}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto",
                padding: "0.6rem 0.8rem",
                borderTop: "1px solid " + t.ink08,
                background: t.ink04,
                fontWeight: 700,
                fontSize: "0.82rem",
              }}
            >
              <span>Total deductions</span>
              <span
                style={{
                  textAlign: "right",
                  fontFamily: "var(--mono)",
                  color: t.red,
                }}
              >
                &minus;{totalDeductions}
              </span>
            </div>
          </div>

          {isMultiPage && totalDeductions > 100 && (
            <p
              style={{
                fontSize: "0.78rem",
                color: t.ink50,
                lineHeight: 1.6,
                marginTop: "-0.8rem",
                marginBottom: "1.2rem",
              }}
            >
              Each page's score is capped at 0 (never negative), so the site
              average can be higher than{" "}
              <span style={{ fontFamily: "var(--mono)" }}>
                100 &minus; {totalDeductions}
              </span>{" "}
              would suggest. Pages with fewer issues pull the average up.
            </p>
          )}

          {/* Top offending rules */}
          {topRules.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  color: t.ink,
                  marginBottom: "0.6rem",
                }}
              >
                Top issues affecting your score
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                {topRules.map(function (rule, idx) {
                  var impactColor =
                    rule.impact === "critical"
                      ? "#c0392b"
                      : rule.impact === "serious"
                      ? "#e67e22"
                      : rule.impact === "moderate"
                      ? "#b45309"
                      : "#888";
                  return (
                    <div
                      key={idx}
                      style={{
                        padding: "0.5rem 0.7rem",
                        borderRadius: 6,
                        border: "1px solid " + t.ink08,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.52rem",
                          fontWeight: 600,
                          padding: "0.08rem 0.25rem",
                          borderRadius: 3,
                          background: impactColor + "15",
                          color: impactColor,
                          textTransform: "uppercase",
                          flexShrink: 0,
                        }}
                      >
                        {rule.impact}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.75rem",
                          color: t.accent,
                          fontWeight: 600,
                          flexShrink: 0,
                        }}
                      >
                        {rule.rule}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: t.ink50,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rule.desc}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.7rem",
                          color: t.ink50,
                          flexShrink: 0,
                        }}
                      >
                        &times;{rule.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tip */}
          <div
            style={{
              marginTop: "1.2rem",
              padding: "0.8rem 1rem",
              borderRadius: 8,
              background: t.greenBg || t.ink04,
              border: "1px solid " + (t.green + "20"),
              fontSize: "0.82rem",
              color: t.ink,
              lineHeight: 1.7,
            }}
          >
            <strong style={{ color: t.green }}>Fastest way to improve:</strong>{" "}
            {critNodes > 0
              ? "Fix the " +
                critNodes +
                " critical element" +
                (critNodes !== 1 ? "s" : "") +
                " first — each one recovers 4 points."
              : seriousNodes > 0
              ? "Fix the " +
                seriousNodes +
                " serious element" +
                (seriousNodes !== 1 ? "s" : "") +
                " first — each one recovers 3 points."
              : "Fix open issues starting with the highest severity."}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ── */
export default function SiteDetailPage() {
  const { t } = useTheme();
  const { session, org, refreshSites } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [scans, setScans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("overview");

  // Handle ?action=scan from command palette
  var pendingScanRef = useRef(false);

  // Set tab from ?tab= URL param (works on mount AND subsequent navigations)
  useEffect(
    function () {
      var urlTab = searchParams.get("tab");
      if (
        urlTab &&
        ["overview", "issues", "scans", "settings"].indexOf(urlTab) !== -1
      ) {
        setTab(urlTab);
        searchParams.delete("tab");
        setSearchParams(searchParams, { replace: true });
      }
      var action = searchParams.get("action");
      if (action === "scan") {
        searchParams.delete("action");
        setSearchParams(searchParams, { replace: true });
        pendingScanRef.current = true;
      }
    },
    [searchParams]
  );
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({});
  const [showScanConfig, setShowScanConfig] = useState(false);
  const [selectedForFix, setSelectedForFix] = useState([]);
  const [viewMode, setViewMode] = useState("grouped");
  const [groupBy, setGroupBy] = useState("rule");
  const [sortMode, setSortMode] = useState("severity");
  const [showDiff, setShowDiff] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showScoreExplainer, setShowScoreExplainer] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [scoreCopied, setScoreCopied] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [scanJustCompleted, setScanJustCompleted] = useState(null);

  // Module-level cache for site detail data
  const cacheRef = useRef({ id: null, site: null, scans: null, issues: null });

  // Load data — uses cache if same site ID
  const loadData = useCallback(
    async (force) => {
      if (!force && cacheRef.current.id === id && cacheRef.current.site) {
        setSite(cacheRef.current.site);
        setScans(cacheRef.current.scans || []);
        setIssues(cacheRef.current.issues || []);
        setLoading(false);
        return;
      }
      // Parallel fetch — site, scans, and issues have no dependency on each other
      var [siteRes, scansRes, issuesRes] = await Promise.all([
        supabase.from("sites").select("*").eq("id", id).single(),
        supabase
          .from("scans")
          .select("*")
          .eq("site_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("issues")
          .select("*")
          .eq("site_id", id)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      var s = siteRes.data;
      var sc = scansRes.data || [];
      var iss = issuesRes.data || [];
      setSite(s);
      setScans(sc);
      setIssues(iss);
      if (s) {
        cacheRef.current = { id: id, site: s, scans: sc, issues: iss };
      }
      setLoading(false);
    },
    [id]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Realtime: listen for scan status changes
  useEffect(() => {
    const channel = supabase
      .channel(`scans-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scans",
          filter: `site_id=eq.${id}`,
        },
        (payload) => {
          const scan = payload.new;
          if (scan.status === "running") {
            setScanProgress({
              status: "running",
              pagesScanned: scan.pages_scanned || 0,
              issuesFound: scan.issues_found || 0,
            });
          } else if (scan.status === "complete") {
            setScanProgress(null);
            setScanning(false);
            setScanJustCompleted({
              score: scan.score,
              pages: scan.pages_scanned,
              issues: scan.issues_found,
              time: Date.now(),
            });
            loadData(true); // Force reload everything
          } else if (scan.status === "failed") {
            setScanProgress(null);
            setScanning(false);
            setScanError(scan.error || "Scan failed");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadData]);

  const handleScan = async (config = {}) => {
    setScanning(true);
    setScanError(null);
    setScanProgress({ status: "starting", pagesScanned: 0, issuesFound: 0 });
    setShowScanConfig(false);
    try {
      const body = { site_id: id };
      if (config.urls) body.urls = config.urls;
      const res = await supabase.functions.invoke("scan-site", {
        body,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message || "Scan failed");
      var scanData = res.data;
      await loadData(true);
      setScanProgress(null);
      if (scanData && !scanJustCompleted) {
        setScanJustCompleted({
          score: scanData.score,
          pages: scanData.pages_scanned,
          issues: scanData.issues_found,
          time: Date.now(),
        });
      }
    } catch (err) {
      setScanError(err.message);
      setScanProgress(null);
    }
    setScanning(false);
  };

  // Fire pending scan from ?action=scan URL param
  useEffect(
    function () {
      if (pendingScanRef.current && site && !scanning && !loading) {
        pendingScanRef.current = false;
        handleScan();
      }
    },
    [site, loading]
  );

  const handleIssueUpdate = (updatedIssue) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i))
    );
  };

  const handleFilterByPage = (pageUrl) => {
    setFilters((prev) => ({ ...prev, page: [pageUrl] }));
    setTab("issues");
  };

  var handleAddIgnoreRule = async function (rule) {
    if (!site) return;
    var existing = site.ignore_rules || [];
    // Check for duplicate
    var isDuplicate = existing.some(function (r) {
      return (
        r.rule_id === rule.rule_id &&
        (!rule.selector || r.selector === rule.selector)
      );
    });
    if (isDuplicate) return;

    var updated = existing.concat([
      {
        rule_id: rule.rule_id,
        description: rule.description,
        selector: rule.selector || null,
        created_at: new Date().toISOString(),
      },
    ]);

    var { data } = await supabase
      .from("sites")
      .update({ ignore_rules: updated })
      .eq("id", site.id)
      .select()
      .single();
    if (data) setSite(data);

    // Bulk-mark matching open issues as ignored
    var matchingIds = issues
      .filter(function (i) {
        return i.status === "open" && i.rule_id === rule.rule_id;
      })
      .map(function (i) {
        return i.id;
      });

    if (matchingIds.length > 0) {
      await supabase
        .from("issues")
        .update({ status: "ignored" })
        .in("id", matchingIds);

      setIssues(function (prev) {
        return prev.map(function (i) {
          if (matchingIds.indexOf(i.id) !== -1) {
            return Object.assign({}, i, { status: "ignored" });
          }
          return i;
        });
      });
    }

    setSelectedIssue(null);

    logAudit({
      action: "settings.updated",
      resourceType: "site",
      resourceId: site.id,
      description:
        "Ignore rule added: " +
        rule.rule_id +
        " (" +
        matchingIds.length +
        " issues auto-ignored)",
      metadata: { rule_id: rule.rule_id, issues_ignored: matchingIds.length },
    });
  };

  // Apply filters
  // ── Scan diff: identify issues new in the latest scan ──
  var newIssueIds = new Set();
  var completedScans = scans.filter(function (s) {
    return s.status === "complete";
  });
  if (completedScans.length >= 2) {
    var latestScanId = completedScans[0].id;
    var prevScanId = completedScans[1].id;

    // Build fingerprint set from previous scan's issues
    var prevFingerprints = new Set();
    for (var pi = 0; pi < issues.length; pi++) {
      if (issues[pi].scan_id === prevScanId) {
        prevFingerprints.add(
          (issues[pi].rule_id || "") +
            "||" +
            (issues[pi].page_url || "") +
            "||" +
            (issues[pi].element_selector || "")
        );
      }
    }

    // Issues in the latest scan that have no match in previous scan = new
    for (var ni = 0; ni < issues.length; ni++) {
      if (issues[ni].scan_id === latestScanId) {
        var fp =
          (issues[ni].rule_id || "") +
          "||" +
          (issues[ni].page_url || "") +
          "||" +
          (issues[ni].element_selector || "");
        if (!prevFingerprints.has(fp)) {
          newIssueIds.add(issues[ni].id);
        }
      }
    }
  } else if (completedScans.length === 1) {
    // First scan ever — all issues are "new"
    var firstScanId = completedScans[0].id;
    for (var fi = 0; fi < issues.length; fi++) {
      if (issues[fi].scan_id === firstScanId) {
        newIssueIds.add(issues[fi].id);
      }
    }
  }

  var newIssueCount = newIssueIds.size;

  const filteredIssues = issues.filter((issue) => {
    if (filters.impact?.length && !filters.impact.includes(issue.impact))
      return false;
    if (filters.status?.length && !filters.status.includes(issue.status))
      return false;
    if (
      filters.wcag?.length &&
      !filters.wcag.some((tag) => issue.wcag_tags?.includes(tag))
    )
      return false;
    if (filters.page?.length && !filters.page.includes(issue.page_url))
      return false;
    return true;
  });

  // Sort: severity (default) or quick-wins (fixable + high-impact first)
  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const sortedIssues = [...filteredIssues].sort(function (a, b) {
    if (sortMode === "quick-wins") {
      // Issues with fix suggestions come first
      var aHasFix = a.fix_suggestion ? 1 : 0;
      var bHasFix = b.fix_suggestion ? 1 : 0;
      if (bHasFix !== aHasFix) return bHasFix - aHasFix;
      // Within same fix-availability tier, sort by severity
      return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
    }
    // Default: severity only
    return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
  });

  // Group issues by rule_id + description (deduplication)
  var groupedIssues = [];
  var groupMap = {};

  if (groupBy === "page") {
    // Group by page_url
    for (var gi = 0; gi < sortedIssues.length; gi++) {
      var iss = sortedIssues[gi];
      var key = iss.page_url || "(unknown page)";
      if (!groupMap[key]) {
        groupMap[key] = {
          rule_id: key,
          description: null,
          label: key.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/",
          impact: iss.impact,
          wcag_tags: [],
          instances: [],
          pages: new Set(),
          expanded: false,
          isPageGroup: true,
        };
        groupedIssues.push(groupMap[key]);
      }
      groupMap[key].instances.push(iss);
      groupMap[key].pages.add(iss.page_url);
      if (impactOrder[iss.impact] < impactOrder[groupMap[key].impact])
        groupMap[key].impact = iss.impact;
    }
  } else {
    // Group by rule_id (default)
    for (var gi = 0; gi < sortedIssues.length; gi++) {
      var iss = sortedIssues[gi];
      var key = iss.rule_id + "||" + (iss.description || "");
      if (!groupMap[key]) {
        groupMap[key] = {
          rule_id: iss.rule_id,
          description: iss.description,
          impact: iss.impact,
          wcag_tags: iss.wcag_tags,
          instances: [],
          pages: new Set(),
          expanded: false,
        };
        groupedIssues.push(groupMap[key]);
      }
      groupMap[key].instances.push(iss);
      if (iss.page_url) groupMap[key].pages.add(iss.page_url);
      if (impactOrder[iss.impact] < impactOrder[groupMap[key].impact])
        groupMap[key].impact = iss.impact;
    }
  }
  // Convert Sets to counts
  for (var gk = 0; gk < groupedIssues.length; gk++) {
    groupedIssues[gk].pageCount = groupedIssues[gk].pages.size;
    groupedIssues[gk].count = groupedIssues[gk].instances.length;
    groupedIssues[gk].allIds = groupedIssues[gk].instances.map(function (i) {
      return i.id;
    });
    // Count how many instances have fix suggestions (used for quick-wins sort)
    groupedIssues[gk].fixableCount = groupedIssues[gk].instances.filter(
      function (i) {
        return !!i.fix_suggestion;
      }
    ).length;
    groupedIssues[gk].newCount = groupedIssues[gk].instances.filter(function (
      i
    ) {
      return newIssueIds.has(i.id);
    }).length;
  }

  // In quick-wins mode, re-sort groups: fully fixable groups first, then by severity
  if (sortMode === "quick-wins") {
    groupedIssues.sort(function (a, b) {
      var aAllFixable =
        a.fixableCount === a.count ? 1 : a.fixableCount > 0 ? 0.5 : 0;
      var bAllFixable =
        b.fixableCount === b.count ? 1 : b.fixableCount > 0 ? 0.5 : 0;
      if (bAllFixable !== aAllFixable) return bAllFixable - aAllFixable;
      return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
    });
  }

  // ── Keyboard shortcuts ──
  var shortcutDefs = [
    {
      key: "?",
      description: "Show keyboard shortcuts",
      category: "General",
      handler: function () {
        setShowShortcutHelp(true);
      },
    },
    {
      key: "s",
      description: "Scan",
      category: "Actions",
      handler: function () {
        if (!scanning && !isClient && site) handleScan();
      },
    },
    {
      key: "1",
      description: "Overview tab",
      category: "Navigation",
      handler: function () {
        setTab("overview");
      },
    },
    {
      key: "2",
      description: "Issues tab",
      category: "Navigation",
      handler: function () {
        setTab("issues");
      },
    },
    {
      key: "3",
      description: "Scans tab",
      category: "Navigation",
      handler: function () {
        setTab("scans");
      },
    },
    {
      key: "4",
      description: "Settings tab",
      category: "Navigation",
      handler: function () {
        if (!isClient) setTab("settings");
      },
    },
    {
      key: "j",
      description: "Next issue",
      category: "Issues",
      handler: function () {
        if (tab !== "issues" || sortedIssues.length === 0) return;
        var currentIdx = selectedIssue
          ? sortedIssues.findIndex(function (i) {
              return i.id === selectedIssue.id;
            })
          : -1;
        var nextIdx = Math.min(currentIdx + 1, sortedIssues.length - 1);
        setSelectedIssue(sortedIssues[nextIdx]);
      },
    },
    {
      key: "k",
      description: "Previous issue",
      category: "Issues",
      handler: function () {
        if (tab !== "issues" || sortedIssues.length === 0) return;
        var currentIdx = selectedIssue
          ? sortedIssues.findIndex(function (i) {
              return i.id === selectedIssue.id;
            })
          : 0;
        var prevIdx = Math.max(currentIdx - 1, 0);
        setSelectedIssue(sortedIssues[prevIdx]);
      },
    },
    {
      key: "escape",
      description: "Close modal / deselect",
      category: "General",
      handler: function () {
        if (showShortcutHelp) {
          setShowShortcutHelp(false);
          return;
        }
        if (selectedIssue) {
          setSelectedIssue(null);
          return;
        }
        if (showScanConfig) {
          setShowScanConfig(false);
          return;
        }
      },
    },
  ];
  useKeyboardShortcuts(shortcutDefs);

  // #25 — Dynamic browser tab title with issue count
  useEffect(
    function () {
      if (!site) return;
      var siteName = site.display_name || site.domain || "";
      var open = issues.filter(function (i) {
        return i.status === "open";
      }).length;
      var parts = [];
      if (tab === "issues" && open > 0) {
        parts.push(open + " issue" + (open !== 1 ? "s" : ""));
      }
      parts.push(siteName);
      parts.push("xsbl");
      document.title = parts.join(" — ");
      return function () {
        document.title = "xsbl — Accessibility Scanner";
      };
    },
    [site, tab, issues]
  );

  if (loading)
    return (
      <div>
        {/* ← Sites back link */}
        <div
          style={{
            width: 60,
            height: 13,
            borderRadius: 4,
            background: t.ink08,
            marginBottom: "0.5rem",
            animation: "skeletonPulse 1.5s ease-in-out infinite",
          }}
        />

        {/* Title row: site name + verified badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "0.3rem",
          }}
        >
          <div
            style={{
              width: 200,
              height: 26,
              borderRadius: 6,
              background: t.ink08,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: t.ink08,
              }}
            />
            <div
              style={{
                width: 55,
                height: 10,
                borderRadius: 3,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.05s",
              }}
            />
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            width: 140,
            height: 12,
            borderRadius: 4,
            background: t.ink08,
            marginBottom: "1.5rem",
            animation: "skeletonPulse 1.5s ease-in-out infinite",
            animationDelay: "0.05s",
          }}
        />

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "0.15rem",
            borderBottom: "1px solid " + t.ink08,
            marginBottom: "1.5rem",
            paddingBottom: "0.15rem",
          }}
        >
          {[65, 55, 48, 60].map(function (w, i) {
            return (
              <div
                key={i}
                style={{
                  width: w,
                  height: 14,
                  borderRadius: 4,
                  background: i === 0 ? t.accentBg : t.ink04,
                  margin: "0.55rem 0.45rem",
                  animation: "skeletonPulse 1.5s ease-in-out infinite",
                  animationDelay: i * 0.04 + "s",
                }}
              />
            );
          })}
        </div>

        {/* Scan panel skeleton */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderRadius: 12,
            border: "1px solid " + t.ink04,
            background: t.accentBg,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                width: 100,
                height: 16,
                borderRadius: 4,
                background: t.ink08,
                marginBottom: "0.3rem",
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.08s",
              }}
            />
            <div
              style={{
                width: 170,
                height: 11,
                borderRadius: 3,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.12s",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div
              style={{
                width: 72,
                height: 34,
                borderRadius: 8,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.1s",
              }}
            />
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.14s",
              }}
            />
          </div>
        </div>

        {/* Stats grid — 5 cards matching actual layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.8rem",
            marginBottom: "1.5rem",
          }}
        >
          {[1, 2, 3, 4, 5].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  borderRadius: 10,
                  border: "1px solid " + t.ink08,
                  background: t.cardBg,
                }}
              >
                <div
                  style={{
                    width: 55 + (i % 3) * 12,
                    height: 9,
                    borderRadius: 3,
                    background: t.ink08,
                    marginBottom: "0.3rem",
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    animationDelay: i * 0.06 + "s",
                  }}
                />
                <div
                  style={{
                    width: i === 5 ? 70 : 40,
                    height: i === 5 ? 13 : 24,
                    borderRadius: 5,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    animationDelay: i * 0.06 + 0.03 + "s",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Score chart placeholder */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            padding: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 90,
              height: 10,
              borderRadius: 3,
              background: t.ink08,
              marginBottom: "1rem",
              animation: "skeletonPulse 1.5s ease-in-out infinite",
              animationDelay: "0.15s",
            }}
          />
          <div
            style={{
              height: 140,
              borderRadius: 6,
              background: t.ink04,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
              animationDelay: "0.2s",
            }}
          />
        </div>

        {/* Page breakdown placeholder */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.9rem 1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: 110,
                height: 13,
                borderRadius: 4,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            />
            <div
              style={{
                width: 30,
                height: 16,
                borderRadius: 3,
                background: t.ink04,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.22s",
              }}
            />
          </div>
          {[1, 2, 3].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 1.1rem",
                  borderTop: "1px solid " + t.ink04,
                }}
              >
                <div>
                  <div
                    style={{
                      width: 120 + i * 20,
                      height: 12,
                      borderRadius: 3,
                      background: t.ink08,
                      marginBottom: "0.25rem",
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      animationDelay: 0.22 + i * 0.06 + "s",
                    }}
                  />
                  <div
                    style={{
                      width: 80 + i * 15,
                      height: 9,
                      borderRadius: 3,
                      background: t.ink04,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      animationDelay: 0.24 + i * 0.06 + "s",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 28,
                    height: 18,
                    borderRadius: 4,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    animationDelay: 0.26 + i * 0.06 + "s",
                  }}
                />
              </div>
            );
          })}
        </div>

        <style>{`@keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
      </div>
    );
  if (!site)
    return (
      <div>
        <p style={{ color: t.ink50 }}>Site not found.</p>
        <Link
          to="/dashboard/sites"
          style={{ color: t.accent, textDecoration: "none" }}
        >
          Back to sites
        </Link>
      </div>
    );

  const tabDefs = [
    { id: "overview", label: "Overview" },
    {
      id: "issues",
      label: `Issues (${issues.filter((i) => i.status === "open").length})`,
    },
    { id: "scans", label: "Scans" },
    !isClient && { id: "settings", label: "Settings" },
  ].filter(Boolean);

  const openCount = issues.filter((i) => i.status === "open").length;
  const criticalCount = issues.filter(
    (i) => i.impact === "critical" && i.status === "open"
  ).length;
  const seriousCount = issues.filter(
    (i) => i.impact === "serious" && i.status === "open"
  ).length;

  var handleCopyScore = function () {
    var domain = site.display_name || site.domain || "";
    var score = site.score != null ? Math.round(site.score) : "N/A";
    var parts = [domain + " — Accessibility: " + score + "/100 (WCAG 2.2 AA)"];
    var issueParts = [];
    if (criticalCount > 0) issueParts.push(criticalCount + " critical");
    if (seriousCount > 0) issueParts.push(seriousCount + " serious");
    if (issueParts.length > 0) {
      parts.push(openCount + " open issues (" + issueParts.join(", ") + ")");
    } else if (openCount > 0) {
      parts.push(openCount + " open issues");
    } else {
      parts.push("No open issues");
    }
    parts.push("xsbl.io");
    navigator.clipboard.writeText(parts.join(" — ")).then(function () {
      setScoreCopied(true);
      setTimeout(function () {
        setScoreCopied(false);
      }, 2000);
    });
  };

  var plan = org?.plan || "free";
  var isClient = org?.role === "client";

  var ISSUES_PER_PR = { free: 1, starter: 5, pro: 10, agency: 20 };
  var maxPerPr = ISSUES_PER_PR[plan] || 1;
  var atSelectionCap = selectedForFix.length >= maxPerPr;

  return (
    <div>
      {/* Header */}
      <Link
        to="/dashboard/sites"
        style={{
          color: t.ink50,
          textDecoration: "none",
          fontSize: "0.82rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          marginBottom: "0.5rem",
        }}
      >
        <ArrowLeft size={14} strokeWidth={1.8} /> Sites
      </Link>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          flexWrap: "wrap",
          marginBottom: "0.3rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          {site.display_name || site.domain}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: site.verified ? t.green : t.amber,
            }}
          />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.66rem",
              color: site.verified ? t.green : t.amber,
              fontWeight: 600,
            }}
          >
            {site.verified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>
      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.78rem",
          color: t.ink50,
          marginBottom: "1.5rem",
        }}
      >
        {site.domain}
      </p>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Site sections"
        style={{
          display: "flex",
          gap: "0.15rem",
          borderBottom: `1px solid ${t.ink08}`,
          marginBottom: "1.5rem",
        }}
      >
        {tabDefs.map(({ id: tid, label }) => (
          <button
            key={tid}
            role="tab"
            aria-selected={tab === tid}
            aria-controls={"tabpanel-" + tid}
            id={"tab-" + tid}
            onClick={() => setTab(tid)}
            style={{
              padding: "0.55rem 0.9rem",
              border: "none",
              borderBottom: `2px solid ${
                tab === tid ? t.accent : "transparent"
              }`,
              background: "none",
              color: tab === tid ? t.accent : t.ink50,
              fontFamily: "var(--body)",
              fontSize: "0.84rem",
              fontWeight: tab === tid ? 600 : 500,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!site.verified && tab === "overview" && (
        <VerifyPanel
          site={site}
          onVerified={function () {
            /* Immediately update local state so UI reflects verified */
            setSite(function (prev) {
              return Object.assign({}, prev, { verified: true });
            });
            /* Also update the cache so navigating away and back stays correct */
            if (cacheRef.current.site) {
              cacheRef.current.site = Object.assign({}, cacheRef.current.site, {
                verified: true,
              });
            }
            /* Invalidate the sites list cache so SitesPage shows verified too */
            refreshSites();
            /* Force a background reload to sync everything from DB */
            loadData(true);
            logAudit({
              action: "site.verified",
              resourceType: "site",
              resourceId: site.id,
              description: "Verified ownership of " + site.domain,
              metadata: { domain: site.domain },
            });
          }}
        />
      )}

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div
          role="tabpanel"
          id="tabpanel-overview"
          aria-labelledby="tab-overview"
        >
          {/* ── Scan panel (hidden for client users) ── */}
          {!isClient && (
            <div
              style={{
                padding: "1.2rem 1.4rem",
                borderRadius: 12,
                border: "1px solid " + t.accent + "25",
                background: t.accentBg,
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.8rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: t.ink,
                      margin: "0 0 0.15rem",
                    }}
                  >
                    Run a scan
                  </h2>
                  <p
                    title={site.last_scan_at ? fullDate(site.last_scan_at) : ""}
                    style={{
                      fontFamily: "var(--body)",
                      fontSize: "0.78rem",
                      color: t.ink50,
                      margin: 0,
                    }}
                  >
                    {site.last_scan_at
                      ? "Last scanned " + timeAgo(site.last_scan_at)
                      : "No scans yet"}
                  </p>
                </div>
                <div
                  style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
                >
                  <button
                    onClick={() => handleScan()}
                    disabled={scanning}
                    style={{
                      padding: "0.6rem 1.4rem",
                      borderRadius: 8,
                      border: "none",
                      background: t.accent,
                      color: "white",
                      fontFamily: "var(--body)",
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      cursor: scanning ? "not-allowed" : "pointer",
                      opacity: scanning ? 0.6 : 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    {scanning ? (
                      <Loader2 size={15} className="xsbl-spin" />
                    ) : (
                      <Play size={15} fill="white" />
                    )}
                    {scanning ? "Scanning" : "Scan"}
                  </button>
                  <button
                    onClick={() => setShowScanConfig(true)}
                    disabled={scanning}
                    className="dash-action-btn"
                  >
                    Configure scan
                  </button>
                  {scans.length > 0 && (
                    <PlanGate
                      currentPlan={plan}
                      requiredPlan="pro"
                      feature="PDF reports"
                      compact
                    >
                      <ReportButton site={site} scan={scans[0]} />
                    </PlanGate>
                  )}
                  {scans.length > 0 && (
                    <PlanGate
                      currentPlan={plan}
                      requiredPlan="starter"
                      feature="Simulator"
                      compact
                    >
                      <button
                        onClick={function () {
                          setShowSimulator(true);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          padding: "0.5rem 1rem",
                          borderRadius: 7,
                          border: "1.5px solid " + t.accent + "40",
                          background: "transparent",
                          color: t.accent,
                          fontFamily: "var(--body)",
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={function (e) {
                          e.currentTarget.style.background = t.accent;
                          e.currentTarget.style.color = "white";
                        }}
                        onMouseLeave={function (e) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = t.accent;
                        }}
                      >
                        <Eye size={14} /> Accessibility Simulator
                      </button>
                    </PlanGate>
                  )}
                  {site.score != null && (
                    <button
                      onClick={function () {
                        setShowStatement(true);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.5rem 1rem",
                        borderRadius: 7,
                        border: "1.5px solid " + t.ink20,
                        background: "transparent",
                        color: t.ink50,
                        fontFamily: "var(--body)",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={function (e) {
                        e.currentTarget.style.borderColor = t.ink50;
                        e.currentTarget.style.color = t.ink;
                      }}
                      onMouseLeave={function (e) {
                        e.currentTarget.style.borderColor = t.ink20;
                        e.currentTarget.style.color = t.ink50;
                      }}
                    >
                      <FileText size={14} strokeWidth={2} /> Statement
                    </button>
                  )}
                </div>
              </div>

              {/* Progress + error below buttons */}
              <div aria-live="polite" aria-atomic="true">
                {scanProgress && (
                  <div
                    style={{
                      marginTop: "0.8rem",
                      padding: "0.7rem 1rem",
                      borderRadius: 10,
                      background: t.cardBg,
                      border: "1px solid " + t.ink08,
                      overflow: "hidden",
                    }}
                  >
                    {/* Header row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.55rem",
                      }}
                    >
                      <Loader2
                        size={13}
                        className="xsbl-spin"
                        color={t.accent}
                      />
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: t.accent,
                        }}
                      >
                        {scanProgress.status === "starting"
                          ? "Starting scan\u2026"
                          : "Scanning your site\u2026"}
                      </span>
                    </div>

                    {/* Animated progress bar (indeterminate) */}
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        background: t.ink08,
                        marginBottom: "0.6rem",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          height: "100%",
                          width: "40%",
                          borderRadius: 2,
                          background: t.accent,
                          animation:
                            "xsbl-progress-slide 1.4s ease-in-out infinite",
                        }}
                      />
                    </div>

                    {/* Live counters */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "0.15rem",
                          }}
                        >
                          Pages scanned
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: t.ink,
                            lineHeight: 1,
                          }}
                        >
                          {scanProgress.pagesScanned}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "0.15rem",
                          }}
                        >
                          Issues found
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color:
                              scanProgress.issuesFound > 0 ? t.amber : t.ink,
                            lineHeight: 1,
                          }}
                        >
                          {scanProgress.issuesFound}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {scanError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: "0.6rem",
                      padding: "0.55rem 0.9rem",
                      borderRadius: 8,
                      background: t.red + "08",
                      border: "1px solid " + t.red + "20",
                      color: t.red,
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      strokeWidth={2}
                      style={{ flexShrink: 0 }}
                    />
                    {scanError}
                  </div>
                )}
              </div>
              {/* end aria-live */}
            </div>
          )}

          {/* Scan just completed — quick actions */}
          {scanJustCompleted && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.9rem 1.1rem",
                borderRadius: 10,
                border: "1px solid " + t.green + "25",
                background: t.greenBg || t.green + "06",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                flexWrap: "wrap",
              }}
            >
              <Check
                size={16}
                color={t.green}
                strokeWidth={2.5}
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 120 }}>
                <div
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: t.green,
                  }}
                >
                  Scan complete
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.66rem",
                    color: t.ink50,
                    marginTop: "0.1rem",
                  }}
                >
                  {scanJustCompleted.pages &&
                    scanJustCompleted.pages +
                      " page" +
                      (scanJustCompleted.pages !== 1 ? "s" : "") +
                      " · "}
                  {scanJustCompleted.issues != null &&
                    scanJustCompleted.issues +
                      " issue" +
                      (scanJustCompleted.issues !== 1 ? "s" : "")}
                  {scanJustCompleted.score != null &&
                    " · score " + Math.round(scanJustCompleted.score)}
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}
              >
                {scanJustCompleted.issues > 0 && (
                  <button
                    onClick={function () {
                      setTab("issues");
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "none",
                      background: t.accent,
                      color: "white",
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View issues
                  </button>
                )}
                {scans.length >= 2 && (
                  <button
                    onClick={function () {
                      setShowCompare(true);
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Compare
                  </button>
                )}
                {!site.scan_schedule || site.scan_schedule === "manual" ? (
                  <button
                    onClick={function () {
                      setTab("settings");
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Schedule scans
                  </button>
                ) : null}
                {site.score != null && (
                  <button
                    onClick={function () {
                      setShowStatement(true);
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Statement
                  </button>
                )}
                <button
                  onClick={function () {
                    setScanJustCompleted(null);
                  }}
                  aria-label="Dismiss"
                  style={{
                    padding: "0.2rem",
                    borderRadius: 4,
                    border: "none",
                    background: "none",
                    color: t.ink50,
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.8rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Score card — special with explainer link */}
            <div
              style={{
                padding: "1rem",
                borderRadius: 10,
                border: `1px solid ${t.ink08}`,
                background: t.cardBg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.3rem",
                  }}
                >
                  Score
                </div>
                {site.score != null && (
                  <button
                    onClick={handleCopyScore}
                    title={scoreCopied ? "Copied!" : "Copy score summary"}
                    aria-label={
                      scoreCopied
                        ? "Copied to clipboard"
                        : "Copy score summary to clipboard"
                    }
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.2rem",
                      cursor: "pointer",
                      color: scoreCopied ? t.green : t.ink50,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 4,
                      transition: "color 0.15s",
                    }}
                  >
                    {scoreCopied ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : (
                      <Copy size={12} strokeWidth={2} />
                    )}
                  </button>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color:
                    site.score != null
                      ? site.score >= 80
                        ? t.green
                        : site.score >= 50
                        ? t.amber
                        : t.red
                      : t.ink50,
                }}
              >
                {site.score != null ? Math.round(site.score) : "\u2014"}
              </div>
              {site.score != null && site.score < 80 && (
                <button
                  onClick={function () {
                    setShowScoreExplainer(true);
                  }}
                  style={{
                    marginTop: "0.35rem",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    color: t.accent,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <HelpCircle size={11} /> Why this score?
                </button>
              )}
            </div>

            {/* Remaining stat cards */}
            {[
              {
                label: "Open issues",
                value: openCount,
                color: openCount > 0 ? t.red : t.green,
              },
              {
                label: "Critical",
                value: criticalCount,
                color: criticalCount > 0 ? t.red : t.green,
              },
              { label: "Total scans", value: scans.length, color: t.ink },
              {
                label: "Last scan",
                value: site.last_scan_at ? timeAgo(site.last_scan_at) : "Never",
                title: site.last_scan_at ? fullDate(site.last_scan_at) : "",
                color: t.ink,
                small: true,
              },
            ].map(({ label, value, color, small, title }) => (
              <div
                key={label}
                title={title || ""}
                style={{
                  padding: "1rem",
                  borderRadius: 10,
                  border: `1px solid ${t.ink08}`,
                  background: t.cardBg,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.3rem",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: small ? "var(--body)" : "var(--serif)",
                    fontSize: small ? "0.82rem" : "1.5rem",
                    fontWeight: small ? 600 : 700,
                    color,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Powered by badge — free tier only */}
          {plan === "free" && site.score != null && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <a
                href="https://xsbl.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.7rem",
                  borderRadius: 6,
                  border: "1px solid " + t.ink08,
                  background: t.ink04,
                  textDecoration: "none",
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  color: t.ink50,
                  transition: "all 0.15s",
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.color = t.accent;
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.borderColor = t.ink08;
                  e.currentTarget.style.color = t.ink50;
                }}
              >
                Scanned by{" "}
                <span style={{ fontWeight: 600, color: t.ink }}>xsbl</span>
                <span style={{ color: t.accent }}>.</span>
              </a>
            </div>
          )}

          {/* Page breakdown from latest scan */}
          {scans.length > 0 && scans[0].summary_json?.pages?.length > 1 && (
            <PlanGate
              currentPlan={plan}
              requiredPlan="pro"
              feature="Per-page breakdown"
            >
              <PageBreakdown
                scan={scans[0]}
                issues={issues}
                onFilterByPage={handleFilterByPage}
              />
            </PlanGate>
          )}

          {/* Score chart */}
          <div style={{ marginBottom: "1.5rem" }}>
            <PlanGate
              currentPlan={plan}
              requiredPlan="pro"
              feature="Score trends"
            >
              <ScoreChart scans={scans} />
            </PlanGate>
          </div>

          <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-progress-slide { 0% { left: -40%; } 100% { left: 100%; } }`}</style>
        </div>
      )}

      {/* ── Issues ── */}
      {tab === "issues" && (
        <div role="tabpanel" id="tabpanel-issues" aria-labelledby="tab-issues">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.6rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <IssueFilters
              filters={filters}
              setFilters={setFilters}
              issues={issues}
            />
            <div
              style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  background: t.ink04,
                  borderRadius: 6,
                  padding: "0.15rem",
                }}
              >
                {[
                  { v: "rule", l: "By rule" },
                  { v: "page", l: "By page" },
                  { v: "flat", l: "Flat" },
                ].map(function (opt) {
                  var isActive =
                    opt.v === "flat"
                      ? viewMode === "flat"
                      : viewMode === "grouped" && groupBy === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={function () {
                        if (opt.v === "flat") {
                          setViewMode("flat");
                        } else {
                          setViewMode("grouped");
                          setGroupBy(opt.v);
                        }
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 5,
                        border: "none",
                        background: isActive ? t.cardBg : "transparent",
                        color: isActive ? t.ink : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>

              {/* Sort mode toggle */}
              <div
                style={{
                  display: "flex",
                  background: t.ink04,
                  borderRadius: 6,
                  padding: "0.15rem",
                }}
              >
                {[
                  { v: "severity", l: "Severity" },
                  { v: "quick-wins", l: "Quick wins" },
                ].map(function (opt) {
                  var isActive = sortMode === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={function () {
                        setSortMode(opt.v);
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 5,
                        border: "none",
                        background: isActive ? t.cardBg : "transparent",
                        color: isActive
                          ? opt.v === "quick-wins"
                            ? t.green
                            : t.ink
                          : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>

              {/* Scan diff toggle */}
              {completedScans.length >= 2 && newIssueCount > 0 && (
                <button
                  onClick={function () {
                    setShowDiff(function (v) {
                      return !v;
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: 5,
                    border: showDiff
                      ? "1.5px solid " + t.green
                      : "1.5px solid " + t.ink08,
                    background: showDiff ? t.green + "10" : "transparent",
                    color: showDiff ? t.green : t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: showDiff ? t.green : t.ink50,
                      flexShrink: 0,
                    }}
                  />
                  {newIssueCount} new
                </button>
              )}

              {sortedIssues.length > 0 && (
                <button
                  onClick={function () {
                    exportIssuesToCSV(
                      sortedIssues,
                      site.display_name || site.domain
                    );
                  }}
                  style={{
                    padding: "0.25rem 0.55rem",
                    borderRadius: 5,
                    border: "1px solid " + t.ink08,
                    background: "none",
                    color: t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.borderColor = t.accent;
                    e.currentTarget.style.color = t.accent;
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.borderColor = t.ink08;
                    e.currentTarget.style.color = t.ink50;
                  }}
                >
                  <Download size={11} /> CSV
                </button>
              )}
            </div>
          </div>

          {sortedIssues.length > 0 && site.github_repo && !isClient && (
            <div
              style={{
                display: "flex",
                gap: "0.3rem",
                marginBottom: "0.6rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  marginRight: "0.3rem",
                }}
              >
                Select:
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  color: atSelectionCap ? t.red : t.ink50,
                  fontWeight: 600,
                  padding: "0.1rem 0.35rem",
                  borderRadius: 3,
                  background: atSelectionCap ? t.red + "12" : t.ink04,
                }}
              >
                {selectedForFix.length}/{maxPerPr}
              </span>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.ink08,
                  background: "none",
                  color: t.ink50,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                All open
              </button>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.impact === "critical" && i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.red + "30",
                  background: "none",
                  color: t.red,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                Critical
              </button>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.impact === "serious" && i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.red + "20",
                  background: "none",
                  color: t.red,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                Serious
              </button>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.impact === "moderate" && i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.amber + "30",
                  background: "none",
                  color: t.amber,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                Moderate
              </button>
              {selectedForFix.length > 0 && (
                <button
                  onClick={function () {
                    setSelectedForFix([]);
                  }}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    border: "none",
                    background: t.ink04,
                    color: t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    cursor: "pointer",
                  }}
                >
                  Clear ({selectedForFix.length})
                </button>
              )}
            </div>
          )}

          {sortedIssues.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                border: "1px dashed " + t.ink20,
                borderRadius: 12,
              }}
            >
              <p style={{ color: t.ink50 }}>
                {issues.length === 0
                  ? "No issues found. Run a scan to check for accessibility violations."
                  : "No issues match your filters."}
              </p>
            </div>
          ) : viewMode === "grouped" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.65rem",
                  color: t.ink50,
                  marginBottom: "0.2rem",
                }}
              >
                {groupedIssues.length} unique issues ({sortedIssues.length}{" "}
                total)
                {selectedForFix.length > 0 && (
                  <span style={{ color: t.accent, marginLeft: "0.5rem" }}>
                    {selectedForFix.length}/{maxPerPr} selected
                  </span>
                )}
              </div>
              {groupedIssues.map(function (group, gi) {
                var groupKey = group.rule_id + "-" + gi;
                var isExpanded = !!expandedGroups[groupKey];
                var allSelected = group.allIds.every(function (id) {
                  return selectedForFix.indexOf(id) !== -1;
                });
                var someSelected =
                  !allSelected &&
                  group.allIds.some(function (id) {
                    return selectedForFix.indexOf(id) !== -1;
                  });
                return (
                  <div key={group.rule_id + "-" + gi}>
                    <div
                      style={{
                        padding: "0.85rem 1.1rem",
                        borderRadius: isExpanded ? "8px 8px 0 0" : 8,
                        border:
                          "1px solid " + (allSelected ? t.accent : t.ink08),
                        background: allSelected ? t.accentBg : t.cardBg,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={function (e) {
                        if (!allSelected)
                          e.currentTarget.style.borderColor = t.accent;
                      }}
                      onMouseLeave={function (e) {
                        if (!allSelected)
                          e.currentTarget.style.borderColor = t.ink08;
                      }}
                    >
                      {site.github_repo && !isClient && (
                        <div
                          onClick={function (e) {
                            e.stopPropagation();
                            if (allSelected) {
                              setSelectedForFix(function (p) {
                                return p.filter(function (id) {
                                  return group.allIds.indexOf(id) === -1;
                                });
                              });
                            } else {
                              setSelectedForFix(function (p) {
                                var n = p.slice();
                                group.allIds.forEach(function (id) {
                                  if (
                                    n.indexOf(id) === -1 &&
                                    n.length < maxPerPr
                                  )
                                    n.push(id);
                                });
                                return n;
                              });
                            }
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            flexShrink: 0,
                            border:
                              "1.5px solid " +
                              (allSelected
                                ? t.accent
                                : someSelected
                                ? t.accent
                                : t.ink20),
                            background: allSelected
                              ? t.accent
                              : someSelected
                              ? t.accent + "40"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          {(allSelected || someSelected) && (
                            <Check size={12} color="white" strokeWidth={3} />
                          )}
                        </div>
                      )}
                      <div
                        onClick={function () {
                          setExpandedGroups(function (prev) {
                            var next = Object.assign({}, prev);
                            next[groupKey] = !next[groupKey];
                            return next;
                          });
                        }}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <ImpactBadge impact={group.impact} />
                          {sortMode === "quick-wins" && (
                            <FixBadge
                              count={group.fixableCount}
                              total={group.count}
                            />
                          )}
                          {showDiff && group.newCount > 0 && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.5rem",
                                fontWeight: 700,
                                padding: "0.08rem 0.35rem",
                                borderRadius: 3,
                                background: t.green + "15",
                                color: t.green,
                                letterSpacing: "0.04em",
                                flexShrink: 0,
                              }}
                            >
                              {group.newCount === group.count
                                ? "ALL NEW"
                                : group.newCount + " NEW"}
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              color: t.accent,
                              fontWeight: 600,
                              width: groupBy === "page" ? "auto" : 140,
                              maxWidth: groupBy === "page" ? 240 : 140,
                              flexShrink: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {group.isPageGroup ? group.label : group.rule_id}
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: t.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {group.isPageGroup
                              ? group.instances.length +
                                " issue" +
                                (group.instances.length !== 1 ? "s" : "")
                              : group.description}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.62rem",
                            color: t.ink50,
                            background: t.ink04,
                            padding: "0.1rem 0.4rem",
                            borderRadius: 3,
                            minWidth: 32,
                            textAlign: "center",
                          }}
                        >
                          {group.count}×
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.62rem",
                            color: t.ink50,
                            background: t.ink04,
                            padding: "0.1rem 0.4rem",
                            borderRadius: 3,
                            minWidth: 38,
                            textAlign: "center",
                          }}
                        >
                          {group.isPageGroup
                            ? [
                                ...new Set(
                                  group.instances.map(function (i) {
                                    return i.rule_id;
                                  })
                                ),
                              ].length + " rules"
                            : group.pageCount + " pg"}
                        </span>
                        <ChevronDown
                          size={14}
                          color={t.ink50}
                          style={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0)",
                            transition: "transform 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={function (e) {
                            e.stopPropagation();
                            setExpandedGroups(function (prev) {
                              var next = Object.assign({}, prev);
                              next[groupKey] = !next[groupKey];
                              return next;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {isExpanded && (
                      <div
                        style={{
                          borderLeft: "1px solid " + t.ink08,
                          borderRight: "1px solid " + t.ink08,
                          borderBottom: "1px solid " + t.ink08,
                          borderRadius: "0 0 8px 8px",
                        }}
                      >
                        {group.instances.map(function (inst) {
                          var isSel = selectedForFix.indexOf(inst.id) !== -1;
                          return (
                            <div
                              key={inst.id}
                              onClick={function () {
                                setSelectedIssue(inst);
                              }}
                              style={{
                                padding: "0.55rem 1.1rem 0.55rem 2.6rem",
                                borderTop: "1px solid " + t.ink04,
                                background: isSel ? t.accentBg : t.paper,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                                opacity: inst.status !== "open" ? 0.5 : 1,
                              }}
                            >
                              {site.github_repo && !isClient && (
                                <div
                                  onClick={function (e) {
                                    e.stopPropagation();
                                    setSelectedForFix(function (p) {
                                      if (isSel)
                                        return p.filter(function (id) {
                                          return id !== inst.id;
                                        });
                                      if (p.length >= maxPerPr) return p;
                                      return p.concat([inst.id]);
                                    });
                                  }}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 3,
                                    flexShrink: 0,
                                    border:
                                      "1.5px solid " +
                                      (isSel ? t.accent : t.ink20),
                                    background: isSel
                                      ? t.accent
                                      : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  {isSel && (
                                    <Check
                                      size={10}
                                      color="white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                              )}
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.68rem",
                                  color: t.ink50,
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {(function () {
                                  try {
                                    return new URL(inst.page_url).pathname;
                                  } catch (e) {
                                    return inst.page_url || "/";
                                  }
                                })()}
                              </span>
                              {inst.element_selector && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.55rem",
                                    color: t.ink50,
                                    background: t.ink04,
                                    padding: "0.08rem 0.3rem",
                                    borderRadius: 3,
                                    maxWidth: 140,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "inline-block",
                                  }}
                                >
                                  {inst.element_selector}
                                </span>
                              )}
                              {inst.status !== "open" && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.52rem",
                                    fontWeight: 600,
                                    padding: "0.08rem 0.3rem",
                                    borderRadius: 3,
                                    background:
                                      inst.status === "fixed"
                                        ? t.greenBg
                                        : inst.status === "removed"
                                        ? t.accent + "12"
                                        : t.ink04,
                                    color:
                                      inst.status === "fixed"
                                        ? t.green
                                        : inst.status === "removed"
                                        ? t.accent
                                        : t.ink50,
                                  }}
                                >
                                  {inst.status}
                                </span>
                              )}
                              {showDiff && newIssueIds.has(inst.id) && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.48rem",
                                    fontWeight: 700,
                                    padding: "0.05rem 0.3rem",
                                    borderRadius: 3,
                                    background: t.green + "15",
                                    color: t.green,
                                    letterSpacing: "0.04em",
                                    flexShrink: 0,
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.65rem",
                  color: t.ink50,
                  marginBottom: "0.2rem",
                }}
              >
                {sortedIssues.length} issues
                {selectedForFix.length > 0 && (
                  <span style={{ color: t.accent, marginLeft: "0.5rem" }}>
                    {selectedForFix.length}/{maxPerPr} selected
                  </span>
                )}
              </div>
              {sortedIssues.map(function (issue) {
                var isSelected = selectedForFix.indexOf(issue.id) !== -1;
                return (
                  <div
                    key={issue.id}
                    style={{
                      padding: "0.85rem 1.1rem",
                      borderRadius: 8,
                      border: "1px solid " + (isSelected ? t.accent : t.ink08),
                      background: isSelected ? t.accentBg : t.cardBg,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      opacity: issue.status !== "open" ? 0.55 : 1,
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={function (e) {
                      if (!isSelected)
                        e.currentTarget.style.borderColor = t.accent;
                    }}
                    onMouseLeave={function (e) {
                      if (!isSelected)
                        e.currentTarget.style.borderColor = t.ink08;
                    }}
                  >
                    {site.github_repo && !isClient && (
                      <div
                        onClick={function (e) {
                          e.stopPropagation();
                          setSelectedForFix(function (p) {
                            if (isSelected)
                              return p.filter(function (id) {
                                return id !== issue.id;
                              });
                            if (p.length >= maxPerPr) return p;
                            return p.concat([issue.id]);
                          });
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          flexShrink: 0,
                          border:
                            "1.5px solid " + (isSelected ? t.accent : t.ink20),
                          background: isSelected ? t.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {isSelected && (
                          <Check size={12} color="white" strokeWidth={3} />
                        )}
                      </div>
                    )}
                    <div
                      onClick={function () {
                        setSelectedIssue(issue);
                      }}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.6rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <ImpactBadge impact={issue.impact} />
                          {sortMode === "quick-wins" &&
                            issue.fix_suggestion && (
                              <FixBadge count={1} total={1} />
                            )}
                          {showDiff && newIssueIds.has(issue.id) && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.48rem",
                                fontWeight: 700,
                                padding: "0.05rem 0.3rem",
                                borderRadius: 3,
                                background: t.green + "15",
                                color: t.green,
                                letterSpacing: "0.04em",
                                flexShrink: 0,
                              }}
                            >
                              NEW
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              color: t.accent,
                              width: 140,
                              flexShrink: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {issue.rule_id}
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: t.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {issue.description}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            flexShrink: 0,
                          }}
                        >
                          {issue.page_url &&
                            (function () {
                              try {
                                var p = new URL(issue.page_url).pathname;
                                return p !== "/" ? (
                                  <span
                                    style={{
                                      fontFamily: "var(--mono)",
                                      fontSize: "0.55rem",
                                      color: t.ink50,
                                      background: t.ink04,
                                      padding: "0.1rem 0.3rem",
                                      borderRadius: 3,
                                      maxWidth: 100,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "inline-block",
                                    }}
                                  >
                                    {p}
                                  </span>
                                ) : null;
                              } catch (e) {
                                return null;
                              }
                            })()}
                          {issue.status !== "open" && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.55rem",
                                fontWeight: 600,
                                padding: "0.1rem 0.35rem",
                                borderRadius: 3,
                                background:
                                  issue.status === "fixed"
                                    ? t.greenBg
                                    : issue.status === "removed"
                                    ? t.accent + "12"
                                    : t.ink04,
                                color:
                                  issue.status === "fixed"
                                    ? t.green
                                    : issue.status === "removed"
                                    ? t.accent
                                    : t.ink50,
                              }}
                            >
                              {issue.status.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isClient && (
            <BulkFixBar
              selectedIds={selectedForFix}
              issues={issues}
              site={site}
              maxPerPr={maxPerPr}
              plan={plan}
              onClear={function () {
                setSelectedForFix([]);
              }}
              onFixed={function () {
                setSelectedForFix([]);
                loadData(true);
              }}
            />
          )}
        </div>
      )}
      {/* ── Scans ── */}
      {tab === "scans" && (
        <div role="tabpanel" id="tabpanel-scans" aria-labelledby="tab-scans">
          {scans.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                border: `1px dashed ${t.ink20}`,
                borderRadius: 12,
              }}
            >
              <p style={{ color: t.ink50 }}>No scans yet.</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {/* Compare button — needs at least 2 completed scans */}
              {scans.filter(function (s) {
                return s.status === "complete";
              }).length >= 2 && (
                <div style={{ marginBottom: "0.4rem" }}>
                  <button
                    onClick={function () {
                      setShowCompare(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.4rem 0.85rem",
                      borderRadius: 7,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.borderColor = t.accent;
                      e.currentTarget.style.color = t.accent;
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.borderColor = t.ink20;
                      e.currentTarget.style.color = t.ink50;
                    }}
                  >
                    Compare scans
                  </button>
                </div>
              )}
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.1rem",
                    borderRadius: 8,
                    border: `1px solid ${t.ink08}`,
                    background: t.cardBg,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: 500,
                        color: t.ink,
                      }}
                    >
                      <span title={fullDate(scan.created_at)}>
                        {timeAgo(scan.created_at)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.68rem",
                        color: t.ink50,
                      }}
                    >
                      {scan.pages_scanned || 0} page
                      {(scan.pages_scanned || 0) !== 1 ? "s" : ""} ·{" "}
                      {scan.issues_found || 0} issue
                      {(scan.issues_found || 0) !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                    }}
                  >
                    {scan.score != null && (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color:
                            scan.score >= 80
                              ? t.green
                              : scan.score >= 50
                              ? t.amber
                              : t.red,
                        }}
                      >
                        {Math.round(scan.score)}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        padding: "0.18rem 0.45rem",
                        borderRadius: 4,
                        fontWeight: 600,
                        background:
                          scan.status === "complete"
                            ? t.greenBg
                            : scan.status === "failed"
                            ? `${t.red}12`
                            : scan.status === "running"
                            ? t.accentBg
                            : t.ink04,
                        color:
                          scan.status === "complete"
                            ? t.green
                            : scan.status === "failed"
                            ? t.red
                            : scan.status === "running"
                            ? t.accent
                            : t.ink50,
                      }}
                    >
                      {scan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div
          role="tabpanel"
          id="tabpanel-settings"
          aria-labelledby="tab-settings"
        >
          {/* Scan Schedule */}
          <SchedulePicker
            site={site}
            plan={org?.plan || "free"}
            onUpdate={(s) => setSite(s)}
          />

          {/* Custom Scan Profile — Agency only */}
          <PlanGate
            currentPlan={plan}
            requiredPlan="agency"
            feature="Custom scan profiles"
          >
            <ScanProfileEditor site={site} onUpdate={(s) => setSite(s)} />
          </PlanGate>

          {/* Verification Token — show/hide */}
          <VerificationTokenPanel site={site} />

          {/* GitHub Integration */}
          <GitHubConnect site={site} onUpdate={(s) => setSite(s)} />

          <CIWorkflowPanel site={site} onUpdate={(s) => setSite(s)} />

          {/* Badge Embed — free for all plans (branding vehicle) */}
          <BadgeEmbedPanel site={site} />

          {/* Ignore Rules */}
          <IgnoreRulesPanel
            site={site}
            onUpdate={function (s) {
              setSite(s);
            }}
          />

          {/* Danger zone */}
          <DangerZonePanel site={site} />
        </div>
      )}

      {/* Issue detail modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          site={site}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleIssueUpdate}
          readOnly={isClient}
          onIgnoreRule={!isClient ? handleAddIgnoreRule : undefined}
        />
      )}

      {/* Scan config modal */}
      {showScanConfig && (
        <ScanConfigModal
          site={site}
          plan={org?.plan || "free"}
          scanning={scanning}
          onScan={handleScan}
          onClose={() => setShowScanConfig(false)}
        />
      )}

      {/* Accessibility Simulator */}
      {showSimulator && (
        <AccessibilitySimulator
          site={site}
          issues={issues}
          onClose={function () {
            setShowSimulator(false);
          }}
        />
      )}

      {showScoreExplainer && site && (
        <ScoreExplainerModal
          t={t}
          score={site.score || 0}
          issues={issues}
          scans={scans}
          onClose={function () {
            setShowScoreExplainer(false);
          }}
        />
      )}

      {/* Scan comparison modal */}
      {showCompare && (
        <ScanCompare
          scans={scans}
          issues={issues}
          onClose={function () {
            setShowCompare(false);
          }}
        />
      )}

      {/* Accessibility statement generator */}
      {showStatement && (
        <AccessibilityStatementGenerator
          site={site}
          issues={issues}
          scans={scans}
          onClose={function () {
            setShowStatement(false);
          }}
        />
      )}

      {/* Keyboard shortcuts help */}
      {showShortcutHelp && (
        <ShortcutHelpOverlay
          shortcuts={shortcutDefs}
          onClose={function () {
            setShowShortcutHelp(false);
          }}
        />
      )}

      {/* Shortcut hint */}
      <button
        onClick={function () {
          setShowShortcutHelp(true);
        }}
        title="Keyboard shortcuts (?)"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid " + t.ink08,
          background: t.cardBg,
          color: t.ink50,
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 20,
        }}
        onMouseEnter={function (e) {
          e.currentTarget.style.color = t.accent;
        }}
        onMouseLeave={function (e) {
          e.currentTarget.style.color = t.ink50;
        }}
      >
        ?
      </button>
    </div>
  );
}
