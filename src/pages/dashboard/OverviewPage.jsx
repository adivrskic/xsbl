import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, AlertTriangle, Zap, ArrowRight, Chrome, X } from "lucide-react";
import IssueTrendsChart from "../../components/dashboard/IssueTrendsChart";
import SetupChecklist from "../../components/dashboard/SetupChecklist";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import WidgetConfigurator, {
  loadWidgetConfig,
} from "../../components/dashboard/WidgetConfigurator";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";

function Stat({ label, value, sub, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-card__label">{label}</div>
      <div
        className="stat-card__value"
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {sub && <div className="stat-card__sub">{sub}</div>}
    </div>
  );
}

var CHROME_STORE_URL =
  "https://chrome.google.com/webstore/detail/xsbl-accessibility/placeholder";

function ExtensionBanner({ t }) {
  var [dismissed, setDismissed] = useState(false);

  // Check if already dismissed or installed
  if (dismissed) return null;
  var wasDismissed = false;
  try {
    wasDismissed = localStorage.getItem("xsbl-ext-banner-dismissed") === "true";
  } catch (e) {}
  if (wasDismissed) return null;

  // Check if extension is installed
  var extInstalled = document.documentElement.hasAttribute(
    "data-xsbl-ext-installed"
  );
  if (extInstalled) return null;

  var handleDismiss = function () {
    setDismissed(true);
    try {
      localStorage.setItem("xsbl-ext-banner-dismissed", "true");
    } catch (e) {}
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "0.8rem 1rem",
        borderRadius: 10,
        border: "1px solid " + t.accent + "20",
        background: t.accentBg,
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: t.accent + "15",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Chrome size={17} strokeWidth={2} color={t.accent} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: "0.84rem",
            fontWeight: 600,
            color: t.ink,
            lineHeight: 1.3,
            marginBottom: "0.1rem",
          }}
        >
          Make any site accessible with the xsbl extension
        </div>
        <div style={{ fontSize: "0.72rem", color: t.ink50, lineHeight: 1.4 }}>
          Contrast boost, keyboard nav, dyslexia mode, and AI alt text — on
          every page you visit.
        </div>
      </div>
      <a
        href={CHROME_STORE_URL}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.35rem",
          padding: "0.4rem 0.8rem",
          borderRadius: 6,
          border: "none",
          background: t.accent,
          color: "white",
          fontFamily: "var(--body)",
          fontSize: "0.74rem",
          fontWeight: 600,
          textDecoration: "none",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        <Chrome size={12} strokeWidth={2} />
        Get extension
      </a>
      <button
        onClick={handleDismiss}
        aria-label="Dismiss extension banner"
        style={{
          padding: "0.2rem",
          border: "none",
          background: "none",
          color: t.ink50,
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          opacity: 0.5,
          transition: "opacity 0.15s",
        }}
        onMouseEnter={function (e) {
          e.currentTarget.style.opacity = "1";
        }}
        onMouseLeave={function (e) {
          e.currentTarget.style.opacity = "0.5";
        }}
      >
        <X size={14} strokeWidth={2} />
      </button>
    </div>
  );
}

function QuickWins({ sites, t }) {
  var scored = (sites || []).filter(function (s) {
    return s.score != null;
  });
  var lowScoreSites = scored
    .filter(function (s) {
      return s.score < 80;
    })
    .sort(function (a, b) {
      return (a.score || 0) - (b.score || 0);
    })
    .slice(0, 3);

  if (lowScoreSites.length === 0 && scored.length > 0) {
    return (
      <div
        style={{
          padding: "1.2rem",
          borderRadius: 10,
          border: "1px solid " + t.green + "20",
          background: t.green + "06",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
        }}
      >
        <Zap size={18} color={t.green} strokeWidth={2} />
        <div>
          <div
            style={{
              fontFamily: "var(--body)",
              fontSize: "0.88rem",
              fontWeight: 600,
              color: t.green,
              marginBottom: "0.15rem",
            }}
          >
            All sites scoring 80+
          </div>
          <div style={{ fontSize: "0.78rem", color: t.ink50 }}>
            No critical quick wins right now. Keep up the great work!
          </div>
        </div>
      </div>
    );
  }

  if (lowScoreSites.length === 0) return null;

  return (
    <div>
      <h2
        className="dash-section-title"
        style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
      >
        <Zap size={15} strokeWidth={2} /> Quick wins
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {lowScoreSites.map(function (site) {
          return (
            <Link
              key={site.id}
              to={"/dashboard/sites/" + site.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.7rem 0.9rem",
                borderRadius: 8,
                border: "1px solid " + t.ink08,
                background: t.cardBg,
                textDecoration: "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={function (e) {
                e.currentTarget.style.borderColor = t.accent + "40";
                e.currentTarget.style.boxShadow = "0 2px 8px " + t.ink08;
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.borderColor = t.ink08;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: (site.score < 50 ? t.red : t.amber) + "12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--serif)",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                  color: site.score < 50 ? t.red : t.amber,
                  flexShrink: 0,
                }}
              >
                {Math.round(site.score)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--body)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: t.ink,
                    lineHeight: 1.3,
                  }}
                >
                  {site.display_name || site.domain}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    color: t.ink50,
                  }}
                >
                  Score is below 80 — review issues to improve
                </div>
              </div>
              <ArrowRight
                size={14}
                color={t.ink50}
                strokeWidth={2}
                style={{ flexShrink: 0 }}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { t } = useTheme();
  const { org, usage, sites, loading, fetchUsage, fetchSites } = useAuth();
  var isClient = org?.role === "client";

  // Widget config state — re-renders when configurator changes
  var [widgetConfig, setWidgetConfig] = useState(loadWidgetConfig);
  var visibleWidgets = useMemo(
    function () {
      return widgetConfig.order.filter(function (id) {
        return widgetConfig.hidden.indexOf(id) === -1;
      });
    },
    [widgetConfig]
  );

  useEffect(() => {
    if (org) {
      fetchUsage();
      fetchSites(org.id);
    }
  }, [org?.id]);

  var siteList = sites || [];
  var scoredSites = siteList.filter(function (x) {
    return x.score != null;
  });
  var avg =
    scoredSites.length > 0
      ? Math.round(
          scoredSites.reduce(function (s, x) {
            return s + x.score;
          }, 0) / scoredSites.length
        )
      : null;

  var nearLimit =
    !isClient && usage && usage.scans_used >= usage.scans_limit * 0.8;
  var atLimit = !isClient && usage && usage.scans_used >= usage.scans_limit;

  // Named widget renderers
  var widgetRenderers = {
    stats: function () {
      return (
        <div key="stats" className="stats-grid">
          <Stat
            label="Sites"
            value={siteList.length}
            sub={
              siteList.filter(function (s) {
                return s.verified;
              }).length + " verified"
            }
          />
          <Stat
            label="Avg score"
            value={avg !== null && avg !== undefined ? avg : "\u2014"}
            accent={
              avg >= 80
                ? t.green
                : avg >= 50
                ? t.amber
                : avg != null
                ? t.red
                : t.ink50
            }
            sub="across all sites"
          />
          <Stat
            label="Plan"
            value={org?.plan || "free"}
            accent={t.accent}
            sub={
              usage
                ? usage.scans_used +
                  "/" +
                  (usage.scans_limit === 999 ? "\u221E" : usage.scans_limit) +
                  " scans used"
                : ""
            }
          />
        </div>
      );
    },

    quick_wins: function () {
      if (isClient) return null;
      return <QuickWins key="quick_wins" sites={siteList} t={t} />;
    },

    trends: function () {
      if (isClient) return null;
      return (
        <div key="trends">
          <IssueTrendsChart />
        </div>
      );
    },

    activity: function () {
      return (
        <div key="activity">
          <ActivityFeed />
        </div>
      );
    },

    sites: function () {
      return (
        <div key="sites">
          <h2 className="dash-section-title">Your sites</h2>

          {siteList.length === 0 ? (
            <div className="dash-empty">
              <p className="dash-empty__text">
                {isClient
                  ? "No sites have been shared with you yet."
                  : "No sites added yet."}
              </p>
              {!isClient && (
                <Link
                  to="/dashboard/sites?add=true"
                  className="dash-accent-link"
                  style={{ fontWeight: 600, fontSize: "0.88rem" }}
                >
                  Add a site
                </Link>
              )}
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              {siteList.map(function (site) {
                return (
                  <Link
                    key={site.id}
                    to={"/dashboard/sites/" + site.id}
                    className="site-row"
                  >
                    <div className="site-row__info">
                      <div
                        className="site-row__dot"
                        style={{
                          background: site.verified ? t.green : t.amber,
                        }}
                      />
                      <div>
                        <div className="site-row__name">
                          {site.display_name || site.domain}
                        </div>
                        <div className="site-row__domain">{site.domain}</div>
                      </div>
                    </div>
                    <div
                      className="site-row__score"
                      style={{
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
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    },
  };

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Dashboard</h1>
          <p className="dash-page-subtitle">Your accessibility overview.</p>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          {!isClient && <WidgetConfigurator onChange={setWidgetConfig} />}
          {!isClient && (
            <Link to="/dashboard/sites?add=true" className="dash-add-btn">
              <Plus size={15} strokeWidth={2.5} /> Add site
            </Link>
          )}
        </div>
      </div>

      {/* Non-reorderable contextual items — always at top */}
      {nearLimit && (
        <div
          className={
            "dash-warning" +
            (atLimit ? " dash-warning--red" : " dash-warning--amber")
          }
        >
          <AlertTriangle size={15} strokeWidth={2} />
          {atLimit
            ? "You've used all " + usage.scans_limit + " scans this month."
            : "You've used " +
              usage.scans_used +
              " of " +
              usage.scans_limit +
              " scans this month."}{" "}
          <Link
            to="/dashboard/billing"
            className="dash-accent-link"
            style={{ fontWeight: 600 }}
          >
            Upgrade
          </Link>
        </div>
      )}

      {/* Setup checklist — shows until all steps done or dismissed */}
      {!isClient && !loading && <SetupChecklist sites={siteList} />}

      {/* Chrome extension install banner — dismissible */}
      {!isClient && !loading && <ExtensionBanner t={t} />}

      {loading && !sites ? (
        <>
          <div className="stats-grid" style={{ marginBottom: "2rem" }}>
            {[1, 2, 3].map(function (i) {
              return (
                <div key={i} className="skeleton-card">
                  <div
                    className="skeleton"
                    style={{ width: "45%", height: 10, marginBottom: "0.6rem" }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "35%", height: 24, borderRadius: 6 }}
                  />
                </div>
              );
            })}
          </div>
          <div
            className="skeleton"
            style={{ width: 80, height: 14, marginBottom: "0.8rem" }}
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            {[1, 2].map(function (i) {
              return (
                <div
                  key={i}
                  className="skeleton-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
                    padding: "0.9rem 1.1rem",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "var(--ink08)",
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      className="skeleton"
                      style={{
                        width: "40%",
                        height: 12,
                        marginBottom: "0.3rem",
                      }}
                    />
                    <div
                      className="skeleton"
                      style={{ width: "25%", height: 10 }}
                    />
                  </div>
                  <div
                    className="skeleton"
                    style={{ width: 28, height: 18, borderRadius: 4 }}
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {visibleWidgets.map(function (widgetId) {
            var renderer = widgetRenderers[widgetId];
            if (!renderer) return null;
            return renderer();
          })}
        </>
      )}
    </div>
  );
}
