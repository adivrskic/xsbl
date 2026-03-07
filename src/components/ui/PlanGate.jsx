import { useTheme } from "../../context/ThemeContext";
import { Lock } from "lucide-react";
import { Link } from "react-router-dom";

var PLAN_ORDER = ["free", "starter", "pro", "agency"];

/*
  PlanGate — wraps a feature and shows an upgrade prompt if the
  user's plan is below the required tier.

  Props:
    currentPlan  — "free" | "starter" | "pro" | "agency"
    requiredPlan — minimum plan needed (e.g. "starter", "pro")
    feature      — display name ("Accessibility simulator", "PDF reports", etc.)
    children     — the gated content (rendered only when unlocked)
    compact      — if true, renders a small inline lock badge instead of a card
*/
export default function PlanGate({
  currentPlan,
  requiredPlan,
  feature,
  children,
  compact,
}) {
  var currentIdx = PLAN_ORDER.indexOf(currentPlan || "free");
  var requiredIdx = PLAN_ORDER.indexOf(requiredPlan || "pro");

  if (currentIdx >= requiredIdx) return children;

  var { t } = useTheme();

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          padding: "0.3rem 0.6rem",
          borderRadius: 6,
          border: "1px solid " + t.ink08,
          background: t.ink04,
          color: t.ink50,
          fontFamily: "var(--mono)",
          fontSize: "0.6rem",
          fontWeight: 600,
          cursor: "default",
          opacity: 0.7,
        }}
        title={feature + " requires " + requiredPlan + " plan or higher"}
      >
        <Lock size={10} /> {feature}
        <span style={{ color: t.accent, textTransform: "capitalize" }}>
          {requiredPlan}+
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Blurred preview of children */}
      <div
        style={{
          filter: "blur(3px)",
          opacity: 0.25,
          pointerEvents: "none",
          userSelect: "none",
          maxHeight: 120,
          overflow: "hidden",
        }}
        aria-hidden="true"
      >
        {children}
      </div>

      {/* Upgrade overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.4rem",
          background: t.cardBg + "e0",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: t.ink04,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.2rem",
          }}
        >
          <Lock size={15} color={t.ink50} />
        </div>
        <div
          style={{
            fontSize: "0.82rem",
            fontWeight: 600,
            color: t.ink,
            textAlign: "center",
          }}
        >
          {feature}
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: t.ink50,
            textAlign: "center",
            lineHeight: 1.5,
          }}
        >
          Available on{" "}
          <span
            style={{
              color: t.accent,
              fontWeight: 600,
              textTransform: "capitalize",
            }}
          >
            {requiredPlan}
          </span>{" "}
          plan and above
        </div>
        <Link
          to="/dashboard/billing"
          style={{
            marginTop: "0.3rem",
            padding: "0.35rem 0.9rem",
            borderRadius: 6,
            background: t.accent,
            color: "white",
            fontSize: "0.72rem",
            fontWeight: 600,
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
