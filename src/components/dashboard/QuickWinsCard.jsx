import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Lightbulb,
  Sparkles,
  ChevronRight,
  X,
  Zap,
  ArrowRight,
} from "lucide-react";

/**
 * QuickWinsCard — shows the top 3 highest-impact fixable issues
 * after a scan completes. Prioritizes issues with AI fix suggestions,
 * then by severity. Designed to reduce time-to-first-fix by giving
 * users a clear, ordered action list instead of "explore the dashboard."
 *
 * Props:
 *   issues    — full issues array for the site
 *   onSelect  — (issue) => void — opens the issue detail modal
 *   siteId    — used for the dismiss key
 *   compact   — if true, render a smaller version for the overview page
 */

var DISMISS_PREFIX = "xsbl-quickwins-dismissed-";

function isDismissed(siteId) {
  try {
    return localStorage.getItem(DISMISS_PREFIX + siteId) === "1";
  } catch (e) {
    return false;
  }
}
function setDismissed(siteId) {
  try {
    localStorage.setItem(DISMISS_PREFIX + siteId, "1");
  } catch (e) {}
}

var IMPACT_ORDER = { critical: 0, serious: 1, moderate: 2, minor: 3 };

function pickQuickWins(issues, count) {
  var open = issues.filter(function (i) {
    return i.status === "open";
  });

  // Score each issue: fixable + high severity = best quick win
  var scored = open.map(function (i) {
    var hasFix = i.fix_suggestion ? 1 : 0;
    var severity = 4 - (IMPACT_ORDER[i.impact] || 3); // critical=4, serious=3, moderate=2, minor=1
    return { issue: i, score: hasFix * 10 + severity };
  });

  scored.sort(function (a, b) {
    return b.score - a.score;
  });

  // Deduplicate by rule_id — show one instance per unique rule
  var seen = {};
  var result = [];
  for (var i = 0; i < scored.length; i++) {
    var rule = scored[i].issue.rule_id;
    if (seen[rule]) continue;
    seen[rule] = true;
    result.push(scored[i].issue);
    if (result.length >= count) break;
  }

  return result;
}

export default function QuickWinsCard({ issues, onSelect, siteId, compact }) {
  var { t } = useTheme();
  var [hidden, setHidden] = useState(function () {
    return isDismissed(siteId);
  });

  if (hidden) return null;

  var wins = pickQuickWins(issues, 3);
  if (wins.length === 0) return null;

  var fixableCount = wins.filter(function (i) {
    return !!i.fix_suggestion;
  }).length;

  var impactColors = {
    critical: { bg: t.red + "12", text: t.red },
    serious: { bg: t.red + "0a", text: t.red },
    moderate: { bg: t.amber + "10", text: t.amber },
    minor: { bg: t.accent + "10", text: t.accent },
  };

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid " + t.green + "30",
        background: t.greenBg || t.green + "06",
        padding: compact ? "1rem" : "1.2rem 1.4rem",
        marginBottom: "1.5rem",
        position: "relative",
      }}
    >
      {/* Dismiss */}
      <button
        onClick={function () {
          setDismissed(siteId);
          setHidden(true);
        }}
        aria-label="Dismiss quick wins"
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: t.ink50,
          padding: "0.2rem",
          borderRadius: 4,
          display: "flex",
        }}
      >
        <X size={14} />
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: compact ? "0.5rem" : "0.7rem",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: t.green + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Zap size={15} color={t.green} strokeWidth={2.5} />
        </div>
        <div>
          <div
            style={{
              fontSize: compact ? "0.84rem" : "0.92rem",
              fontWeight: 700,
              color: t.ink,
              lineHeight: 1.2,
            }}
          >
            Fix these {wins.length} things first
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              color: t.ink50,
              marginTop: "0.1rem",
            }}
          >
            {fixableCount > 0
              ? fixableCount + " with AI fix ready"
              : "Biggest impact, least effort"}
          </div>
        </div>
      </div>

      {/* Quick win items */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
        }}
      >
        {wins.map(function (issue, idx) {
          var ic = impactColors[issue.impact] || impactColors.minor;
          var hasFix = !!issue.fix_suggestion;
          return (
            <button
              key={issue.id}
              onClick={function () {
                onSelect(issue);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: compact ? "0.55rem 0.7rem" : "0.7rem 0.9rem",
                borderRadius: 9,
                border: "1px solid " + t.ink08,
                background: t.cardBg,
                cursor: "pointer",
                textAlign: "left",
                width: "100%",
                transition: "all 0.15s",
              }}
              onMouseEnter={function (e) {
                e.currentTarget.style.borderColor = t.accent;
                e.currentTarget.style.boxShadow = "0 2px 8px " + t.ink08;
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.borderColor = t.ink08;
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Step number */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: t.accent,
                  color: "white",
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {idx + 1}
              </div>

              {/* Impact badge */}
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.52rem",
                  fontWeight: 700,
                  padding: "0.1rem 0.3rem",
                  borderRadius: 3,
                  background: ic.bg,
                  color: ic.text,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  flexShrink: 0,
                }}
              >
                {issue.impact}
              </span>

              {/* Description */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: compact ? "0.76rem" : "0.82rem",
                    fontWeight: 500,
                    color: t.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: 1.3,
                  }}
                >
                  {issue.description || issue.rule_id}
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                    marginTop: "0.1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span>{issue.rule_id}</span>
                  {hasFix && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.15rem",
                        color: t.green,
                        fontWeight: 600,
                      }}
                    >
                      <Sparkles size={8} strokeWidth={2.5} />
                      AI fix
                    </span>
                  )}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                size={14}
                color={t.ink50}
                style={{ flexShrink: 0 }}
              />
            </button>
          );
        })}
      </div>

      {/* "See all issues" link */}
      {issues.filter(function (i) {
        return i.status === "open";
      }).length > 3 && (
        <div
          style={{
            marginTop: "0.6rem",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
            }}
          >
            +
            {issues.filter(function (i) {
              return i.status === "open";
            }).length - wins.length}{" "}
            more open issues
          </span>
        </div>
      )}
    </div>
  );
}
