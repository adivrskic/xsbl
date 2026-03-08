import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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

function ScoreRing({ score, size, stroke, t }) {
  var r = (size - stroke) / 2;
  var circ = 2 * Math.PI * r;
  var offset = circ - (score / 100) * circ;
  var color = scoreColor(score, t);
  return (
    <svg
      width={size}
      height={size}
      role="img"
      aria-label={"Score " + score + " out of 100"}
    >
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
          fontSize: size * 0.28 + "px",
          fontWeight: 700,
          fill: color,
        }}
      >
        {score}
      </text>
    </svg>
  );
}

function BentoCard({ children, span, style }) {
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

function CardLabel({ icon: Icon, children, color }) {
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
      {Icon && <Icon size={11} />}
      {children}
    </div>
  );
}

function StatNumber({ value, total, color }) {
  var { t } = useTheme();
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: "0.3rem" }}>
      <span
        style={{
          fontFamily: "var(--mono)",
          fontSize: "2rem",
          fontWeight: 700,
          color: color,
        }}
      >
        {value}
      </span>
      {total != null && (
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.82rem",
            color: t.ink50,
          }}
        >
          / {total}
        </span>
      )}
    </div>
  );
}

export default function StatusPage() {
  var { t, dark, toggle } = useTheme();
  var { slug } = useParams();
  var [data, setData] = useState(null);
  var [error, setError] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!slug) return;
      setLoading(true);
      setError(null);
      var url = import.meta.env.VITE_SUPABASE_URL;
      if (!url) {
        setError("Configuration error");
        setLoading(false);
        return;
      }
      fetch(
        url + "/functions/v1/public-status?slug=" + encodeURIComponent(slug)
      )
        .then(function (r) {
          return r.json();
        })
        .then(function (j) {
          j.error ? setError(j.error) : setData(j);
          setLoading(false);
        })
        .catch(function () {
          setError("Failed to load");
          setLoading(false);
        });
    },
    [slug]
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
            {error === "Organization not found"
              ? "Status page not found"
              : error.indexOf("not enabled") !== -1
              ? "Status page not available"
              : "Something went wrong"}
          </div>
          <div
            style={{
              fontSize: "0.85rem",
              color: t.ink50,
              marginBottom: "1.5rem",
            }}
          >
            {error === "Organization not found"
              ? "Check the URL and try again."
              : error.indexOf("not enabled") !== -1
              ? "This organization hasn't enabled their public status page."
              : error}
          </div>
          <Link
            to="/"
            style={{
              color: t.accent,
              fontFamily: "var(--mono)",
              fontSize: "0.82rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Go to xsbl.io →
          </Link>
        </div>
      </div>
    );
  }

  if (!data) return null;

  var avg = data.average_score;
  var sites = data.sites || [];
  var total = sites.length;
  var passing = sites.filter(function (s) {
    return s.score >= 70;
  }).length;
  var excellent = sites.filter(function (s) {
    return s.score >= 90;
  }).length;
  var lowest =
    total > 0
      ? sites.reduce(function (a, b) {
          return (a.score || 0) < (b.score || 0) ? a : b;
        })
      : null;
  var hasAlert = lowest && lowest.score < 70;

  return (
    <div style={{ minHeight: "100vh", background: t.paper, color: t.ink }}>
      {/* Minimal top bar */}
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
            Accessibility status
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
        {/* Org header */}
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
            {total} monitored site{total !== 1 ? "s" : ""} · Updated{" "}
            {formatDate(data.generated_at)}
          </p>
        </div>

        {/* Bento grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.8rem",
          }}
        >
          {/* Average score — 2 cols */}
          <BentoCard
            span={2}
            style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}
          >
            {avg != null && (
              <ScoreRing score={avg} size={100} stroke={6} t={t} />
            )}
            <div>
              <CardLabel icon={Shield}>Average score</CardLabel>
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
                WCAG 2.2 AA across all sites
              </div>
            </div>
          </BentoCard>

          {/* Passing */}
          <BentoCard>
            <CardLabel>Sites passing</CardLabel>
            <StatNumber value={passing} total={total} color={t.green} />
            <div
              style={{
                fontSize: "0.65rem",
                color: t.ink50,
                marginTop: "0.3rem",
              }}
            >
              Score ≥ 70
            </div>
          </BentoCard>

          {/* Excellent */}
          <BentoCard>
            <CardLabel>Excellent</CardLabel>
            <StatNumber value={excellent} total={total} color={t.accent} />
            <div
              style={{
                fontSize: "0.65rem",
                color: t.ink50,
                marginTop: "0.3rem",
              }}
            >
              Score ≥ 90
            </div>
          </BentoCard>

          {/* All sites — full width */}
          <BentoCard span={4}>
            <CardLabel icon={Activity}>All sites</CardLabel>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "0.6rem",
              }}
            >
              {sites.map(function (site) {
                var hasScore = site.score != null;
                var color = hasScore ? scoreColor(site.score, t) : t.ink50;
                return (
                  <div
                    key={site.domain}
                    style={{
                      padding: "0.9rem 1rem",
                      borderRadius: 10,
                      border: "1px solid " + t.ink08,
                      background: t.paper,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.8rem",
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
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
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color: hasScore ? color : t.ink50,
                        }}
                      >
                        {hasScore ? site.score : "\u2014"}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.88rem",
                          fontWeight: 600,
                          color: t.ink,
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
                          fontSize: "0.55rem",
                          color: t.ink50,
                          marginTop: "0.1rem",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.15rem",
                          }}
                        >
                          <Globe size={9} /> {site.domain}
                        </span>
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.15rem",
                          }}
                        >
                          <Clock size={9} /> {formatDate(site.last_scan)}
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
                          flexShrink: 0,
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
                  </div>
                );
              })}
            </div>
          </BentoCard>

          {/* Needs attention */}
          {hasAlert && (
            <BentoCard span={2}>
              <CardLabel icon={AlertTriangle} color={t.red}>
                Needs attention
              </CardLabel>
              <div
                style={{
                  fontSize: "0.92rem",
                  fontWeight: 600,
                  color: t.ink,
                  marginBottom: "0.15rem",
                }}
              >
                {lowest.display_name || lowest.domain}
              </div>
              <div style={{ fontSize: "0.78rem", color: t.ink50 }}>
                Score {lowest.score}/100 — lowest across all monitored sites.
              </div>
            </BentoCard>
          )}

          {/* WCAG standard */}
          <BentoCard span={hasAlert ? 2 : 4}>
            <CardLabel icon={Shield}>Standard</CardLabel>
            <div
              style={{
                fontSize: "0.88rem",
                color: t.ink,
                fontWeight: 600,
                marginBottom: "0.15rem",
              }}
            >
              WCAG 2.2 Level AA
            </div>
            <div
              style={{ fontSize: "0.72rem", color: t.ink50, lineHeight: 1.5 }}
            >
              All sites scanned using automated axe-core analysis in a real
              headless browser.
            </div>
          </BentoCard>
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
          <span>Scanned with axe-core · WCAG 2.2 AA</span>
        </div>
      </main>
    </div>
  );
}
