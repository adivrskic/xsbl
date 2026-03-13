import { useState, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  X,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  Plus,
  Check,
  AlertTriangle,
  ChevronDown,
} from "lucide-react";

/**
 * ScanCompare — comparative diff between two accessibility scans.
 *
 * How it works:
 *   For each issue, we determine if it was "active" at each scan's completion time
 *   by checking created_at vs resolved_at timestamps. Then we classify:
 *   - New:        active in B but not A (appeared between the two scans)
 *   - Fixed:      active in A but not B (resolved between the two scans)
 *   - Persistent: active in both A and B (still open)
 *
 * Issue fingerprint = rule_id + page_url + normalizeSelector(element_selector) (fuzzy match across scans)
 */

function normalizeSelector(selector) {
  if (!selector) return "";
  return selector
    .replace(/__[a-zA-Z0-9]{5,}/g, "__*")
    .replace(/\.sc-[a-zA-Z0-9]{6,}/g, ".sc-*")
    .replace(/\.css-[a-zA-Z0-9-]+/g, ".css-*")
    .replace(/\.emotion-[a-zA-Z0-9]+/g, ".emotion-*")
    .replace(/\.\[[^\]]+\]/g, ".[*]")
    .replace(/#([a-zA-Z_-]+?)[-_](\d+)([-_][a-zA-Z_-]+)?/g, "#$1-*$3")
    .replace(/#([a-zA-Z_-]+?)[-:][:a-zA-Z0-9]+:/g, "#$1-*")
    .replace(/#[a-f0-9]{6,}(?=[\s>+~.#\[:,]|$)/gi, "#*")
    .replace(/\[data-v-[a-zA-Z0-9]+\]/g, "[data-v-*]")
    .replace(/\[data-reactid="[^"]*"\]/g, '[data-reactid="*"]')
    .trim();
}

function fingerprint(issue) {
  return (
    (issue.rule_id || "") +
    "||" +
    (issue.page_url || "") +
    "||" +
    normalizeSelector(issue.element_selector)
  );
}

function wasActiveAt(issue, scanCompletedAt) {
  if (!scanCompletedAt) return false;
  var scanTime = new Date(scanCompletedAt).getTime();
  var createdTime = new Date(issue.created_at).getTime();

  // Issue didn't exist yet at scan time
  if (createdTime > scanTime) return false;

  // Issue is still open → active at any time after creation
  if (issue.status === "open") return true;

  // Issue was resolved — check if it was resolved AFTER scan time
  if (issue.resolved_at) {
    return new Date(issue.resolved_at).getTime() > scanTime;
  }

  // No resolved_at but status is not open — conservatively say it was active
  // (handles manually status-changed issues without resolved_at)
  return true;
}

function ImpactDot({ impact, t }) {
  var color =
    impact === "critical" || impact === "serious"
      ? t.red
      : impact === "moderate"
      ? t.amber
      : t.accent;
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.55rem",
        fontWeight: 600,
        padding: "0.1rem 0.35rem",
        borderRadius: 3,
        background: color + "15",
        color: color,
        textTransform: "uppercase",
        letterSpacing: "0.03em",
      }}
    >
      {impact}
    </span>
  );
}

function DiffSection({ title, icon, iconColor, items, t, defaultOpen }) {
  var [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <div style={{ marginBottom: "1rem" }}>
      <button
        onClick={function () {
          setOpen(!open);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          padding: "0.6rem 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: t.ink,
          fontFamily: "var(--body)",
          textAlign: "left",
        }}
      >
        {icon}
        <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{title}</span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            fontWeight: 700,
            padding: "0.1rem 0.4rem",
            borderRadius: 4,
            background: iconColor + "15",
            color: iconColor,
          }}
        >
          {items.length}
        </span>
        <ChevronDown
          size={14}
          color={t.ink50}
          style={{
            marginLeft: "auto",
            transform: open ? "rotate(180deg)" : "rotate(0)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {open && (
        <div
          style={{
            borderRadius: 8,
            border: "1px solid " + t.ink08,
            overflow: "hidden",
          }}
        >
          {items.map(function (issue, i) {
            return (
              <div
                key={issue.id || i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.55rem 0.8rem",
                  background: t.cardBg,
                  borderTop: i > 0 ? "1px solid " + t.ink04 : "none",
                  fontSize: "0.78rem",
                }}
              >
                <ImpactDot impact={issue.impact} t={t} />
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.66rem",
                    color: t.accent,
                    fontWeight: 600,
                    width: 120,
                    flexShrink: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {issue.rule_id}
                </span>
                <span
                  style={{
                    flex: 1,
                    color: t.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {issue.description}
                </span>
                {issue.page_url && (
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.58rem",
                      color: t.ink50,
                      maxWidth: 140,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {issue.page_url
                      .replace(/^https?:\/\/[^/]+/, "")
                      .replace(/\/$/, "") || "/"}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, sub, color, t }) {
  return (
    <div
      style={{
        padding: "0.8rem 1rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        textAlign: "center",
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.52rem",
          fontWeight: 600,
          color: t.ink50,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "0.2rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.3rem",
          fontWeight: 700,
          color: color || t.ink,
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.56rem",
            color: t.ink50,
            marginTop: "0.15rem",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export default function ScanCompare({ scans, issues, onClose }) {
  var { t } = useTheme();

  var completedScans = scans.filter(function (s) {
    return s.status === "complete" && s.completed_at;
  });

  var [scanAId, setScanAId] = useState(
    completedScans.length >= 2 ? completedScans[1].id : null
  );
  var [scanBId, setScanBId] = useState(
    completedScans.length >= 1 ? completedScans[0].id : null
  );

  var scanA = completedScans.find(function (s) {
    return s.id === scanAId;
  });
  var scanB = completedScans.find(function (s) {
    return s.id === scanBId;
  });

  // Compute diff
  var diff = useMemo(
    function () {
      if (!scanA || !scanB) return null;

      // Ensure A is older than B
      var a = scanA;
      var b = scanB;
      if (
        new Date(a.completed_at).getTime() > new Date(b.completed_at).getTime()
      ) {
        var tmp = a;
        a = b;
        b = tmp;
      }

      // Build active sets at each scan's completion time
      var activeAtA = {};
      var activeAtB = {};

      for (var i = 0; i < issues.length; i++) {
        var iss = issues[i];
        var fp = fingerprint(iss);

        if (wasActiveAt(iss, a.completed_at)) {
          // Keep the most recently created instance for display
          if (
            !activeAtA[fp] ||
            new Date(iss.created_at) > new Date(activeAtA[fp].created_at)
          ) {
            activeAtA[fp] = iss;
          }
        }

        if (wasActiveAt(iss, b.completed_at)) {
          if (
            !activeAtB[fp] ||
            new Date(iss.created_at) > new Date(activeAtB[fp].created_at)
          ) {
            activeAtB[fp] = iss;
          }
        }
      }

      var newIssues = [];
      var fixedIssues = [];
      var persistentIssues = [];

      // Issues in B but not A → new
      var fpKeysB = Object.keys(activeAtB);
      for (var bi = 0; bi < fpKeysB.length; bi++) {
        if (!activeAtA[fpKeysB[bi]]) {
          newIssues.push(activeAtB[fpKeysB[bi]]);
        } else {
          persistentIssues.push(activeAtB[fpKeysB[bi]]);
        }
      }

      // Issues in A but not B → fixed
      var fpKeysA = Object.keys(activeAtA);
      for (var ai = 0; ai < fpKeysA.length; ai++) {
        if (!activeAtB[fpKeysA[ai]]) {
          fixedIssues.push(activeAtA[fpKeysA[ai]]);
        }
      }

      // Sort by impact
      var impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
      var byImpact = function (x, y) {
        return (impactOrder[x.impact] || 4) - (impactOrder[y.impact] || 4);
      };
      newIssues.sort(byImpact);
      fixedIssues.sort(byImpact);
      persistentIssues.sort(byImpact);

      // Impact breakdowns
      function countByImpact(arr) {
        var counts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
        for (var ci = 0; ci < arr.length; ci++) {
          counts[arr[ci].impact] = (counts[arr[ci].impact] || 0) + 1;
        }
        return counts;
      }

      return {
        scanA: a,
        scanB: b,
        scoreA: a.score != null ? Math.round(a.score) : null,
        scoreB: b.score != null ? Math.round(b.score) : null,
        scoreDelta:
          a.score != null && b.score != null
            ? Math.round(b.score) - Math.round(a.score)
            : null,
        totalA: Object.keys(activeAtA).length,
        totalB: Object.keys(activeAtB).length,
        newIssues: newIssues,
        fixedIssues: fixedIssues,
        persistentIssues: persistentIssues,
        newByImpact: countByImpact(newIssues),
        fixedByImpact: countByImpact(fixedIssues),
      };
    },
    [scanA, scanB, issues]
  );

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 680,
          maxHeight: "90vh",
          borderRadius: 16,
          background: t.paper,
          border: "1px solid " + t.ink08,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderBottom: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.15rem",
                fontWeight: 700,
                color: t.ink,
                margin: 0,
              }}
            >
              Compare scans
            </h2>
            <p
              style={{
                fontFamily: "var(--body)",
                fontSize: "0.76rem",
                color: t.ink50,
                margin: "0.15rem 0 0",
              }}
            >
              See what changed between two scans.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comparison"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.ink50,
              padding: "0.3rem",
              borderRadius: 6,
              display: "flex",
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Scan pickers */}
        <div
          style={{
            padding: "1rem 1.4rem",
            borderBottom: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            flexShrink: 0,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: 180 }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.52rem",
                fontWeight: 600,
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.3rem",
              }}
            >
              Baseline (older)
            </div>
            <select
              value={scanAId || ""}
              onChange={function (e) {
                setScanAId(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "0.45rem 0.7rem",
                borderRadius: 7,
                border: "1.5px solid " + t.ink08,
                background: t.cardBg,
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.8rem",
                outline: "none",
              }}
            >
              <option value="">Select scan...</option>
              {completedScans.map(function (s) {
                return (
                  <option key={s.id} value={s.id} disabled={s.id === scanBId}>
                    {formatDate(s.completed_at)} — Score{" "}
                    {s.score != null ? Math.round(s.score) : "—"} (
                    {s.issues_found || 0} issues)
                  </option>
                );
              })}
            </select>
          </div>

          <ArrowRight
            size={18}
            color={t.ink50}
            style={{ flexShrink: 0, marginTop: "1rem" }}
          />

          <div style={{ flex: 1, minWidth: 180 }}>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.52rem",
                fontWeight: 600,
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                marginBottom: "0.3rem",
              }}
            >
              Comparison (newer)
            </div>
            <select
              value={scanBId || ""}
              onChange={function (e) {
                setScanBId(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "0.45rem 0.7rem",
                borderRadius: 7,
                border: "1.5px solid " + t.ink08,
                background: t.cardBg,
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.8rem",
                outline: "none",
              }}
            >
              <option value="">Select scan...</option>
              {completedScans.map(function (s) {
                return (
                  <option key={s.id} value={s.id} disabled={s.id === scanAId}>
                    {formatDate(s.completed_at)} — Score{" "}
                    {s.score != null ? Math.round(s.score) : "—"} (
                    {s.issues_found || 0} issues)
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Diff content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.2rem 1.4rem",
          }}
        >
          {!diff ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 1rem",
                color: t.ink50,
                fontSize: "0.88rem",
              }}
            >
              {completedScans.length < 2
                ? "You need at least 2 completed scans to compare."
                : "Select two scans above to see the diff."}
            </div>
          ) : (
            <>
              {/* Score delta hero */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1.2rem",
                  marginBottom: "1.5rem",
                  padding: "1rem",
                  borderRadius: 12,
                  background:
                    diff.scoreDelta != null
                      ? diff.scoreDelta > 0
                        ? t.greenBg
                        : diff.scoreDelta < 0
                        ? t.red + "08"
                        : t.ink04
                      : t.ink04,
                  border:
                    "1px solid " +
                    (diff.scoreDelta != null
                      ? diff.scoreDelta > 0
                        ? t.green + "20"
                        : diff.scoreDelta < 0
                        ? t.red + "20"
                        : t.ink08
                      : t.ink08),
                }}
              >
                {/* Score A */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.5rem",
                      fontWeight: 600,
                      color: t.ink50,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Baseline
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color:
                        diff.scoreA != null
                          ? diff.scoreA >= 80
                            ? t.green
                            : diff.scoreA >= 50
                            ? t.amber
                            : t.red
                          : t.ink50,
                      lineHeight: 1,
                    }}
                  >
                    {diff.scoreA != null ? diff.scoreA : "—"}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.56rem",
                      color: t.ink50,
                      marginTop: "0.2rem",
                    }}
                  >
                    {diff.totalA} issues
                  </div>
                </div>

                {/* Arrow + delta */}
                <div style={{ textAlign: "center" }}>
                  {diff.scoreDelta != null ? (
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          justifyContent: "center",
                        }}
                      >
                        {diff.scoreDelta > 0 ? (
                          <TrendingUp
                            size={18}
                            color={t.green}
                            strokeWidth={2.5}
                          />
                        ) : diff.scoreDelta < 0 ? (
                          <TrendingDown
                            size={18}
                            color={t.red}
                            strokeWidth={2.5}
                          />
                        ) : (
                          <Minus size={18} color={t.ink50} strokeWidth={2.5} />
                        )}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--serif)",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color:
                            diff.scoreDelta > 0
                              ? t.green
                              : diff.scoreDelta < 0
                              ? t.red
                              : t.ink50,
                          marginTop: "0.15rem",
                        }}
                      >
                        {diff.scoreDelta > 0 ? "+" : ""}
                        {diff.scoreDelta}
                      </div>
                    </>
                  ) : (
                    <ArrowRight size={18} color={t.ink50} />
                  )}
                </div>

                {/* Score B */}
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.5rem",
                      fontWeight: 600,
                      color: t.ink50,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      marginBottom: "0.2rem",
                    }}
                  >
                    Comparison
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1.8rem",
                      fontWeight: 700,
                      color:
                        diff.scoreB != null
                          ? diff.scoreB >= 80
                            ? t.green
                            : diff.scoreB >= 50
                            ? t.amber
                            : t.red
                          : t.ink50,
                      lineHeight: 1,
                    }}
                  >
                    {diff.scoreB != null ? diff.scoreB : "—"}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.56rem",
                      color: t.ink50,
                      marginTop: "0.2rem",
                    }}
                  >
                    {diff.totalB} issues
                  </div>
                </div>
              </div>

              {/* Summary stat boxes */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "0.6rem",
                  marginBottom: "1.5rem",
                }}
              >
                <StatBox
                  label="Fixed"
                  value={diff.fixedIssues.length}
                  sub={
                    diff.fixedByImpact.critical > 0
                      ? diff.fixedByImpact.critical + " critical"
                      : null
                  }
                  color={diff.fixedIssues.length > 0 ? t.green : t.ink50}
                  t={t}
                />
                <StatBox
                  label="New"
                  value={diff.newIssues.length}
                  sub={
                    diff.newByImpact.critical > 0
                      ? diff.newByImpact.critical + " critical"
                      : null
                  }
                  color={diff.newIssues.length > 0 ? t.red : t.ink50}
                  t={t}
                />
                <StatBox
                  label="Persistent"
                  value={diff.persistentIssues.length}
                  color={t.ink50}
                  t={t}
                />
              </div>

              {/* Issue lists */}
              {diff.fixedIssues.length === 0 &&
                diff.newIssues.length === 0 &&
                diff.persistentIssues.length === 0 && (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: t.ink50,
                      fontSize: "0.88rem",
                    }}
                  >
                    No issue data available for these scans.
                  </div>
                )}

              <DiffSection
                title="Fixed issues"
                icon={<Check size={15} color={t.green} strokeWidth={2.5} />}
                iconColor={t.green}
                items={diff.fixedIssues}
                t={t}
                defaultOpen={true}
              />

              <DiffSection
                title="New issues"
                icon={<Plus size={15} color={t.red} strokeWidth={2.5} />}
                iconColor={t.red}
                items={diff.newIssues}
                t={t}
                defaultOpen={true}
              />

              <DiffSection
                title="Persistent issues"
                icon={
                  <AlertTriangle size={14} color={t.amber} strokeWidth={2} />
                }
                iconColor={t.amber}
                items={diff.persistentIssues}
                t={t}
                defaultOpen={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
