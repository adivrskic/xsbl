import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import {
  Play,
  Pause,
  RotateCcw,
  Check,
  AlertTriangle,
  TrendingUp,
  Zap,
  Shield,
  Eye,
  Type,
  MousePointer,
  FileText,
  Scan,
} from "lucide-react";

var WEEKS = [
  {
    label: "Week 1",
    score: 42,
    issues: { critical: 8, serious: 14, moderate: 17, minor: 8 },
    event: "First scan",
    detail: "47 issues found across 12 pages. Score: 42/100.",
    icon: Scan,
    action: null,
  },
  {
    label: "Week 2",
    score: 58,
    issues: { critical: 2, serious: 10, moderate: 14, minor: 5 },
    event: "Fixed critical issues",
    detail:
      "6 critical contrast failures and 2 missing button labels fixed via GitHub PR.",
    icon: AlertTriangle,
    action: "PR #14 merged — 8 critical fixes",
  },
  {
    label: "Week 3",
    score: 71,
    issues: { critical: 0, serious: 5, moderate: 9, minor: 4 },
    event: "AI fixes merged",
    detail:
      "AI-generated alt text for 12 images. 5 serious ARIA issues auto-fixed.",
    icon: Zap,
    action: "PR #17 merged — AI fix suggestions",
  },
  {
    label: "Week 4",
    score: 79,
    issues: { critical: 0, serious: 2, moderate: 7, minor: 3 },
    event: "Contrast + alt text",
    detail:
      "All color contrast now meets 4.5:1 AA. Remaining images captioned.",
    icon: Eye,
    action: "PR #21 merged — contrast + images",
  },
  {
    label: "Week 5",
    score: 85,
    issues: { critical: 0, serious: 1, moderate: 4, minor: 2 },
    event: "Heading structure",
    detail: "Heading hierarchy fixed across all pages. No more skipped levels.",
    icon: Type,
    action: "PR #24 merged — semantic headings",
  },
  {
    label: "Week 6",
    score: 91,
    issues: { critical: 0, serious: 0, moderate: 3, minor: 1 },
    event: "ARIA + keyboard",
    detail: "Custom dropdowns now keyboard navigable. ARIA roles corrected.",
    icon: MousePointer,
    action: "PR #27 merged — keyboard + ARIA",
  },
  {
    label: "Week 8",
    score: 95,
    issues: { critical: 0, serious: 0, moderate: 1, minor: 1 },
    event: "Near compliance",
    detail: "Only 2 minor issues remain. Accessibility statement generated.",
    icon: FileText,
    action: "Statement published",
  },
  {
    label: "Week 12",
    score: 98,
    issues: { critical: 0, serious: 0, moderate: 0, minor: 1 },
    event: "Monitoring mode",
    detail: "Scheduled weekly scans catching regressions. Score stable at 98.",
    icon: Shield,
    action: "Daily monitoring active",
  },
];

function totalIssues(w) {
  return (
    w.issues.critical + w.issues.serious + w.issues.moderate + w.issues.minor
  );
}

/* ── Score ring ── */
function ScoreRing({ score, prevScore, t }) {
  var radius = 64;
  var stroke = 8;
  var circ = 2 * Math.PI * radius;
  var offset = circ - (score / 100) * circ;
  var color = score >= 80 ? t.green : score >= 60 ? t.amber : t.red;
  var label =
    score >= 90
      ? "Excellent"
      : score >= 80
      ? "Good"
      : score >= 60
      ? "Needs work"
      : "Poor";
  var delta = score - prevScore;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={150} height={150} viewBox="0 0 150 150">
        {/* Background track */}
        <circle
          cx={75}
          cy={75}
          r={radius}
          fill="none"
          stroke={t.ink08}
          strokeWidth={stroke}
        />
        {/* Score arc */}
        <circle
          cx={75}
          cy={75}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          transform="rotate(-90 75 75)"
          style={{ transition: "stroke-dashoffset 0.8s ease, stroke 0.4s" }}
        />
        {/* Score number */}
        <text
          x={75}
          y={70}
          textAnchor="middle"
          fontFamily="var(--serif)"
          fontSize={36}
          fontWeight={700}
          fill={t.ink}
        >
          {Math.round(score)}
        </text>
        <text
          x={75}
          y={90}
          textAnchor="middle"
          fontFamily="var(--mono)"
          fontSize={10}
          fill={t.ink50}
        >
          /100
        </text>
      </svg>
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.66rem",
          fontWeight: 600,
          color: color,
          marginTop: "-0.2rem",
        }}
      >
        {label}
      </div>
      {delta !== 0 && (
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            fontWeight: 700,
            color: delta > 0 ? t.green : t.red,
            marginTop: "0.2rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.2rem",
          }}
        >
          {delta > 0 ? <TrendingUp size={11} /> : null}
          {delta > 0 ? "+" : ""}
          {delta} points
        </div>
      )}
    </div>
  );
}

/* ── Issue bars ── */
function IssueBars({ issues, maxTotal, t }) {
  var categories = [
    { key: "critical", label: "Critical", color: t.red },
    { key: "serious", label: "Serious", color: t.amber },
    { key: "moderate", label: "Moderate", color: t.accent },
    { key: "minor", label: "Minor", color: t.ink50 },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        flex: 1,
      }}
    >
      {categories.map(function (cat) {
        var count = issues[cat.key];
        var pct = maxTotal > 0 ? (count / maxTotal) * 100 : 0;
        return (
          <div key={cat.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                color: t.ink50,
                marginBottom: "0.15rem",
              }}
            >
              <span>{cat.label}</span>
              <span
                style={{
                  fontWeight: 700,
                  color: count > 0 ? cat.color : t.ink50,
                }}
              >
                {count}
              </span>
            </div>
            <div
              style={{
                height: 6,
                borderRadius: 3,
                background: t.ink04,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: 3,
                  background: cat.color,
                  width: pct + "%",
                  transition: "width 0.6s ease",
                  opacity: count > 0 ? 0.8 : 0.15,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Main component ── */
export default function ScoreTimeline() {
  var { t } = useTheme();
  var [step, setStep] = useState(0);
  var [playing, setPlaying] = useState(false);
  var intervalRef = useRef(null);

  var week = WEEKS[step];
  var prevScore = step > 0 ? WEEKS[step - 1].score : week.score;
  var maxIssues = totalIssues(WEEKS[0]);

  // Playback
  var advance = useCallback(function () {
    setStep(function (s) {
      if (s >= WEEKS.length - 1) {
        setPlaying(false);
        return s;
      }
      return s + 1;
    });
  }, []);

  useEffect(
    function () {
      if (playing) {
        intervalRef.current = setInterval(advance, 2200);
      } else {
        clearInterval(intervalRef.current);
      }
      return function () {
        clearInterval(intervalRef.current);
      };
    },
    [playing, advance]
  );

  var handlePlay = function () {
    if (step >= WEEKS.length - 1) setStep(0);
    setPlaying(true);
  };

  var handleReset = function () {
    setPlaying(false);
    setStep(0);
  };

  var Icon = week.icon;

  // Chart points up to current step
  var W = 560;
  var H = 140;
  var padL = 12;
  var padR = 12;
  var padT = 22;
  var padB = 8;
  var chartW = W - padL - padR;
  var chartH = H - padT - padB;

  var allPoints = WEEKS.map(function (w, i) {
    return {
      x: padL + (i / (WEEKS.length - 1)) * chartW,
      y: padT + chartH - ((w.score - 30) / 70) * chartH,
    };
  });

  var visiblePoints = allPoints.slice(0, step + 1);
  var pathD = visiblePoints
    .map(function (p, i) {
      return (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1);
    })
    .join(" ");

  var areaD =
    pathD +
    " L" +
    visiblePoints[visiblePoints.length - 1].x.toFixed(1) +
    "," +
    (padT + chartH) +
    " L" +
    visiblePoints[0].x.toFixed(1) +
    "," +
    (padT + chartH) +
    " Z";

  return (
    <div className="st-root">
      {/* Top row: score ring + issue bars + activity */}
      <div className="st-top">
        {/* Left: score ring */}
        <div className="st-score-col">
          <ScoreRing score={week.score} prevScore={prevScore} t={t} />
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              fontWeight: 600,
              color: t.ink50,
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            {totalIssues(week)} issues remaining
          </div>
        </div>

        {/* Middle: issue breakdown */}
        <div className="st-bars-col">
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "0.4rem",
            }}
          >
            Issue breakdown
          </div>
          <IssueBars issues={week.issues} maxTotal={maxIssues} t={t} />
        </div>

        {/* Right: activity card */}
        <div className="st-activity-col">
          <div
            key={step}
            className="st-activity-card"
            style={{
              borderColor: week.score >= 80 ? t.green + "30" : t.accent + "30",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                marginBottom: "0.4rem",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 7,
                  background: (week.score >= 80 ? t.green : t.accent) + "12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  size={14}
                  color={week.score >= 80 ? t.green : t.accent}
                  strokeWidth={2}
                />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                  }}
                >
                  {week.label}
                </div>
                <div
                  style={{ fontSize: "0.84rem", fontWeight: 600, color: t.ink }}
                >
                  {week.event}
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: "0.76rem",
                color: t.ink50,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              {week.detail}
            </p>
            {week.action && (
              <div
                style={{
                  marginTop: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  color: t.green,
                }}
              >
                <Check size={11} strokeWidth={2.5} />
                {week.action}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="st-chart">
        <svg
          viewBox={"0 0 " + W + " " + H}
          style={{ width: "100%", height: "auto", display: "block" }}
        >
          {/* Faint grid */}
          {[50, 70, 90].map(function (val) {
            var y = padT + chartH - ((val - 30) / 70) * chartH;
            return (
              <line
                key={val}
                x1={padL}
                x2={W - padR}
                y1={y}
                y2={y}
                stroke={t.ink08}
                strokeWidth={0.5}
                strokeDasharray="4 4"
              />
            );
          })}

          {/* Ghost line (full path, faint) */}
          <path
            d={allPoints
              .map(function (p, i) {
                return (
                  (i === 0 ? "M" : "L") + p.x.toFixed(1) + "," + p.y.toFixed(1)
                );
              })
              .join(" ")}
            fill="none"
            stroke={t.ink08}
            strokeWidth={1.5}
            strokeDasharray="4 4"
          />

          {/* Active area fill */}
          {visiblePoints.length > 1 && (
            <path
              d={areaD}
              fill={t.accent + "08"}
              style={{ transition: "d 0.6s" }}
            />
          )}

          {/* Active line */}
          <path
            d={pathD}
            fill="none"
            stroke={t.accent}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: "d 0.6s" }}
          />

          {/* All dots (ghost) */}
          {allPoints.map(function (p, i) {
            var past = i <= step;
            var current = i === step;
            return (
              <g
                key={i}
                style={{ cursor: "pointer" }}
                onClick={function () {
                  setStep(i);
                  setPlaying(false);
                }}
              >
                <circle cx={p.x} cy={p.y} r={12} fill="transparent" />
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={current ? 6 : past ? 4 : 3}
                  fill={current ? t.accent : past ? t.green : t.ink08}
                  stroke={current ? t.paper : "none"}
                  strokeWidth={current ? 2 : 0}
                  style={{ transition: "r 0.3s, fill 0.3s, cx 0s, cy 0s" }}
                />
                {current && (
                  <text
                    x={p.x}
                    y={p.y - 12}
                    textAnchor="middle"
                    fontFamily="var(--mono)"
                    fontSize={9}
                    fontWeight={700}
                    fill={t.accent}
                  >
                    {WEEKS[i].score}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Timeline scrubber + controls */}
      <div className="st-controls">
        <div className="st-playback">
          {playing ? (
            <button
              onClick={function () {
                setPlaying(false);
              }}
              className="st-play-btn"
              style={{ background: t.ink08, color: t.ink }}
            >
              <Pause size={14} strokeWidth={2} />
            </button>
          ) : (
            <button
              onClick={handlePlay}
              className="st-play-btn"
              style={{ background: t.accent, color: "white" }}
            >
              <Play size={14} strokeWidth={2} fill="white" />
            </button>
          )}
          <button
            onClick={handleReset}
            className="st-reset-btn"
            style={{ color: t.ink50 }}
          >
            <RotateCcw size={13} strokeWidth={2} />
          </button>
        </div>

        {/* Step dots */}
        <div className="st-dots">
          {WEEKS.map(function (w, i) {
            var past = i <= step;
            var current = i === step;
            return (
              <button
                key={i}
                onClick={function () {
                  setStep(i);
                  setPlaying(false);
                }}
                className={
                  "st-dot" +
                  (current ? " st-dot--current" : past ? " st-dot--past" : "")
                }
                title={w.label + " — " + w.event}
              >
                <span
                  className="st-dot__pip"
                  style={{
                    background: current ? t.accent : past ? t.green : t.ink20,
                    width: current ? 10 : 6,
                    height: current ? 10 : 6,
                  }}
                />
                <span
                  className="st-dot__label"
                  style={{
                    color: current ? t.accent : t.ink50,
                    fontWeight: current ? 700 : 400,
                  }}
                >
                  {w.label}
                </span>
              </button>
            );
          })}
        </div>

        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            textAlign: "center",
            marginTop: "0.2rem",
          }}
        >
          {playing ? "Playing…" : "Click dots or press play to step through"}
        </div>
      </div>

      <style>{`
        .st-root {
          padding: 1.5rem 0;
        }
        .st-top {
          display: grid;
          grid-template-columns: 180px 1fr 1fr;
          gap: 1.5rem;
          align-items: start;
          margin-bottom: 1.5rem;
          min-height: 210px;
        }
        .st-score-col {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .st-bars-col {
          padding-top: 0.2rem;
        }
        .st-activity-col {
          min-height: 180px;
        }
        .st-activity-card {
          padding: 1rem;
          border-radius: 10px;
          border: 1px solid ${t.ink08};
          background: ${t.cardBg};
          min-height: 160px;
          animation: st-fade-in 0.35s ease;
        }
        @keyframes st-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .st-chart {
          margin-bottom: 1rem;
          padding: 0.6rem 0.3rem;
          border-radius: 10px;
          background: ${t.cardBg};
          border: 1px solid ${t.ink08};
          overflow: visible;
        }
        .st-controls {
          text-align: center;
        }
        .st-playback {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          margin-bottom: 0.6rem;
        }
        .st-play-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: transform 0.15s;
        }
        .st-play-btn:hover { transform: scale(1.08); }
        .st-play-btn:active { transform: scale(0.95); }
        .st-reset-btn {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          border: 1px solid ${t.ink08};
          background: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .st-dots {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.15rem;
          margin-bottom: 0.3rem;
        }
        .st-dot {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.2rem;
          padding: 0.3rem 0.5rem;
          border: none;
          background: none;
          cursor: pointer;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .st-dot:hover { background: ${t.ink04}; }
        .st-dot__pip {
          border-radius: 50%;
          transition: all 0.3s ease;
          display: block;
        }
        .st-dot__label {
          font-family: var(--mono);
          font-size: 0.5rem;
          transition: color 0.2s;
        }
        @media (max-width: 700px) {
          .st-top {
            grid-template-columns: 1fr;
            gap: 1rem;
            min-height: auto;
          }
          .st-activity-col { min-height: auto; }
          .st-activity-card { min-height: auto; }
          .st-score-col { order: 1; }
          .st-bars-col { order: 2; }
          .st-activity-col { order: 3; }
          .st-dots { gap: 0; }
          .st-dot { padding: 0.3rem 0.3rem; }
        }
      `}</style>
    </div>
  );
}
