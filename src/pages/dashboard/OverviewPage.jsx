import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, AlertTriangle } from "lucide-react";
import IssueTrendsChart from "../../components/dashboard/IssueTrendsChart";
import SetupChecklist from "../../components/dashboard/SetupChecklist";
import ActivityFeed from "../../components/dashboard/ActivityFeed";
import QuickWinsCard from "../../components/dashboard/QuickWinsCard";
import WidgetConfigurator, {
  getVisibleWidgets,
} from "../../components/dashboard/WidgetConfigurator";
import { supabase } from "../../lib/supabase";
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

export default function OverviewPage() {
  const { t } = useTheme();
  const { org, usage, sites, loading, fetchUsage, fetchSites } = useAuth();
  const navigate = useNavigate();
  var isClient = org?.role === "client";

  // Widget layout config
  var [visibleWidgets, setVisibleWidgets] = useState(getVisibleWidgets);
  var handleWidgetUpdate = useCallback(function () {
    setVisibleWidgets(getVisibleWidgets());
  }, []);

  // Quick wins: fetch issues for the worst-scoring site
  var [quickWinSite, setQuickWinSite] = useState(null);
  var [quickWinIssues, setQuickWinIssues] = useState([]);

  useEffect(() => {
    if (org) {
      fetchUsage();
      fetchSites(org.id);
    }
  }, [org?.id]);

  // Find worst-scoring site with issues and fetch its open issues
  useEffect(
    function () {
      var siteList = sites || [];
      var scored = siteList
        .filter(function (s) {
          return s.score != null && s.score < 95;
        })
        .sort(function (a, b) {
          return a.score - b.score;
        });
      var target = scored.length > 0 ? scored[0] : null;
      if (!target || target.id === quickWinSite?.id) return;
      setQuickWinSite(target);
      supabase
        .from("issues")
        .select(
          "id, rule_id, impact, status, description, fix_suggestion, page_url, element_selector"
        )
        .eq("site_id", target.id)
        .eq("status", "open")
        .order("created_at", { ascending: false })
        .limit(50)
        .then(function (res) {
          setQuickWinIssues(res.data || []);
        });
    },
    [sites]
  );

  // Check if any site has a fixed issue (for onboarding checklist step 3)
  var [hasFixedIssue, setHasFixedIssue] = useState(false);
  useEffect(
    function () {
      var sl = sites || [];
      if (sl.length === 0) return;
      supabase
        .from("issues")
        .select("id")
        .in(
          "site_id",
          sl.map(function (s) {
            return s.id;
          })
        )
        .eq("status", "fixed")
        .limit(1)
        .then(function (res) {
          setHasFixedIssue(res.data && res.data.length > 0);
        });
    },
    [sites]
  );

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

  // ── Widget renderers ──
  function isVisible(id) {
    return visibleWidgets.indexOf(id) !== -1;
  }

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
      if (isClient || !quickWinSite || quickWinIssues.length === 0) return null;
      return (
        <div key="quick_wins" style={{ marginBottom: "0.5rem" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.4rem",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {quickWinSite.display_name || quickWinSite.domain}
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                fontWeight: 700,
                padding: "0.06rem 0.3rem",
                borderRadius: 3,
                background:
                  quickWinSite.score >= 80
                    ? t.green + "12"
                    : quickWinSite.score >= 50
                    ? t.amber + "12"
                    : t.red + "12",
                color:
                  quickWinSite.score >= 80
                    ? t.green
                    : quickWinSite.score >= 50
                    ? t.amber
                    : t.red,
              }}
            >
              {Math.round(quickWinSite.score)}
            </span>
          </div>
          <QuickWinsCard
            issues={quickWinIssues}
            siteId={quickWinSite.id}
            compact
            onSelect={function () {
              navigate("/dashboard/sites/" + quickWinSite.id + "?tab=issues");
            }}
          />
        </div>
      );
    },

    trends: function () {
      if (isClient) return null;
      return <IssueTrendsChart key="trends" />;
    },

    activity: function () {
      return <ActivityFeed key="activity" />;
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <WidgetConfigurator onUpdate={handleWidgetUpdate} />
          {!isClient && (
            <Link to="/dashboard/sites?add=true" className="dash-add-btn">
              <Plus size={15} strokeWidth={2.5} /> Add site
            </Link>
          )}
        </div>
      </div>

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

      {/* Setup checklist — always at top, not reorderable */}
      {!isClient && !loading && (
        <SetupChecklist sites={siteList} hasFixedIssue={hasFixedIssue} />
      )}

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
          {/* Render widgets in configured order */}
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
