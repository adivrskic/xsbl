import { useTheme } from "../../context/ThemeContext";
import "../../styles/dashboard.css";

// Lightweight inline chart — no recharts dependency needed.
// Renders an SVG sparkline + area chart from scan history.

export default function ScoreChart({ scans }) {
  const { t } = useTheme();

  // Filter to completed scans with scores, oldest first
  const points = scans
    .filter((s) => s.status === "complete" && s.score != null)
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  if (points.length < 2) {
    return (
      <div className="dash-card dash-card--empty">
        <p style={{ color: "var(--ink50)", fontSize: "0.82rem" }}>
          Run at least 2 scans to see your score trend.
        </p>
      </div>
    );
  }

  const W = 500;
  const H = 140;
  const PAD = { top: 10, right: 10, bottom: 24, left: 36 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const minScore = Math.min(...points.map((p) => p.score));
  const maxScore = Math.max(...points.map((p) => p.score));
  const range = maxScore - minScore || 1;

  const getX = (i) => PAD.left + (i / (points.length - 1)) * chartW;
  const getY = (score) =>
    PAD.top + chartH - ((score - minScore) / range) * chartH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${getX(i)} ${getY(p.score)}`)
    .join(" ");

  const areaPath = `${linePath} L ${getX(points.length - 1)} ${
    PAD.top + chartH
  } L ${PAD.left} ${PAD.top + chartH} Z`;

  const scoreColor = (s) => (s >= 80 ? t.green : s >= 50 ? t.amber : t.red);
  const lastScore = points[points.length - 1].score;
  const firstScore = points[0].score;
  const trend = lastScore - firstScore;

  return (
    <div className="dash-card">
      <div className="dash-card__header">
        <div className="dash-card__label">Score trend</div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.2rem",
              fontWeight: 700,
              color: scoreColor(lastScore),
            }}
          >
            {Math.round(lastScore)}
          </span>
          {points.length >= 2 && (
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.65rem",
                fontWeight: 600,
                color: trend >= 0 ? t.green : t.red,
              }}
            >
              {trend >= 0 ? "+" : ""}
              {Math.round(trend)}
            </span>
          )}
        </div>
      </div>

      <svg
        width="100%"
        viewBox={`0 0 ${W} ${H}`}
        style={{ display: "block" }}
        role="img"
        aria-label={`Score trend chart from ${Math.round(
          firstScore
        )} to ${Math.round(lastScore)}, ${
          trend >= 0 ? "up" : "down"
        } ${Math.abs(Math.round(trend))} points`}
      >
        {/* Grid lines */}
        {[0, 25, 50, 75, 100]
          .filter((v) => v >= minScore - 5 && v <= maxScore + 5)
          .map((v) => (
            <g key={v}>
              <line
                x1={PAD.left}
                y1={getY(v)}
                x2={W - PAD.right}
                y2={getY(v)}
                stroke={t.ink08}
                strokeWidth={1}
              />
              <text
                x={PAD.left - 6}
                y={getY(v) + 3}
                textAnchor="end"
                fill={t.ink50}
                fontSize="8"
                fontFamily="var(--mono)"
              >
                {v}
              </text>
            </g>
          ))}

        {/* Area fill */}
        <path d={areaPath} fill={`${scoreColor(lastScore)}10`} />

        {/* Line */}
        <path
          d={linePath}
          fill="none"
          stroke={scoreColor(lastScore)}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={getX(i)}
            cy={getY(p.score)}
            r={3}
            fill={scoreColor(p.score)}
            stroke={t.cardBg}
            strokeWidth={1.5}
          />
        ))}

        {/* Date labels (first, last) */}
        <text
          x={PAD.left}
          y={H - 4}
          fontSize="7"
          fontFamily="var(--mono)"
          fill={t.ink50}
        >
          {new Date(points[0].created_at).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </text>
        <text
          x={W - PAD.right}
          y={H - 4}
          textAnchor="end"
          fontSize="7"
          fontFamily="var(--mono)"
          fill={t.ink50}
        >
          {new Date(points[points.length - 1].created_at).toLocaleDateString(
            undefined,
            { month: "short", day: "numeric" }
          )}
        </text>
      </svg>
    </div>
  );
}
