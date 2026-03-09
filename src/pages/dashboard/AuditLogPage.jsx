import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import {
  Shield,
  Search,
  Download,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Globe,
  GitPullRequest,
  Scan,
  Settings,
  CreditCard,
  UserPlus,
  AlertTriangle,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";

var PAGE_SIZE = 30;

var ACTION_META = {
  "scan.started": { label: "Scan started", icon: Scan, color: "#4338f0" },
  "scan.completed": { label: "Scan completed", icon: Scan, color: "#1a8754" },
  "scan.failed": { label: "Scan failed", icon: Scan, color: "#c0392b" },
  "pr.created": {
    label: "Fix PR created",
    icon: GitPullRequest,
    color: "#6e40c9",
  },
  "pr.bulk_created": {
    label: "Bulk fix PR created",
    icon: GitPullRequest,
    color: "#6e40c9",
  },
  "site.created": { label: "Site added", icon: Globe, color: "#4338f0" },
  "site.deleted": { label: "Site deleted", icon: Globe, color: "#c0392b" },
  "issue.status_changed": {
    label: "Issue status changed",
    icon: AlertTriangle,
    color: "#b45309",
  },
  "settings.updated": {
    label: "Settings updated",
    icon: Settings,
    color: "#666",
  },
  "settings.alerts_updated": {
    label: "Alert settings updated",
    icon: Settings,
    color: "#666",
  },
  "settings.schedule_updated": {
    label: "Scan schedule updated",
    icon: RefreshCw,
    color: "#666",
  },
  "settings.github_connected": {
    label: "GitHub connected",
    icon: GitPullRequest,
    color: "#1a8754",
  },
  "settings.scan_profile_updated": {
    label: "Scan profile updated",
    icon: Settings,
    color: "#666",
  },
  "plan.changed": { label: "Plan changed", icon: CreditCard, color: "#4338f0" },
  "plan.subscription_created": {
    label: "Subscription started",
    icon: CreditCard,
    color: "#1a8754",
  },
  "plan.subscription_canceled": {
    label: "Subscription canceled",
    icon: CreditCard,
    color: "#c0392b",
  },
  "user.invited": { label: "User invited", icon: UserPlus, color: "#4338f0" },
  "user.removed": { label: "User removed", icon: UserPlus, color: "#c0392b" },
  "report.generated": {
    label: "Report generated",
    icon: FileText,
    color: "#4338f0",
  },
  "report.scheduled_sent": {
    label: "Scheduled report sent",
    icon: FileText,
    color: "#1a8754",
  },
  "simulator.used": { label: "Simulator used", icon: Eye, color: "#4338f0" },
};

var RESOURCE_TYPES = [
  { value: "", label: "All types" },
  { value: "scan", label: "Scans" },
  { value: "site", label: "Sites" },
  { value: "issue", label: "Issues" },
  { value: "pr", label: "Pull requests" },
  { value: "settings", label: "Settings" },
  { value: "plan", label: "Plan & billing" },
  { value: "user", label: "Users" },
  { value: "report", label: "Reports" },
];

function formatTime(ts) {
  var d = new Date(ts);
  var now = new Date();
  var diff = now - d;

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return Math.floor(diff / 60000) + "m ago";
  if (diff < 86400000) return Math.floor(diff / 3600000) + "h ago";

  var sameYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getActionMeta(action) {
  return ACTION_META[action] || { label: action, icon: Shield, color: "#666" };
}

export default function AuditLogPage() {
  var { t } = useTheme();
  var { org } = useAuth();
  var [logs, setLogs] = useState([]);
  var [loading, setLoading] = useState(true);
  var [searchTerm, setSearchTerm] = useState("");
  var [resourceFilter, setResourceFilter] = useState("");
  var [page, setPage] = useState(0);
  var [hasMore, setHasMore] = useState(true);
  var [totalCount, setTotalCount] = useState(null);
  var [profiles, setProfiles] = useState({});
  var debounceRef = useRef(null);

  var loadLogs = useCallback(
    async function (pageNum, reset) {
      if (!org) return;
      setLoading(true);

      var query = supabase
        .from("audit_log")
        .select("*", { count: "exact" })
        .eq("org_id", org.id)
        .order("created_at", { ascending: false })
        .range(pageNum * PAGE_SIZE, (pageNum + 1) * PAGE_SIZE - 1);

      if (resourceFilter) {
        query = query.eq("resource_type", resourceFilter);
      }
      if (searchTerm.trim()) {
        query = query.or(
          "description.ilike.%" +
            searchTerm.trim() +
            "%,action.ilike.%" +
            searchTerm.trim() +
            "%"
        );
      }

      var { data, count, error } = await query;
      if (error) {
        console.error("[audit] Load failed:", error);
        setLoading(false);
        return;
      }

      setLogs(data || []);
      setTotalCount(count);
      setHasMore((data || []).length === PAGE_SIZE);
      setLoading(false);

      // Load user profiles for any user_ids we haven't seen
      var newIds = (data || [])
        .map(function (l) {
          return l.user_id;
        })
        .filter(function (id) {
          return id && !profiles[id];
        });
      if (newIds.length > 0) {
        var uniqueIds = [];
        newIds.forEach(function (id) {
          if (uniqueIds.indexOf(id) === -1) uniqueIds.push(id);
        });
        var { data: profs } = await supabase
          .from("profiles")
          .select("id, email, full_name")
          .in("id", uniqueIds);
        if (profs) {
          setProfiles(function (prev) {
            var updated = Object.assign({}, prev);
            profs.forEach(function (p) {
              updated[p.id] = p;
            });
            return updated;
          });
        }
      }
    },
    [org, resourceFilter, searchTerm]
  );

  useEffect(
    function () {
      setPage(0);
      loadLogs(0, true);
    },
    [resourceFilter]
  );

  useEffect(
    function () {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(function () {
        setPage(0);
        loadLogs(0, true);
      }, 300);
      return function () {
        clearTimeout(debounceRef.current);
      };
    },
    [searchTerm]
  );

  var handlePageChange = function (newPage) {
    setPage(newPage);
    loadLogs(newPage);
  };

  var handleExportCSV = function () {
    var headers = [
      "Timestamp",
      "Action",
      "Resource Type",
      "Resource ID",
      "User",
      "Description",
      "Metadata",
    ];
    var rows = logs.map(function (l) {
      var user =
        l.user_id && profiles[l.user_id]
          ? profiles[l.user_id].full_name || profiles[l.user_id].email
          : l.user_id || "System";
      return [
        new Date(l.created_at).toISOString(),
        l.action,
        l.resource_type,
        l.resource_id || "",
        user,
        (l.description || "").replace(/"/g, '""'),
        JSON.stringify(l.metadata || {}).replace(/"/g, '""'),
      ];
    });

    var csv =
      headers.join(",") +
      "\n" +
      rows
        .map(function (r) {
          return r
            .map(function (c) {
              return '"' + c + '"';
            })
            .join(",");
        })
        .join("\n");

    var blob = new Blob([csv], { type: "text/csv" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download =
      "audit-log-" +
      (org?.name || "org").replace(/\s+/g, "-").toLowerCase() +
      "-" +
      new Date().toISOString().slice(0, 10) +
      ".csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  var totalPages = totalCount != null ? Math.ceil(totalCount / PAGE_SIZE) : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.3rem",
        }}
      >
        <Shield size={20} color={t.accent} strokeWidth={2} />
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          Audit Log
        </h1>
      </div>
      <p
        style={{ color: t.ink50, fontSize: "0.88rem", marginBottom: "1.5rem" }}
      >
        Complete record of all actions taken across your organization.
      </p>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.35rem 0.6rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink08,
            background: t.paper,
            flex: 1,
            minWidth: 200,
            maxWidth: 360,
          }}
        >
          <Search size={14} color={t.ink50} />
          <input
            value={searchTerm}
            onChange={function (e) {
              setSearchTerm(e.target.value);
            }}
            placeholder="Search actions, descriptions..."
            style={{
              border: "none",
              background: "none",
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.82rem",
              outline: "none",
              flex: 1,
              minWidth: 0,
            }}
          />
        </div>

        {/* Resource type filter */}
        <div style={{ position: "relative" }}>
          <select
            value={resourceFilter}
            onChange={function (e) {
              setResourceFilter(e.target.value);
            }}
            style={{
              padding: "0.4rem 1.8rem 0.4rem 0.6rem",
              borderRadius: 6,
              border:
                "1.5px solid " + (resourceFilter ? t.accent + "40" : t.ink08),
              background: resourceFilter ? t.accentBg : t.paper,
              color: resourceFilter ? t.accent : t.ink,
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              fontWeight: 600,
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              WebkitAppearance: "none",
            }}
          >
            {RESOURCE_TYPES.map(function (rt) {
              return (
                <option key={rt.value} value={rt.value}>
                  {rt.label}
                </option>
              );
            })}
          </select>
          <ChevronDown
            size={12}
            color={t.ink50}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Export */}
        <button
          onClick={handleExportCSV}
          disabled={logs.length === 0}
          style={{
            padding: "0.4rem 0.7rem",
            borderRadius: 6,
            border: "1.5px solid " + t.ink08,
            background: "none",
            color: t.ink50,
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            fontWeight: 600,
            cursor: logs.length === 0 ? "default" : "pointer",
            opacity: logs.length === 0 ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          <Download size={13} /> Export CSV
        </button>

        {/* Count */}
        {totalCount != null && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.65rem",
              color: t.ink50,
              marginLeft: "auto",
            }}
          >
            {totalCount} event{totalCount !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Log entries */}
      <div
        style={{
          borderRadius: 10,
          border: "1px solid " + t.ink08,
          background: t.cardBg,
          overflow: "hidden",
        }}
      >
        {loading && logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <Loader2 size={24} className="xsbl-spin" color={t.accent} />
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.78rem",
                color: t.ink50,
                marginTop: "0.5rem",
              }}
            >
              Loading audit log...
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: t.ink50 }}>
            <Shield
              size={28}
              style={{ opacity: 0.3, marginBottom: "0.5rem" }}
            />
            <div style={{ fontSize: "0.88rem", marginBottom: "0.3rem" }}>
              No events found
            </div>
            <div style={{ fontSize: "0.74rem" }}>
              {searchTerm || resourceFilter
                ? "Try adjusting your filters."
                : "Events will appear here as you use xsbl."}
            </div>
          </div>
        ) : (
          <div>
            {logs.map(function (log, i) {
              var meta = getActionMeta(log.action);
              var Icon = meta.icon;
              var user =
                log.user_id && profiles[log.user_id]
                  ? profiles[log.user_id].full_name ||
                    profiles[log.user_id].email
                  : null;
              var isSystem = !log.user_id;

              return (
                <div
                  key={log.id}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.7rem",
                    padding: "0.8rem 1rem",
                    borderTop: i > 0 ? "1px solid " + t.ink04 : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.background = t.ink04;
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {/* Icon */}
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 7,
                      background: meta.color + "12",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <Icon size={14} color={meta.color} strokeWidth={2} />
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "0.82rem",
                          fontWeight: 600,
                          color: t.ink,
                        }}
                      >
                        {meta.label}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.52rem",
                          fontWeight: 600,
                          padding: "0.08rem 0.3rem",
                          borderRadius: 3,
                          background: t.ink04,
                          color: t.ink50,
                          textTransform: "uppercase",
                        }}
                      >
                        {log.resource_type}
                      </span>
                    </div>
                    {log.description && (
                      <div
                        style={{
                          fontSize: "0.76rem",
                          color: t.ink50,
                          marginTop: "0.15rem",
                          lineHeight: 1.5,
                        }}
                      >
                        {log.description}
                      </div>
                    )}
                    {/* Metadata pills */}
                    {log.metadata && Object.keys(log.metadata).length > 0 && (
                      <div
                        style={{
                          display: "flex",
                          gap: "0.25rem",
                          flexWrap: "wrap",
                          marginTop: "0.3rem",
                        }}
                      >
                        {Object.entries(log.metadata)
                          .slice(0, 6)
                          .map(function (entry) {
                            var key = entry[0];
                            var val = entry[1];
                            if (val === null || val === undefined) return null;
                            var display =
                              typeof val === "object"
                                ? JSON.stringify(val)
                                : String(val);
                            if (display.length > 50)
                              display = display.substring(0, 50) + "...";
                            return (
                              <span
                                key={key}
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.55rem",
                                  padding: "0.1rem 0.35rem",
                                  borderRadius: 3,
                                  background: t.ink04,
                                  color: t.ink50,
                                }}
                              >
                                {key}: {display}
                              </span>
                            );
                          })}
                      </div>
                    )}
                  </div>

                  {/* Right — user + time */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        color: t.ink50,
                        marginBottom: "0.15rem",
                      }}
                    >
                      {formatTime(log.created_at)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.55rem",
                        color: isSystem ? t.accent : t.ink50,
                        fontWeight: isSystem ? 600 : 400,
                      }}
                    >
                      {isSystem ? "system" : user || "unknown"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            marginTop: "1rem",
          }}
        >
          <button
            onClick={function () {
              handlePageChange(page - 1);
            }}
            disabled={page === 0}
            style={{
              padding: "0.3rem 0.5rem",
              borderRadius: 5,
              border: "1px solid " + t.ink08,
              background: "none",
              color: page === 0 ? t.ink20 : t.ink50,
              cursor: page === 0 ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              color: t.ink50,
            }}
          >
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={function () {
              handlePageChange(page + 1);
            }}
            disabled={!hasMore}
            style={{
              padding: "0.3rem 0.5rem",
              borderRadius: 5,
              border: "1px solid " + t.ink08,
              background: "none",
              color: !hasMore ? t.ink20 : t.ink50,
              cursor: !hasMore ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      <style>{`
        @keyframes xsbl-spin { to { transform: rotate(360deg); } }
        .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
      `}</style>
    </div>
  );
}
