import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { Plus, AlertTriangle } from "lucide-react";

function Stat({ label, value, sub, accent }) {
  const { t } = useTheme();
  return (
    <div
      style={{
        padding: "1.4rem 1.3rem",
        borderRadius: 12,
        border: `1px solid ${t.ink08}`,
        background: t.cardBg,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.64rem",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: t.ink50,
          marginBottom: "0.45rem",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: "2rem",
          fontWeight: 700,
          color: accent || t.ink,
          lineHeight: 1.1,
          marginBottom: "0.2rem",
        }}
      >
        {value}
      </div>
      {sub && <div style={{ fontSize: "0.75rem", color: t.ink50 }}>{sub}</div>}
    </div>
  );
}

export default function OverviewPage() {
  const { t } = useTheme();
  const { org, usage, sites, loading, fetchUsage, fetchSites } = useAuth();

  // Use cached data from AuthContext — only fetch if stale
  useEffect(() => {
    if (org) {
      fetchUsage();
      fetchSites(org.id);
    }
  }, [org?.id]);

  var siteList = sites || [];
  var avg =
    siteList.length > 0
      ? Math.round(
          siteList.reduce(function (s, x) {
            return s + (x.score || 0);
          }, 0) / siteList.length
        )
      : null;

  var nearLimit = usage && usage.scans_used >= usage.scans_limit * 0.8;
  var atLimit = usage && usage.scans_used >= usage.scans_limit;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.6rem",
              fontWeight: 700,
              color: t.ink,
              marginBottom: "0.3rem",
            }}
          >
            Dashboard
          </h1>
          <p style={{ color: t.ink50, fontSize: "0.88rem" }}>
            Your accessibility overview.
          </p>
        </div>
        <Link
          to="/dashboard/sites?add=true"
          style={{
            background: t.accent,
            color: "white",
            padding: "0.55rem 1.2rem",
            borderRadius: 8,
            fontSize: "0.85rem",
            fontWeight: 600,
            textDecoration: "none",
            fontFamily: "var(--body)",
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <Plus size={15} strokeWidth={2.5} /> Add site
        </Link>
      </div>

      {nearLimit && (
        <div
          style={{
            padding: "0.8rem 1rem",
            borderRadius: 8,
            marginBottom: "1.5rem",
            background: atLimit ? `${t.red}08` : `${t.amber}08`,
            border: `1px solid ${atLimit ? `${t.red}20` : `${t.amber}20`}`,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.84rem",
            color: atLimit ? t.red : t.amber,
          }}
        >
          <AlertTriangle size={15} strokeWidth={2} />
          {atLimit
            ? `You've used all ${usage.scans_limit} scans this month.`
            : `You've used ${usage.scans_used} of ${usage.scans_limit} scans this month.`}{" "}
          <Link
            to="/dashboard/billing"
            style={{ color: t.accent, fontWeight: 600, textDecoration: "none" }}
          >
            Upgrade
          </Link>
        </div>
      )}

      {loading && !sites ? (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.8rem",
              marginBottom: "2rem",
            }}
          >
            {[1, 2, 3].map(function (i) {
              return (
                <div
                  key={i}
                  style={{
                    padding: "1.3rem",
                    borderRadius: 12,
                    border: "1px solid " + t.ink04,
                    background: t.cardBg,
                  }}
                >
                  <div
                    style={{
                      width: "45%",
                      height: 10,
                      borderRadius: 4,
                      background: t.ink08,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      marginBottom: "0.6rem",
                    }}
                  />
                  <div
                    style={{
                      width: "35%",
                      height: 24,
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
            style={{
              width: 80,
              height: 14,
              borderRadius: 4,
              background: t.ink08,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
              marginBottom: "0.8rem",
            }}
          />
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}
          >
            {[1, 2].map(function (i) {
              return (
                <div
                  key={i}
                  style={{
                    padding: "0.9rem 1.1rem",
                    borderRadius: 10,
                    border: "1px solid " + t.ink04,
                    background: t.cardBg,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.8rem",
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
                        width: "40%",
                        height: 12,
                        borderRadius: 4,
                        background: t.ink08,
                        animation: "skeletonPulse 1.5s ease-in-out infinite",
                        marginBottom: "0.3rem",
                      }}
                    />
                    <div
                      style={{
                        width: "25%",
                        height: 10,
                        borderRadius: 4,
                        background: t.ink08,
                        animation: "skeletonPulse 1.5s ease-in-out infinite",
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
                    }}
                  />
                </div>
              );
            })}
          </div>
          <style>{`@keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }`}</style>
        </>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "0.8rem",
              marginBottom: "2.5rem",
            }}
          >
            <Stat
              label="Sites"
              value={siteList.length}
              sub={`${
                siteList.filter(function (s) {
                  return s.verified;
                }).length
              } verified`}
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
                  ? `${usage.scans_used}/${
                      usage.scans_limit === 999 ? "\u221E" : usage.scans_limit
                    } scans used`
                  : ""
              }
            />
          </div>

          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: t.ink,
              marginBottom: "1rem",
            }}
          >
            Your sites
          </h2>

          {siteList.length === 0 ? (
            <div
              style={{
                padding: "3rem 2rem",
                borderRadius: 12,
                border: `1px dashed ${t.ink20}`,
                textAlign: "center",
              }}
            >
              <p
                style={{
                  color: t.ink50,
                  fontSize: "0.92rem",
                  marginBottom: "1rem",
                }}
              >
                No sites added yet.
              </p>
              <Link
                to="/dashboard/sites?add=true"
                style={{
                  color: t.accent,
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  textDecoration: "none",
                }}
              >
                Add a site
              </Link>
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
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem 1.2rem",
                      borderRadius: 10,
                      border: "1px solid " + t.ink08,
                      background: t.cardBg,
                      textDecoration: "none",
                      transition: "border-color 0.2s",
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.borderColor = t.accent;
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.borderColor = t.ink08;
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.8rem",
                      }}
                    >
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: site.verified ? t.green : t.amber,
                        }}
                      />
                      <div>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.88rem",
                            color: t.ink,
                          }}
                        >
                          {site.display_name || site.domain}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.72rem",
                            color: t.ink50,
                          }}
                        >
                          {site.domain}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "1rem",
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
                  </Link>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
