import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
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
} from "lucide-react";
import IssueDetailModal from "../../components/dashboard/IssueDetailModal";
import ScoreChart from "../../components/dashboard/ScoreChart";
import PageBreakdown from "../../components/dashboard/PageBreakdown";
import ScanConfigModal from "../../components/dashboard/ScanConfigModal";
import BulkFixBar from "../../components/dashboard/BulkFixBar";
import ReportButton from "../../components/dashboard/ReportButton";
import AccessibilitySimulator from "../../components/dashboard/AccessibilitySimulator";

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
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

/* ── Schedule Picker Inline ── */
function SchedulePickerInline({ site, plan, onUpdate }) {
  const { t } = useTheme();
  const [schedule, setSchedule] = useState(site.scan_schedule || "manual");
  const [hour, setHour] = useState(site.schedule_hour ?? 6);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isPaid = ["starter", "pro", "agency"].includes(plan);
  const hasChanged =
    schedule !== (site.scan_schedule || "manual") ||
    hour !== (site.schedule_hour ?? 6);

  const handleSave = async () => {
    setSaving(true);
    await supabase
      .from("sites")
      .update({ scan_schedule: schedule, schedule_hour: hour })
      .eq("id", site.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    onUpdate?.({ ...site, scan_schedule: schedule, schedule_hour: hour });
  };

  const options = [
    { value: "manual", label: "Manual only" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
  ];

  return (
    <div
      style={{
        padding: "1.2rem",
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
          marginBottom: "0.6rem",
        }}
      >
        Scan schedule
      </div>
      <div
        style={{
          display: "flex",
          gap: "0.3rem",
          marginBottom: "0.8rem",
          background: t.ink04,
          padding: "0.25rem",
          borderRadius: 8,
          width: "fit-content",
        }}
      >
        {options.map(function (opt) {
          var isActive = schedule === opt.value;
          var isLocked = opt.value !== "manual" && !isPaid;
          return (
            <button
              key={opt.value}
              onClick={function () {
                if (!isLocked) setSchedule(opt.value);
              }}
              disabled={isLocked}
              style={{
                padding: "0.4rem 0.75rem",
                borderRadius: 6,
                border: "none",
                background: isActive ? t.cardBg : "transparent",
                color: isLocked ? t.ink20 : isActive ? t.ink : t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                fontWeight: 600,
                cursor: isLocked ? "not-allowed" : "pointer",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
              }}
            >
              {opt.label} {isLocked ? "🔒" : ""}
            </button>
          );
        })}
      </div>

      {schedule !== "manual" && isPaid && (
        <div style={{ marginBottom: "0.8rem" }}>
          <label
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            Run at (UTC)
          </label>
          <select
            value={hour}
            onChange={function (e) {
              setHour(parseInt(e.target.value));
            }}
            style={{
              display: "block",
              marginTop: "0.25rem",
              padding: "0.4rem 0.6rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: t.paper,
              color: t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.76rem",
            }}
          >
            {Array.from({ length: 24 }, function (_, i) {
              return i;
            }).map(function (h) {
              return (
                <option key={h} value={h}>
                  {String(h).padStart(2, "0") + ":00 UTC"}
                </option>
              );
            })}
          </select>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
              marginTop: "0.25rem",
            }}
          >
            {schedule === "daily" ? "Runs every day" : "Runs every 7 days"} at
            this time.
          </div>
        </div>
      )}

      {!isPaid && schedule === "manual" && (
        <p
          style={{
            fontSize: "0.74rem",
            color: t.ink50,
            fontStyle: "italic",
            margin: "0 0 0.5rem 0",
          }}
        >
          Scheduled scans available on Starter, Pro, and Agency plans.
        </p>
      )}

      {isPaid && hasChanged && (
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {saving ? "Saving..." : saved ? "✓ Saved" : "Save schedule"}
        </button>
      )}
    </div>
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
      }}
    >
      {impact}
    </span>
  );
}

/* ── Verify panel ── */
function VerifyPanel({ site, onVerified }) {
  const { t } = useTheme();
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
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("verify-site", {
        body: { site_id: site.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      setResult(data);
      if (data?.verified) {
        onVerified?.();
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
        <h3
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          Verify ownership
        </h3>
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
  const statuses = ["open", "fixed", "ignored", "false_positive"];

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

/* ── GitHub Connect Panel ── */
function GitHubConnectPanel({ site, onUpdate }) {
  const { t } = useTheme();
  const [repo, setRepo] = useState(site.github_repo || "");
  const [ghToken, setGhToken] = useState(site.github_token ? "••••••••" : "");
  const [branch, setBranch] = useState(site.github_default_branch || "main");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [status, setStatus] = useState(null); // { type: "success"|"error", text: "..." }
  const connected = !!(site.github_repo && site.github_token);

  var handleSave = async function () {
    if (!repo.trim() || !ghToken.trim()) return;
    setSaving(true);
    setStatus(null);
    var updateData = {
      github_repo: repo.trim(),
      github_default_branch: branch.trim() || "main",
    };
    if (ghToken !== "••••••••") updateData.github_token = ghToken.trim();
    await supabase.from("sites").update(updateData).eq("id", site.id);
    setSaving(false);
    setStatus({ type: "success", text: "GitHub repo saved" });
    onUpdate && onUpdate({ ...site, ...updateData });
  };

  var handleTest = async function () {
    setTesting(true);
    setStatus(null);
    try {
      var tkn = ghToken === "••••••••" ? site.github_token : ghToken;
      var res = await fetch("https://api.github.com/repos/" + repo.trim(), {
        headers: {
          Authorization: "token " + tkn,
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (res.ok) {
        var d = await res.json();
        setBranch(d.default_branch || "main");
        setStatus({
          type: "success",
          text:
            "Connected to " +
            d.full_name +
            " (" +
            (d.private ? "private" : "public") +
            ")",
        });
      } else {
        var err = await res.json().catch(function () {
          return {};
        });
        setStatus({
          type: "error",
          text: "GitHub error: " + (err.message || res.status),
        });
      }
    } catch (e) {
      setStatus({
        type: "error",
        text: "Connection failed: " + String(e).substring(0, 100),
      });
    }
    setTesting(false);
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
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.6rem",
        }}
      >
        <GitHubIcon size={16} />
        <span style={{ fontSize: "0.88rem", fontWeight: 600, color: t.ink }}>
          GitHub Integration
        </span>
        {connected && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              padding: "0.12rem 0.35rem",
              borderRadius: 3,
              background: t.green + "12",
              color: t.green,
            }}
          >
            Connected
          </span>
        )}
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: t.ink50,
          marginBottom: "0.8rem",
          lineHeight: 1.5,
        }}
      >
        Connect a repo to create pull requests that fix accessibility issues.
      </p>
      <div style={{ marginBottom: "0.5rem" }}>
        <label
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Repository (owner/repo)
        </label>
        <input
          value={repo}
          onChange={function (e) {
            setRepo(e.target.value);
          }}
          placeholder="acme/website"
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.2rem",
            padding: "0.4rem 0.65rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.76rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ marginBottom: "0.5rem" }}>
        <label
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Personal Access Token
        </label>
        <input
          type="password"
          value={ghToken}
          onChange={function (e) {
            setGhToken(e.target.value);
          }}
          onFocus={function () {
            if (ghToken === "••••••••") setGhToken("");
          }}
          placeholder="ghp_xxxx"
          style={{
            display: "block",
            width: "100%",
            marginTop: "0.2rem",
            padding: "0.4rem 0.65rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.76rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <a
          href="https://github.com/settings/tokens/new?scopes=repo&description=xsbl-fixes"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.accent,
            textDecoration: "none",
          }}
        >
          Create token with repo scope →
        </a>
      </div>
      <div style={{ marginBottom: "0.8rem" }}>
        <label
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Default branch
        </label>
        <input
          value={branch}
          onChange={function (e) {
            setBranch(e.target.value);
          }}
          style={{
            display: "block",
            width: 100,
            marginTop: "0.2rem",
            padding: "0.4rem 0.65rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.76rem",
            outline: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          onClick={handleTest}
          disabled={!repo.trim() || testing}
          style={{
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink20,
            background: "none",
            color: t.ink,
            fontSize: "0.74rem",
            fontWeight: 500,
            cursor: "pointer",
            fontFamily: "var(--body)",
          }}
        >
          {testing ? "Testing..." : "Test"}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !repo.trim()}
          style={{
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontSize: "0.74rem",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "var(--body)",
          }}
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      {status && (
        <div
          style={{
            marginTop: "0.6rem",
            padding: "0.5rem 0.7rem",
            borderRadius: 6,
            fontSize: "0.76rem",
            lineHeight: 1.5,
            background:
              status.type === "success" ? t.green + "08" : t.red + "08",
            border:
              "1px solid " +
              (status.type === "success" ? t.green + "20" : t.red + "20"),
            color: status.type === "success" ? t.green : t.red,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {status.type === "success" ? (
            <Check size={13} />
          ) : (
            <AlertTriangle size={13} />
          )}
          {status.text}
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

/* ── Main page ── */
export default function SiteDetailPage() {
  const { t } = useTheme();
  const { session, org } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [scans, setScans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({});
  const [showScanConfig, setShowScanConfig] = useState(false);
  const [selectedForFix, setSelectedForFix] = useState([]);
  const [viewMode, setViewMode] = useState("grouped");
  const [showSimulator, setShowSimulator] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});

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
      const { data: s } = await supabase
        .from("sites")
        .select("*")
        .eq("id", id)
        .single();
      setSite(s);
      if (s) {
        const { data: sc } = await supabase
          .from("scans")
          .select("*")
          .eq("site_id", id)
          .order("created_at", { ascending: false })
          .limit(50);
        setScans(sc || []);
        const { data: iss } = await supabase
          .from("issues")
          .select("*")
          .eq("site_id", id)
          .order("created_at", { ascending: false })
          .limit(500);
        setIssues(iss || []);
        cacheRef.current = {
          id: id,
          site: s,
          scans: sc || [],
          issues: iss || [],
        };
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
            setScanProgress("Scanning...");
          } else if (scan.status === "complete") {
            setScanProgress(null);
            setScanning(false);
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
    setScanProgress("Starting scan...");
    setShowScanConfig(false);
    try {
      const body = { site_id: id };
      if (config.urls) body.urls = config.urls;
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("scan-site", {
        body,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message || "Scan failed");
      await loadData();
      setScanProgress(null);
    } catch (err) {
      setScanError(err.message);
      setScanProgress(null);
    }
    setScanning(false);
  };

  const handleIssueUpdate = (updatedIssue) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i))
    );
  };

  const handleFilterByPage = (pageUrl) => {
    setFilters((prev) => ({ ...prev, page: [pageUrl] }));
    setTab("issues");
  };

  // Apply filters
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

  // Sort: critical > serious > moderate > minor
  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const sortedIssues = [...filteredIssues].sort(
    (a, b) => (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4)
  );

  // Group issues by rule_id + description (deduplication)
  var groupedIssues = [];
  var groupMap = {};
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
    // Use the worst impact
    if (impactOrder[iss.impact] < impactOrder[groupMap[key].impact])
      groupMap[key].impact = iss.impact;
  }
  // Convert Sets to counts
  for (var gk = 0; gk < groupedIssues.length; gk++) {
    groupedIssues[gk].pageCount = groupedIssues[gk].pages.size;
    groupedIssues[gk].count = groupedIssues[gk].instances.length;
    groupedIssues[gk].allIds = groupedIssues[gk].instances.map(function (i) {
      return i.id;
    });
  }

  if (loading)
    return (
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 120,
              height: 16,
              borderRadius: 6,
              background: t.ink08,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "0.8rem",
            marginBottom: "2rem",
          }}
        >
          {[1, 2, 3, 4].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  padding: "1.2rem",
                  borderRadius: 10,
                  border: "1px solid " + t.ink04,
                  background: t.cardBg,
                }}
              >
                <div
                  style={{
                    width: "40%",
                    height: 10,
                    borderRadius: 4,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    marginBottom: "0.5rem",
                  }}
                />
                <div
                  style={{
                    width: "60%",
                    height: 22,
                    borderRadius: 6,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                  }}
                />
              </div>
            );
          })}
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
        >
          {[1, 2, 3].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.8rem",
                  padding: "0.9rem 1.1rem",
                  borderRadius: 8,
                  border: "1px solid " + t.ink04,
                  background: t.cardBg,
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
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      width: "50%",
                      height: 12,
                      borderRadius: 4,
                      background: t.ink08,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      marginBottom: "0.3rem",
                    }}
                  />
                  <div
                    style={{
                      width: "30%",
                      height: 10,
                      borderRadius: 4,
                      background: t.ink08,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        <style>{`@keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
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
    { id: "settings", label: "Settings" },
  ];

  const openCount = issues.filter((i) => i.status === "open").length;
  const criticalCount = issues.filter(
    (i) => i.impact === "critical" && i.status === "open"
  ).length;

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
        <VerifyPanel site={site} onVerified={loadData} />
      )}

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div>
          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.8rem",
              marginBottom: "1.5rem",
            }}
          >
            {[
              {
                label: "Score",
                value: site.score != null ? Math.round(site.score) : "\u2014",
                color:
                  site.score != null
                    ? site.score >= 80
                      ? t.green
                      : site.score >= 50
                      ? t.amber
                      : t.red
                    : t.ink50,
              },
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
                value: site.last_scan_at
                  ? new Date(site.last_scan_at).toLocaleDateString()
                  : "Never",
                color: t.ink,
                small: true,
              },
            ].map(({ label, value, color, small }) => (
              <div
                key={label}
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

          {/* Page breakdown from latest scan */}
          {scans.length > 0 && scans[0].summary_json?.pages?.length > 1 && (
            <PageBreakdown
              scan={scans[0]}
              issues={issues}
              onFilterByPage={handleFilterByPage}
            />
          )}

          {/* Score chart */}
          <div style={{ marginBottom: "1.5rem" }}>
            <ScoreChart scans={scans} />
          </div>

          {/* Scan buttons */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
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
              {scanning ? "Scanning\u2026" : "Quick scan"}
            </button>
            <button
              onClick={() => setShowScanConfig(true)}
              disabled={scanning}
              style={{
                padding: "0.6rem 1.2rem",
                borderRadius: 8,
                border: `1.5px solid ${t.ink20}`,
                background: "none",
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.85rem",
                fontWeight: 500,
                cursor: scanning ? "not-allowed" : "pointer",
                opacity: scanning ? 0.6 : 1,
              }}
            >
              Configure scan
            </button>
            {scanProgress && (
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.75rem",
                  color: t.accent,
                }}
              >
                {scanProgress}
              </span>
            )}
            {scanError && (
              <p style={{ color: t.red, fontSize: "0.82rem", margin: 0 }}>
                {scanError}
              </p>
            )}
            {scans.length > 0 && <ReportButton site={site} scan={scans[0]} />}
            {scans.length > 0 && (
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
                  background: t.accentBg,
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
                  e.currentTarget.style.background = t.accentBg;
                  e.currentTarget.style.color = t.accent;
                }}
              >
                <Eye size={14} /> Simulate vision
              </button>
            )}
          </div>
          <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
        </div>
      )}

      {/* ── Issues ── */}
      {tab === "issues" && (
        <div>
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
                  { v: "grouped", l: "Grouped" },
                  { v: "flat", l: "Flat" },
                ].map(function (opt) {
                  return (
                    <button
                      key={opt.v}
                      onClick={function () {
                        setViewMode(opt.v);
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 5,
                        border: "none",
                        background:
                          viewMode === opt.v ? t.cardBg : "transparent",
                        color: viewMode === opt.v ? t.ink : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow:
                          viewMode === opt.v
                            ? "0 1px 3px rgba(0,0,0,0.08)"
                            : "none",
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>
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

          {sortedIssues.length > 0 && site.github_repo && (
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
                    {selectedForFix.length} selected
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
                      {site.github_repo && (
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
                                  if (n.indexOf(id) === -1) n.push(id);
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
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              color: t.accent,
                              fontWeight: 600,
                            }}
                          >
                            {group.rule_id}
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
                            {group.description}
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
                          }}
                        >
                          {group.pageCount} pg
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
                              {site.github_repo && (
                                <div
                                  onClick={function (e) {
                                    e.stopPropagation();
                                    setSelectedForFix(function (p) {
                                      return isSel
                                        ? p.filter(function (id) {
                                            return id !== inst.id;
                                          })
                                        : p.concat([inst.id]);
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
                                        : t.ink04,
                                    color:
                                      inst.status === "fixed"
                                        ? t.green
                                        : t.ink50,
                                  }}
                                >
                                  {inst.status}
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
                    {selectedForFix.length} selected
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
                    {site.github_repo && (
                      <div
                        onClick={function (e) {
                          e.stopPropagation();
                          setSelectedForFix(function (p) {
                            return isSelected
                              ? p.filter(function (id) {
                                  return id !== issue.id;
                                })
                              : p.concat([issue.id]);
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
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              color: t.accent,
                              flexShrink: 0,
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
                                    : t.ink04,
                                color:
                                  issue.status === "fixed" ? t.green : t.ink50,
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

          <BulkFixBar
            selectedIds={selectedForFix}
            issues={issues}
            site={site}
            onClear={function () {
              setSelectedForFix([]);
            }}
            onFixed={function () {
              setSelectedForFix([]);
              loadData(true);
            }}
          />
        </div>
      )}
      {/* ── Scans ── */}
      {tab === "scans" &&
        (scans.length === 0 ? (
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
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
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
                    {new Date(scan.created_at).toLocaleString()}
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
        ))}

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div>
          {/* Scan Schedule */}
          <SchedulePickerInline
            site={site}
            plan={org?.plan || "free"}
            onUpdate={(s) => setSite(s)}
          />

          {/* Verification Token — show/hide */}
          <VerificationTokenPanel site={site} />

          {/* GitHub Integration */}
          <GitHubConnectPanel site={site} onUpdate={(s) => setSite(s)} />

          {/* Badge Embed */}
          <BadgeEmbedPanel site={site} />

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
    </div>
  );
}
