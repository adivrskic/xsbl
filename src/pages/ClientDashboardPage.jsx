import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import XsblBull from "../components/landing/XsblBull";
import {
  Shield,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Sun,
  Moon,
  Activity,
  Bug,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function scoreColor(score, t) {
  if (score >= 90) return t.green;
  if (score >= 70) return t.amber;
  return t.red;
}

function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs work";
  return "Poor";
}

function impactColor(impact, t) {
  if (impact === "critical") return t.red;
  if (impact === "serious") return t.amber;
  return t.ink50;
}

function formatDate(dateStr) {
  if (!dateStr) return "Never";
  var d = new Date(dateStr);
  var now = new Date();
  var diff = now - d;
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";
  if (diff < 604800000) return Math.floor(diff / 86400000) + "d ago";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatDateFull(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function ScoreRing({ score, size, stroke, t }) {
  var r = (size - stroke) / 2;
  var circ = 2 * Math.PI * r;
  var offset = circ - (score / 100) * circ;
  var color = scoreColor(score, t);
  return (
    <svg width={size} height={size} role="img" aria-label={"Score " + score}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={t.ink08}
        strokeWidth={stroke}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        style={{
          transform: "rotate(-90deg)",
          transformOrigin: "center",
          transition: "stroke-dashoffset 0.6s ease",
        }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontFamily: "var(--mono)",
          fontSize: size * 0.22 + "px",
          fontWeight: 700,
          fill: color,
        }}
      >
        {Math.round(score * 10) / 10}
      </text>
    </svg>
  );
}

function Card({ children, span, style }) {
  var { t } = useTheme();
  return (
    <div
      style={{
        padding: "1.2rem 1.4rem",
        borderRadius: 14,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        gridColumn: span ? "span " + span : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Label({ icon: Icon, children, color }) {
  var { t } = useTheme();
  return (
    <div
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.55rem",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: color || t.ink50,
        marginBottom: "0.5rem",
        display: "flex",
        alignItems: "center",
        gap: "0.25rem",
      }}
    >
      {Icon && <Icon size={11} />} {children}
    </div>
  );
}

function ImpactBar({ label, count, total, color }) {
  var { t } = useTheme();
  var pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontSize: "0.72rem",
      }}
    >
      <span
        style={{
          width: 55,
          fontFamily: "var(--mono)",
          fontSize: "0.58rem",
          textTransform: "uppercase",
          color: t.ink50,
          flexShrink: 0,
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: t.ink04 }}>
        <div
          style={{
            width: pct + "%",
            height: "100%",
            borderRadius: 3,
            background: color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          fontWeight: 600,
          color: count > 0 ? color : t.ink50,
          minWidth: 28,
          textAlign: "right",
        }}
      >
        {count}
      </span>
    </div>
  );
}

function SitePanel({ site, t, defaultOpen }) {
  var [open, setOpen] = useState(defaultOpen);
  var hasScore = site.score != null;
  var color = hasScore ? scoreColor(site.score, t) : t.ink50;

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        overflow: "hidden",
      }}
    >
      {/* Header — always visible */}
      <button
        onClick={function () {
          setOpen(!open);
        }}
        aria-expanded={open}
        style={{
          width: "100%",
          padding: "1rem 1.2rem",
          background: "none",
          border: "none",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          textAlign: "left",
          color: t.ink,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: hasScore ? color + "12" : t.ink04,
            border: "2px solid " + (hasScore ? color : t.ink20),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: hasScore ? color : t.ink50,
            }}
          >
            {hasScore ? Math.round(site.score * 10) / 10 : "\u2014"}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "0.92rem",
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {site.display_name || site.domain}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              color: t.ink50,
              marginTop: "0.1rem",
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}
            >
              <Globe size={9} /> {site.domain}
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.15rem" }}
            >
              <Clock size={9} /> {formatDate(site.last_scan_at)}
            </span>
            <span>
              {site.issues.total} open issue{site.issues.total !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
        {hasScore && (
          <div
            style={{
              padding: "0.15rem 0.45rem",
              borderRadius: 4,
              background: color + "12",
              fontFamily: "var(--mono)",
              fontSize: "0.52rem",
              fontWeight: 600,
              color: color,
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            {site.score >= 80 ? (
              <CheckCircle size={10} />
            ) : (
              <AlertTriangle size={10} />
            )}
            {scoreLabel(site.score)}
          </div>
        )}
        {open ? (
          <ChevronUp size={16} color={t.ink50} />
        ) : (
          <ChevronDown size={16} color={t.ink50} />
        )}
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          style={{
            padding: "0 1.2rem 1.2rem",
            borderTop: "1px solid " + t.ink04,
          }}
        >
          {/* Impact breakdown + scan history side by side */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginTop: "1rem",
            }}
          >
            {/* Impact */}
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.52rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: t.ink50,
                  marginBottom: "0.5rem",
                }}
              >
                Open issues by impact
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.4rem",
                }}
              >
                <ImpactBar
                  label="Critical"
                  count={site.issues.critical}
                  total={site.issues.total}
                  color={t.red}
                />
                <ImpactBar
                  label="Serious"
                  count={site.issues.serious}
                  total={site.issues.total}
                  color={t.amber}
                />
                <ImpactBar
                  label="Moderate"
                  count={site.issues.moderate}
                  total={site.issues.total}
                  color={t.accent}
                />
                <ImpactBar
                  label="Minor"
                  count={site.issues.minor}
                  total={site.issues.total}
                  color={t.ink50}
                />
              </div>
            </div>

            {/* Scan history sparkline */}
            <div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.52rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: t.ink50,
                  marginBottom: "0.5rem",
                }}
              >
                Recent scans
              </div>
              {site.scans.length === 0 ? (
                <div style={{ fontSize: "0.78rem", color: t.ink50 }}>
                  No scans yet
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.25rem",
                  }}
                >
                  {site.scans.slice(0, 5).map(function (scan, i) {
                    var sColor = scoreColor(scan.score, t);
                    return (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.72rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.58rem",
                            color: t.ink50,
                            width: 80,
                            flexShrink: 0,
                          }}
                        >
                          {formatDateFull(scan.date)}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontWeight: 600,
                            color: sColor,
                            width: 38,
                            textAlign: "right",
                          }}
                        >
                          {Math.round(scan.score * 10) / 10}
                        </span>
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            borderRadius: 2,
                            background: t.ink04,
                          }}
                        >
                          <div
                            style={{
                              width: scan.score + "%",
                              height: "100%",
                              borderRadius: 2,
                              background: sColor,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                          }}
                        >
                          {scan.issues_found} issues
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Issues list */}
          {site.issues.items.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.52rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  color: t.ink50,
                  marginBottom: "0.5rem",
                }}
              >
                Top open issues
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.3rem",
                }}
              >
                {site.issues.items.slice(0, 10).map(function (issue) {
                  var iColor = impactColor(issue.impact, t);
                  return (
                    <div
                      key={issue.id}
                      style={{
                        padding: "0.5rem 0.7rem",
                        borderRadius: 6,
                        border: "1px solid " + t.ink04,
                        background: t.paper,
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
                          textTransform: "uppercase",
                          color: iColor,
                          padding: "0.1rem 0.35rem",
                          borderRadius: 3,
                          background: iColor + "12",
                          flexShrink: 0,
                        }}
                      >
                        {issue.impact}
                      </span>
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: t.ink,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {issue.description || issue.rule_id}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.55rem",
                          color: t.ink50,
                          flexShrink: 0,
                        }}
                      >
                        {issue.rule_id}
                      </span>
                      {issue.page_count > 1 && (
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.52rem",
                            color: t.ink50,
                            flexShrink: 0,
                          }}
                        >
                          {issue.page_count} pages
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientDashboardPage() {
  var { t, dark, toggle } = useTheme();
  var { token } = useParams();
  var [data, setData] = useState(null);
  var [error, setError] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!token) return;
      setLoading(true);
      setError(null);
      var base = import.meta.env.VITE_SUPABASE_URL;
      if (!base) {
        setError("Configuration error");
        setLoading(false);
        return;
      }
      fetch(
        base +
          "/functions/v1/client-dashboard?token=" +
          encodeURIComponent(token)
      )
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          j.error ? setError(j.error) : setData(j);
          setLoading(false);
        })
        .catch(function () {
          setError("Failed to load dashboard");
          setLoading(false);
        });
    },
    [token]
  );

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Loader2 size={28} className="xsbl-spin" color={t.accent} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: t.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Shield
            size={36}
            color={t.ink50}
            style={{ opacity: 0.3, marginBottom: "0.8rem" }}
          />
          <div
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              color: t.ink,
              marginBottom: "0.3rem",
            }}
          >
            Dashboard unavailable
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: t.ink50,
              marginBottom: "1.5rem",
              maxWidth: 360,
            }}
          >
            {error}
          </div>
          <a
            href="/"
            style={{
              color: t.accent,
              fontFamily: "var(--mono)",
              fontSize: "0.82rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go to xsbl.io →
          </a>
        </div>
      </div>
    );
  }

  if (!data) return null;

  var avg = data.average_score;
  var sites = data.sites || [];
  var totalIssues = sites.reduce(function (s, site) {
    return s + site.issues.total;
  }, 0);
  var criticalTotal = sites.reduce(function (s, site) {
    return s + site.issues.critical;
  }, 0);
  var passing = sites.filter(function (s) {
    return s.score >= 70;
  }).length;

  return (
    <div style={{ minHeight: "100vh", background: t.paper, color: t.ink }}>
      {/* Top bar */}
      <div
        style={{
          padding: "0.7rem clamp(1rem, 3vw, 2rem)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid " + t.ink08,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "3px",
              textDecoration: "none",
              fontFamily: "var(--mono)",
              fontWeight: 600,
              fontSize: "0.9rem",
              color: t.ink,
            }}
          >
            <XsblBull size={18} /> xsbl
            <span style={{ color: t.accent }}>.</span>
          </a>
          <span
            style={{ width: 1, height: 16, background: t.ink08 }}
            aria-hidden="true"
          />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              color: t.ink50,
            }}
          >
            Client dashboard
          </span>
        </div>
        <button
          onClick={toggle}
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          style={{
            background: t.ink04,
            border: "none",
            borderRadius: 6,
            padding: "0.35rem 0.45rem",
            cursor: "pointer",
            color: t.ink,
            display: "flex",
            alignItems: "center",
          }}
        >
          {dark ? <Sun size={14} /> : <Moon size={14} />}
        </button>
      </div>

      <main
        style={{
          maxWidth: 1040,
          margin: "0 auto",
          padding: "1.5rem clamp(1rem, 3vw, 2rem) 3rem",
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: "1.2rem" }}>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.5rem, 3vw, 2rem)",
              fontWeight: 700,
              color: t.ink,
              margin: "0 0 0.2rem",
              lineHeight: 1.2,
            }}
          >
            {data.org_name}
          </h1>
          <p
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              color: t.ink50,
              margin: 0,
            }}
          >
            {sites.length} site{sites.length !== 1 ? "s" : ""} ·{" "}
            {data.client_email} · Updated {formatDate(data.generated_at)}
          </p>
        </div>

        {/* Summary bento */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.8rem",
            marginBottom: "1.2rem",
          }}
        >
          {/* Score ring */}
          <Card
            span={2}
            style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
          >
            {avg != null && (
              <ScoreRing score={avg} size={100} stroke={6} t={t} />
            )}
            <div>
              <Label icon={Shield}>Average score</Label>
              <div
                style={{
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  color: t.ink,
                  marginBottom: "0.1rem",
                }}
              >
                {avg != null ? scoreLabel(avg) : "No data"}
              </div>
              <div
                style={{ fontSize: "0.75rem", color: t.ink50, lineHeight: 1.5 }}
              >
                WCAG 2.2 AA compliance
              </div>
            </div>
          </Card>

          {/* Passing */}
          <Card>
            <Label>Passing</Label>
            <div
              style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: t.green,
                }}
              >
                {passing}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.82rem",
                  color: t.ink50,
                }}
              >
                / {sites.length}
              </span>
            </div>
            <div
              style={{
                fontSize: "0.65rem",
                color: t.ink50,
                marginTop: "0.3rem",
              }}
            >
              Score ≥ 70
            </div>
          </Card>

          {/* Issues */}
          <Card>
            <Label icon={Bug} color={criticalTotal > 0 ? t.red : undefined}>
              Open issues
            </Label>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "2rem",
                fontWeight: 700,
                color: totalIssues > 0 ? t.ink : t.ink50,
              }}
            >
              {totalIssues}
            </div>
            {criticalTotal > 0 && (
              <div
                style={{
                  fontSize: "0.65rem",
                  color: t.red,
                  marginTop: "0.3rem",
                  fontWeight: 600,
                }}
              >
                {criticalTotal} critical
              </div>
            )}
          </Card>
        </div>

        {/* Sites */}
        <Label icon={Activity}>All sites</Label>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}
        >
          {sites.map(function (site, i) {
            return (
              <SitePanel
                key={site.id}
                site={site}
                t={t}
                defaultOpen={i === 0}
              />
            );
          })}
        </div>

        {/* Footer */}
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--mono)",
            fontSize: "0.55rem",
            color: t.ink50,
          }}
        >
          <a
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              textDecoration: "none",
              color: t.ink50,
              fontWeight: 600,
            }}
          >
            <XsblBull size={12} /> Powered by xsbl
            <span style={{ color: t.accent }}>.</span>
          </a>
          <span>Private dashboard · Do not share this link publicly</span>
        </div>
      </main>
    </div>
  );
}
