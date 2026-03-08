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
} from "lucide-react";

function scoreColor(score) {
  if (score >= 90) return "#1a8754";
  if (score >= 70) return "#b45309";
  return "#c0392b";
}

function scoreLabel(score) {
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 60) return "Needs work";
  return "Poor";
}

function formatDate(dateStr) {
  if (!dateStr) return "Never scanned";
  var d = new Date(dateStr);
  var now = new Date();
  var diff = now - d;
  if (diff < 3600000) return Math.floor(diff / 60000) + " min ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + " hours ago";
  if (diff < 604800000) return Math.floor(diff / 86400000) + " days ago";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function StatusPage() {
  var { t } = useTheme();
  var { slug } = useParams();
  var [data, setData] = useState(null);
  var [error, setError] = useState(null);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!slug) return;
      setLoading(true);
      setError(null);

      var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      if (!supabaseUrl) {
        setError("Configuration error");
        setLoading(false);
        return;
      }

      fetch(
        supabaseUrl +
          "/functions/v1/public-status?slug=" +
          encodeURIComponent(slug)
      )
        .then(function (res) {
          return res.json();
        })
        .then(function (json) {
          if (json.error) {
            setError(json.error);
          } else {
            setData(json);
          }
          setLoading(false);
        })
        .catch(function () {
          setError("Failed to load status page");
          setLoading(false);
        });
    },
    [slug]
  );

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "3rem 1.5rem 4rem",
      }}
    >
      {loading && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <Loader2 size={24} className="xsbl-spin" color={t.accent} />
        </div>
      )}

      {error && !loading && (
        <div style={{ textAlign: "center", padding: "4rem 0" }}>
          <Shield
            size={32}
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
              : error === "Status page is not enabled for this organization"
              ? "This status page is not available"
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
              : error === "Status page is not enabled for this organization"
              ? "The organization hasn't enabled their public status page yet."
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
      )}

      {data && !loading && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: t.ink50,
                marginBottom: "0.4rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Shield size={12} /> Accessibility Status
            </div>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: t.ink,
                margin: "0 0 0.4rem",
                lineHeight: 1.2,
              }}
            >
              {data.org_name}
            </h1>
            <p style={{ fontSize: "0.88rem", color: t.ink50 }}>
              Public accessibility scores for {data.sites.length} monitored site
              {data.sites.length !== 1 ? "s" : ""}.
            </p>
          </div>

          {/* Average score card */}
          {data.average_score != null && (
            <div
              style={{
                padding: "1.5rem",
                borderRadius: 14,
                border: "1px solid " + t.ink08,
                background: t.cardBg,
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: scoreColor(data.average_score) + "12",
                  border: "3px solid " + scoreColor(data.average_score),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    color: scoreColor(data.average_score),
                  }}
                >
                  {data.average_score}
                </span>
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    color: t.ink,
                    marginBottom: "0.15rem",
                  }}
                >
                  {scoreLabel(data.average_score)} overall
                </div>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: t.ink50,
                    lineHeight: 1.5,
                  }}
                >
                  Average accessibility score across {data.sites.length} site
                  {data.sites.length !== 1 ? "s" : ""}, powered by automated
                  WCAG 2.2 AA scanning.
                </div>
              </div>
            </div>
          )}

          {/* Site list */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
          >
            {data.sites.map(function (site) {
              var hasScore = site.score != null;
              return (
                <div
                  key={site.domain}
                  style={{
                    padding: "1rem 1.2rem",
                    borderRadius: 10,
                    border: "1px solid " + t.ink08,
                    background: t.cardBg,
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                  }}
                >
                  {/* Score circle */}
                  <div
                    style={{
                      width: 46,
                      height: 46,
                      borderRadius: "50%",
                      background: hasScore
                        ? scoreColor(site.score) + "12"
                        : t.ink04,
                      border:
                        "2px solid " +
                        (hasScore ? scoreColor(site.score) : t.ink20),
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {hasScore ? (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: scoreColor(site.score),
                        }}
                      >
                        {site.score}
                      </span>
                    ) : (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.68rem",
                          color: t.ink50,
                        }}
                      >
                        —
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        marginBottom: "0.15rem",
                      }}
                    >
                      <Globe size={13} color={t.ink50} />
                      <span
                        style={{
                          fontSize: "0.92rem",
                          fontWeight: 600,
                          color: t.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {site.display_name || site.domain}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        color: t.ink50,
                      }}
                    >
                      <span>{site.domain}</span>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.2rem",
                        }}
                      >
                        <Clock size={10} /> {formatDate(site.last_scan)}
                      </span>
                    </div>
                  </div>

                  {/* Status badge */}
                  {hasScore && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        padding: "0.2rem 0.5rem",
                        borderRadius: 5,
                        background: scoreColor(site.score) + "12",
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                        fontWeight: 600,
                        color: scoreColor(site.score),
                        flexShrink: 0,
                      }}
                    >
                      {site.score >= 80 ? (
                        <CheckCircle size={11} />
                      ) : (
                        <AlertTriangle size={11} />
                      )}
                      {scoreLabel(site.score)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid " + t.ink08,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <a
                href="https://xsbl.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  textDecoration: "none",
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: t.ink50,
                }}
              >
                <XsblBull size={14} />
                Powered by xsbl<span style={{ color: t.accent }}>.</span>
              </a>
            </div>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                color: t.ink50,
              }}
            >
              Updated {formatDate(data.generated_at)}
            </span>
          </div>
        </div>
      )}

      <style>{`
        @keyframes xsbl-spin { to { transform: rotate(360deg); } }
        .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
      `}</style>
    </div>
  );
}
