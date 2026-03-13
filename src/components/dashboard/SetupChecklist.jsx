import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import {
  Check,
  Circle,
  Globe,
  ShieldCheck,
  Play,
  X,
  Rocket,
  Wrench,
} from "lucide-react";

/**
 * SetupChecklist — shows a persistent onboarding progress widget
 * on the dashboard Overview until the user completes all steps or dismisses it.
 *
 * Reads state from org/sites (already fetched in AuthContext) — no extra DB calls.
 */

var DISMISS_KEY = "xsbl-checklist-dismissed";

function isDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch (e) {
    return false;
  }
}
function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, "1");
  } catch (e) {}
}

function getSteps(sites, hasFixedIssue) {
  var siteList = sites || [];
  var hasSite = siteList.length > 0;
  var hasVerified = siteList.some(function (s) {
    return s.verified;
  });
  var hasScanned = siteList.some(function (s) {
    return s.score != null;
  });
  var firstSiteId = hasSite ? siteList[0].id : null;

  return [
    {
      id: "add-site",
      label: "Add your first site",
      description: "Enter a domain to start monitoring",
      done: hasSite,
      href: "/dashboard/sites?add=true",
      icon: Globe,
    },
    {
      id: "run-scan",
      label: "Run your first scan",
      description: "See your accessibility score and issues",
      done: hasScanned,
      href: hasSite ? "/dashboard/sites" : "/dashboard/sites?add=true",
      icon: Play,
    },
    {
      id: "fix-issue",
      label: "Fix your first issue",
      description: "Use the AI fix suggestion to resolve a quick win",
      done: !!hasFixedIssue,
      href: firstSiteId
        ? "/dashboard/sites/" + firstSiteId + "?tab=issues"
        : "/dashboard/sites",
      icon: Wrench,
    },
    {
      id: "verify-domain",
      label: "Verify your domain",
      description: "Unlock scheduled scans and compliance reports",
      done: hasVerified,
      href: hasSite ? "/dashboard/sites" : "/dashboard/sites?add=true",
      icon: ShieldCheck,
    },
  ];
}

export default function SetupChecklist({ sites, hasFixedIssue }) {
  var { t } = useTheme();
  var [hidden, setHidden] = useState(isDismissed);

  var steps = getSteps(sites, hasFixedIssue);
  var completedCount = steps.filter(function (s) {
    return s.done;
  }).length;
  var allDone = completedCount === steps.length;

  // Don't show if dismissed or all complete
  if (hidden || allDone) return null;

  var progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div
      style={{
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        padding: "1.1rem 1.2rem",
        marginBottom: "1.5rem",
        position: "relative",
      }}
    >
      {/* Dismiss button */}
      <button
        onClick={function () {
          setDismissed();
          setHidden(true);
        }}
        aria-label="Dismiss setup checklist"
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
          alignItems: "center",
        }}
      >
        <X size={14} strokeWidth={2} />
      </button>

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.6rem",
        }}
      >
        <Rocket size={16} strokeWidth={2} color={t.accent} />
        <span
          style={{
            fontSize: "0.88rem",
            fontWeight: 600,
            color: t.ink,
          }}
        >
          Get started
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            color: t.ink50,
            marginLeft: "auto",
            paddingRight: "1.2rem",
          }}
        >
          {completedCount}/{steps.length}
        </span>
      </div>

      {/* Progress bar */}
      <div
        style={{
          height: 3,
          borderRadius: 2,
          background: t.ink08,
          marginBottom: "0.9rem",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: progress + "%",
            background: t.accent,
            borderRadius: 2,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      {/* Steps */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
        {steps.map(function (step) {
          var Icon = step.icon;
          return (
            <Link
              key={step.id}
              to={step.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.65rem",
                padding: "0.5rem 0.6rem",
                borderRadius: 8,
                textDecoration: "none",
                transition: "background 0.15s",
                opacity: step.done ? 0.55 : 1,
              }}
              onMouseEnter={function (e) {
                if (!step.done) e.currentTarget.style.background = t.ink04;
              }}
              onMouseLeave={function (e) {
                e.currentTarget.style.background = "transparent";
              }}
            >
              {/* Checkbox circle */}
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: step.done ? t.accent : "transparent",
                  border: step.done ? "none" : "1.5px solid " + t.ink20,
                  flexShrink: 0,
                  transition: "all 0.2s",
                }}
              >
                {step.done ? (
                  <Check size={12} strokeWidth={3} color="white" />
                ) : (
                  <Icon size={11} strokeWidth={2} color={t.ink50} />
                )}
              </div>

              {/* Text */}
              <div style={{ minWidth: 0, flex: 1 }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    color: step.done ? t.ink50 : t.ink,
                    textDecoration: step.done ? "line-through" : "none",
                    lineHeight: 1.3,
                  }}
                >
                  {step.label}
                </div>
                {!step.done && (
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: t.ink50,
                      lineHeight: 1.4,
                      marginTop: "0.1rem",
                    }}
                  >
                    {step.description}
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
