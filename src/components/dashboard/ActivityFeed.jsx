import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { timeAgo } from "../../lib/timeAgo";
import {
  Activity,
  Scan,
  GitPullRequest,
  Globe,
  AlertTriangle,
  FileText,
  CreditCard,
  UserPlus,
} from "lucide-react";

var ACTION_CONFIG = {
  "scan.completed": { icon: Scan, color: "#1a8754", verb: "Scan completed" },
  "scan.failed": { icon: Scan, color: "#c0392b", verb: "Scan failed" },
  "scan.scheduled_complete": {
    icon: Scan,
    color: "#1a8754",
    verb: "Scheduled scan completed",
  },
  "pr.created": {
    icon: GitPullRequest,
    color: "#6e40c9",
    verb: "Fix PR created",
  },
  "pr.bulk_created": {
    icon: GitPullRequest,
    color: "#6e40c9",
    verb: "Bulk fix PR created",
  },
  "site.created": { icon: Globe, color: "#4338f0", verb: "Site added" },
  "site.deleted": { icon: Globe, color: "#c0392b", verb: "Site removed" },
  "issue.status_changed": {
    icon: AlertTriangle,
    color: "#b45309",
    verb: "Issue updated",
  },
  "report.generated": {
    icon: FileText,
    color: "#4338f0",
    verb: "Report generated",
  },
  "plan.changed": { icon: CreditCard, color: "#4338f0", verb: "Plan changed" },
  "plan.subscription_created": {
    icon: CreditCard,
    color: "#1a8754",
    verb: "Subscription started",
  },
  "user.invited": {
    icon: UserPlus,
    color: "#4338f0",
    verb: "Team member invited",
  },
  "user.client_accepted": {
    icon: UserPlus,
    color: "#1a8754",
    verb: "Client accepted invite",
  },
};

function getConfig(action) {
  return (
    ACTION_CONFIG[action] || { icon: Activity, color: "#666", verb: action }
  );
}

export default function ActivityFeed() {
  var { t } = useTheme();
  var { org } = useAuth();
  var [events, setEvents] = useState([]);
  var [loading, setLoading] = useState(true);

  useEffect(
    function () {
      if (!org?.id) return;
      setLoading(true);

      supabase
        .from("audit_log")
        .select(
          "id, action, description, metadata, created_at, resource_type, resource_id"
        )
        .eq("org_id", org.id)
        .order("created_at", { ascending: false })
        .limit(12)
        .then(function (res) {
          // Filter to only show interesting actions (skip scan.started, settings.*)
          var interesting = (res.data || []).filter(function (e) {
            return (
              e.action !== "scan.started" &&
              e.action.indexOf("settings.") !== 0 &&
              e.action !== "simulator.used"
            );
          });
          setEvents(interesting.slice(0, 8));
          setLoading(false);
        });
    },
    [org?.id]
  );

  if (loading) {
    return (
      <div style={{ marginBottom: "1.5rem" }}>
        <h2
          style={{
            fontFamily: "var(--body)",
            fontSize: "0.88rem",
            fontWeight: 600,
            color: t.ink,
            margin: "0 0 0.6rem",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <Activity size={14} color={t.ink50} />
          Recent activity
        </h2>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
          }}
        >
          {[1, 2, 3].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.55rem 0.8rem",
                  borderRadius: 8,
                  border: "1px solid " + t.ink08,
                  background: t.cardBg,
                }}
              >
                <div
                  className="skeleton"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    flexShrink: 0,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton"
                    style={{
                      width: "55%",
                      height: 10,
                      marginBottom: "0.25rem",
                    }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "30%", height: 8 }}
                  />
                </div>
                <div className="skeleton" style={{ width: 40, height: 8 }} />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (events.length === 0) return null;

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <h2
        style={{
          fontFamily: "var(--body)",
          fontSize: "0.88rem",
          fontWeight: 600,
          color: t.ink,
          margin: "0 0 0.6rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <Activity size={14} color={t.ink50} />
        Recent activity
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.3rem",
        }}
      >
        {events.map(function (event) {
          var config = getConfig(event.action);
          var Icon = config.icon;
          var meta = event.metadata || {};
          var domain = meta.domain || "";
          var score = meta.score;
          var issues = meta.issues;
          var siteId = meta.site_id || event.resource_id;

          // Build detail text from metadata
          var detail = "";
          if (
            event.action === "scan.completed" ||
            event.action === "scan.scheduled_complete"
          ) {
            var parts = [];
            if (score != null) parts.push("score " + Math.round(score));
            if (issues != null)
              parts.push(issues + " issue" + (issues !== 1 ? "s" : ""));
            if (meta.pages)
              parts.push(meta.pages + " page" + (meta.pages !== 1 ? "s" : ""));
            if (meta.auto_resolved > 0)
              parts.push(meta.auto_resolved + " auto-resolved");
            detail = parts.join(" · ");
          } else if (
            event.action === "pr.created" ||
            event.action === "pr.bulk_created"
          ) {
            if (meta.pr_number) detail = "PR #" + meta.pr_number;
            if (meta.issues_fixed)
              detail +=
                " · " +
                meta.issues_fixed +
                " fix" +
                (meta.issues_fixed !== 1 ? "es" : "");
          } else if (event.action === "site.created") {
            detail = domain;
          } else if (meta.email) {
            detail = meta.email;
          }

          var scoreColor =
            score != null
              ? score >= 80
                ? t.green
                : score >= 50
                ? t.amber
                : t.red
              : null;

          // Make scannable — link to site if we have a site_id
          var isLink =
            siteId &&
            (event.action.indexOf("scan.") === 0 ||
              event.action.indexOf("pr.") === 0 ||
              event.action === "site.created");

          var Row = isLink ? Link : "div";
          var rowProps = isLink
            ? {
                to: "/dashboard/sites/" + siteId,
                style: { textDecoration: "none" },
              }
            : {};

          return (
            <Row
              key={event.id}
              {...rowProps}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 0.8rem",
                borderRadius: 8,
                border: "1px solid " + t.ink08,
                background: t.cardBg,
                textDecoration: "none",
                transition: "border-color 0.15s",
                cursor: isLink ? "pointer" : "default",
              }}
              onMouseEnter={
                isLink
                  ? function (e) {
                      e.currentTarget.style.borderColor = t.accent + "40";
                    }
                  : undefined
              }
              onMouseLeave={
                isLink
                  ? function (e) {
                      e.currentTarget.style.borderColor = t.ink08;
                    }
                  : undefined
              }
            >
              {/* Icon */}
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 6,
                  background: config.color + "12",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Icon size={13} color={config.color} strokeWidth={2} />
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 500,
                    color: t.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {config.verb}
                  {domain && (
                    <span style={{ color: t.ink50, fontWeight: 400 }}>
                      {" "}
                      on {domain}
                    </span>
                  )}
                </div>
                {detail && (
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.62rem",
                      color: t.ink50,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "0.1rem",
                    }}
                  >
                    {detail}
                  </div>
                )}
              </div>

              {/* Score badge for scan events */}
              {score != null && (
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    color: scoreColor,
                    flexShrink: 0,
                  }}
                >
                  {Math.round(score)}
                </div>
              )}

              {/* Timestamp */}
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  color: t.ink50,
                  flexShrink: 0,
                  whiteSpace: "nowrap",
                }}
              >
                {timeAgo(event.created_at)}
              </div>
            </Row>
          );
        })}
      </div>
    </div>
  );
}
