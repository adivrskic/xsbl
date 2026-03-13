import { HelpCircle, X } from "lucide-react";

export default function ScoreExplainerModal({
  t,
  score,
  issues,
  scans,
  onClose,
}) {
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
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        {path}
                        {pg.carried_forward && (
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.42rem",
                              fontWeight: 700,
                              padding: "0.04rem 0.25rem",
                              borderRadius: 3,
                              background: t.accent + "12",
                              color: t.accent,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              flexShrink: 0,
                            }}
                          >
                            cached
                          </span>
                        )}
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
