import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

/*
  IssueTrendsChart — SVG bar chart showing issues opened vs fixed
  per week over the last 12 weeks. Placed on the Overview page.
*/

function weekStart(date) {
  var d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

function formatWeekLabel(dateStr) {
  var d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function IssueTrendsChart() {
  var { t } = useTheme();
  var { org } = useAuth();
  var [weeks, setWeeks] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!org) return;
      setLoading(true);

      var now = new Date();
      var twelveWeeksAgo = new Date(
        now.getTime() - 12 * 7 * 24 * 60 * 60 * 1000
      );
      var cutoff = twelveWeeksAgo.toISOString();

      // Build empty week buckets
      var buckets = {};
      for (var i = 11; i >= 0; i--) {
        var d = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        var key = weekStart(d);
        buckets[key] = { week: key, opened: 0, fixed: 0 };
      }

      // Fetch all site IDs for this org
      supabase
        .from("sites")
        .select("id")
        .eq("org_id", org.id)
        .then(function (sitesRes) {
          var siteIds = (sitesRes.data || []).map(function (s) {
            return s.id;
          });
          if (siteIds.length === 0) {
            setWeeks(Object.values(buckets));
            setLoading(false);
            return;
          }

          // Fetch issues created in range (opened)
          var openedP = supabase
            .from("issues")
            .select("created_at")
            .in("site_id", siteIds)
            .gte("created_at", cutoff);

          // Fetch issues that were fixed in range (status=fixed, updated in range)
          var fixedP = supabase
            .from("issues")
            .select("updated_at")
            .in("site_id", siteIds)
            .eq("status", "fixed")
            .gte("updated_at", cutoff);

          Promise.all([openedP, fixedP]).then(function (results) {
            var openedData = results[0].data || [];
            var fixedData = results[1].data || [];

            openedData.forEach(function (i) {
              var key = weekStart(i.created_at);
              if (buckets[key]) buckets[key].opened++;
            });

            fixedData.forEach(function (i) {
              var key = weekStart(i.updated_at);
              if (buckets[key]) buckets[key].fixed++;
            });

            setWeeks(Object.values(buckets));
            setLoading(false);
          });
        });
    },
    [org?.id]
  );

  if (loading) {
    return (
      <div
        style={{
          padding: "1.2rem",
          borderRadius: 10,
          border: "1px solid " + t.ink08,
          background: t.cardBg,
          textAlign: "center",
        }}
      >
        <Loader2
          size={18}
          className="xsbl-spin"
          color={t.accent}
          style={{ margin: "1rem 0" }}
        />
      </div>
    );
  }

  var hasData = weeks.some(function (w) {
    return w.opened > 0 || w.fixed > 0;
  });

  if (!hasData) return null;

  // Chart dimensions
  var W = 680;
  var H = 180;
  var padLeft = 30;
  var padRight = 10;
  var padTop = 10;
  var padBottom = 36;
  var chartW = W - padLeft - padRight;
  var chartH = H - padTop - padBottom;
  var barGroupW = chartW / weeks.length;
  var barW = Math.min(barGroupW * 0.35, 14);
  var gap = 2;

  var maxVal = 1;
  weeks.forEach(function (w) {
    if (w.opened > maxVal) maxVal = w.opened;
    if (w.fixed > maxVal) maxVal = w.fixed;
  });
  // Round up to nice number
  if (maxVal <= 5) maxVal = 5;
  else if (maxVal <= 10) maxVal = 10;
  else maxVal = Math.ceil(maxVal / 5) * 5;

  // Trend calculation
  var recent = weeks.slice(-4);
  var earlier = weeks.slice(0, 4);
  var recentOpened = recent.reduce(function (s, w) {
    return s + w.opened;
  }, 0);
  var earlierOpened = earlier.reduce(function (s, w) {
    return s + w.opened;
  }, 0);
  var recentFixed = recent.reduce(function (s, w) {
    return s + w.fixed;
  }, 0);
  var totalOpened = weeks.reduce(function (s, w) {
    return s + w.opened;
  }, 0);
  var totalFixed = weeks.reduce(function (s, w) {
    return s + w.fixed;
  }, 0);

  var trendIcon = Minus;
  var trendColor = t.ink50;
  var trendText = "Stable";
  if (recentOpened < earlierOpened && recentFixed >= earlierOpened * 0.5) {
    trendIcon = TrendingDown;
    trendColor = t.green;
    trendText = "Improving";
  } else if (recentOpened > earlierOpened * 1.3) {
    trendIcon = TrendingUp;
    trendColor = t.red;
    trendText = "Rising";
  }
  var TrendIcon = trendIcon;

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
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.8rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: t.ink50,
              marginBottom: "0.15rem",
            }}
          >
            Issue trends
          </div>
          <div
            style={{
              fontSize: "0.82rem",
              fontWeight: 600,
              color: t.ink,
            }}
          >
            Last 12 weeks
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          {/* Legend */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              color: t.ink50,
            }}
          >
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: t.red,
                  display: "inline-block",
                }}
              />
              Opened ({totalOpened})
            </span>
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: t.green,
                  display: "inline-block",
                }}
              />
              Fixed ({totalFixed})
            </span>
          </div>

          {/* Trend badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.15rem 0.4rem",
              borderRadius: 4,
              background: trendColor + "12",
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              color: trendColor,
            }}
          >
            <TrendIcon size={11} />
            {trendText}
          </div>
        </div>
      </div>

      {/* SVG chart */}
      <svg
        viewBox={"0 0 " + W + " " + H}
        style={{ width: "100%", height: "auto", display: "block" }}
      >
        {/* Y-axis grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map(function (frac) {
          var y = padTop + chartH * (1 - frac);
          var val = Math.round(maxVal * frac);
          return (
            <g key={frac}>
              <line
                x1={padLeft}
                x2={W - padRight}
                y1={y}
                y2={y}
                stroke={t.ink08}
                strokeWidth={1}
              />
              <text
                x={padLeft - 6}
                y={y + 3}
                textAnchor="end"
                fill={t.ink50}
                fontSize={8}
                fontFamily="var(--mono)"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {weeks.map(function (w, i) {
          var cx = padLeft + barGroupW * i + barGroupW / 2;
          var openedH = maxVal > 0 ? (w.opened / maxVal) * chartH : 0;
          var fixedH = maxVal > 0 ? (w.fixed / maxVal) * chartH : 0;

          return (
            <g key={i}>
              {/* Opened bar (left) */}
              <rect
                x={cx - barW - gap / 2}
                y={padTop + chartH - openedH}
                width={barW}
                height={Math.max(openedH, 0)}
                rx={2}
                fill={t.red}
                opacity={0.8}
              />
              {/* Fixed bar (right) */}
              <rect
                x={cx + gap / 2}
                y={padTop + chartH - fixedH}
                width={barW}
                height={Math.max(fixedH, 0)}
                rx={2}
                fill={t.green}
                opacity={0.8}
              />
              {/* Week label */}
              <text
                x={cx}
                y={H - padBottom + 14}
                textAnchor="middle"
                fill={t.ink50}
                fontSize={7.5}
                fontFamily="var(--mono)"
              >
                {formatWeekLabel(w.week)}
              </text>
              {/* Hover target with tooltip values */}
              <title>
                {formatWeekLabel(w.week)}: {w.opened} opened, {w.fixed} fixed
              </title>
              <rect
                x={cx - barGroupW / 2}
                y={padTop}
                width={barGroupW}
                height={chartH}
                fill="transparent"
              />
            </g>
          );
        })}
      </svg>

      <style>{`
        @keyframes xsbl-spin { to { transform: rotate(360deg); } }
        .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
      `}</style>
    </div>
  );
}
