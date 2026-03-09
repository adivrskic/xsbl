import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import {
  Search,
  Globe,
  Settings,
  CreditCard,
  LayoutDashboard,
  Shield,
  Package,
  Code,
  Scan,
  GitPullRequest,
  Key,
  Bell,
  Users,
  Eye,
  FileText,
  BarChart3,
  HelpCircle,
  Trash2,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";

/*
  Knowledge base — entries with `siteSpecific: true` prompt a site picker.
  `siteTab` is included in the description so the user knows where to go once on the site page.
*/
var HELP_ENTRIES = [
  // Sites (list-level — no site picker)
  {
    q: [
      "add site",
      "new site",
      "register site",
      "monitor site",
      "add domain",
      "scan new site",
      "add url",
      "add website",
    ],
    label: "Add a new site",
    desc: "Start monitoring a website for accessibility issues",
    path: "/dashboard/sites?add=true",
    icon: Globe,
    cat: "Sites",
  },
  {
    q: [
      "my sites",
      "site list",
      "view sites",
      "all sites",
      "manage sites",
      "domains",
    ],
    label: "View all sites",
    desc: "See your monitored sites and their scores",
    path: "/dashboard/sites",
    icon: Globe,
    cat: "Sites",
  },
  {
    q: ["delete site", "remove site", "unmonitor"],
    label: "Remove a site",
    desc: "Go to Sites, click the trash icon on any site",
    path: "/dashboard/sites",
    icon: Trash2,
    cat: "Sites",
  },

  // Scanning (site-specific)
  {
    q: [
      "run scan",
      "start scan",
      "scan site",
      "rescan",
      "check accessibility",
      "new scan",
      "scan now",
      "audit site",
    ],
    label: "Run a scan",
    desc: "Quick Scan button on the Overview tab",
    icon: Scan,
    cat: "Scanning",
    siteSpecific: true,
    siteTab: "overview",
  },
  {
    q: [
      "schedule scan",
      "auto scan",
      "recurring scan",
      "cron scan",
      "automatic scan",
      "scan frequency",
    ],
    label: "Schedule automatic scans",
    desc: "Settings tab → Scan schedule",
    icon: Scan,
    cat: "Scanning",
    siteSpecific: true,
    siteTab: "settings",
  },
  {
    q: [
      "scan config",
      "scan settings",
      "exclude rules",
      "scan profile",
      "aaa",
      "best practice",
    ],
    label: "Configure scan profile",
    desc: "Settings tab → Scan profile (Agency)",
    icon: Settings,
    cat: "Scanning",
    siteSpecific: true,
    siteTab: "settings",
  },
  {
    q: [
      "scan history",
      "past scans",
      "previous scans",
      "scan results",
      "scan log",
    ],
    label: "View scan history",
    desc: "Scans tab — all past scan results and scores",
    icon: Scan,
    cat: "Scanning",
    siteSpecific: true,
    siteTab: "scans",
  },

  // Issues (site-specific)
  {
    q: [
      "view issues",
      "accessibility issues",
      "violations",
      "errors",
      "problems",
      "fix issues",
      "issue list",
    ],
    label: "View issues",
    desc: "Issues tab — all detected violations",
    icon: Shield,
    cat: "Issues",
    siteSpecific: true,
    siteTab: "issues",
  },
  {
    q: [
      "fix issue",
      "create pr",
      "pull request",
      "github fix",
      "auto fix",
      "ai fix",
    ],
    label: "Create a fix PR",
    desc: "Open an issue → Create Fix PR (requires GitHub)",
    icon: GitPullRequest,
    cat: "Issues",
    siteSpecific: true,
    siteTab: "issues",
  },
  {
    q: ["bulk fix", "fix multiple", "batch fix"],
    label: "Bulk fix issues",
    desc: "Select multiple issues → Create Fix PR",
    icon: GitPullRequest,
    cat: "Issues",
    siteSpecific: true,
    siteTab: "issues",
  },
  {
    q: [
      "ignore issue",
      "dismiss issue",
      "mark fixed",
      "change status",
      "issue status",
    ],
    label: "Change issue status",
    desc: "Open an issue → status buttons (Open, Fixed, Ignored)",
    icon: Shield,
    cat: "Issues",
    siteSpecific: true,
    siteTab: "issues",
  },

  // Reports (site-specific)
  {
    q: [
      "score",
      "accessibility score",
      "my score",
      "site score",
      "how is score calculated",
      "score breakdown",
    ],
    label: "Understand your score",
    desc: "Click 'Why this score?' on the Overview tab",
    icon: BarChart3,
    cat: "Reports",
    siteSpecific: true,
    siteTab: "overview",
  },
  {
    q: [
      "report",
      "pdf report",
      "download report",
      "export report",
      "generate report",
    ],
    label: "Generate a report",
    desc: "Report button on the Overview tab (Pro+)",
    icon: FileText,
    cat: "Reports",
    siteSpecific: true,
    siteTab: "overview",
  },
  {
    q: ["trend", "trends", "progress", "over time", "history", "improving"],
    label: "Issue trends chart",
    desc: "View the opened vs fixed chart on the Overview page",
    path: "/dashboard",
    icon: BarChart3,
    cat: "Reports",
  },

  // Tools
  {
    q: [
      "test element",
      "test html",
      "test code",
      "paste html",
      "element tester",
      "check html",
      "validate html",
      "axe",
      "wcag check",
    ],
    label: "Test an HTML element",
    desc: "Paste any HTML and get instant axe-core results",
    path: "/dashboard/tester",
    icon: Code,
    cat: "Tools",
  },
  {
    q: [
      "simulator",
      "simulate",
      "color blind",
      "vision",
      "screen reader",
      "low vision",
      "accessibility simulator",
    ],
    label: "Accessibility simulator",
    desc: "Simulator button on the site Overview tab (Pro+)",
    icon: Eye,
    cat: "Tools",
    siteSpecific: true,
    siteTab: "overview",
  },

  // Settings — General
  {
    q: [
      "change name",
      "workspace name",
      "org name",
      "rename workspace",
      "rename organization",
    ],
    label: "Change workspace name",
    desc: "Settings → General tab",
    path: "/dashboard/settings",
    icon: Settings,
    cat: "Settings",
  },
  {
    q: [
      "profile",
      "email",
      "my account",
      "account settings",
      "password",
      "change password",
    ],
    label: "Account & profile",
    desc: "Settings → General tab → Profile section",
    path: "/dashboard/settings",
    icon: Settings,
    cat: "Settings",
  },
  {
    q: ["status page", "public page", "public status", "share status"],
    label: "Public status page",
    desc: "Settings → General → enable public status page",
    path: "/dashboard/settings",
    icon: Globe,
    cat: "Settings",
  },

  // Settings — Team
  {
    q: [
      "invite",
      "add member",
      "add user",
      "team",
      "add teammate",
      "invite user",
      "team members",
    ],
    label: "Invite team members",
    desc: "Settings → Team tab → Send invite",
    path: "/dashboard/settings?tab=team",
    icon: Users,
    cat: "Settings",
  },
  {
    q: ["remove member", "kick user", "remove user", "remove teammate"],
    label: "Remove a team member",
    desc: "Settings → Team tab → click Remove",
    path: "/dashboard/settings?tab=team",
    icon: Users,
    cat: "Settings",
  },

  // Settings — Alerts
  {
    q: [
      "notifications",
      "alerts",
      "email alerts",
      "notify",
      "notification settings",
    ],
    label: "Notification preferences",
    desc: "Settings → Alerts tab",
    path: "/dashboard/settings?tab=alerts",
    icon: Bell,
    cat: "Settings",
  },
  {
    q: [
      "slack",
      "slack integration",
      "slack alerts",
      "slack webhook",
      "connect slack",
    ],
    label: "Connect Slack",
    desc: "Settings → Alerts tab → Slack webhook URL (Pro+)",
    path: "/dashboard/settings?tab=alerts",
    icon: Bell,
    cat: "Settings",
  },

  // Settings — Integrations
  {
    q: [
      "api key",
      "api keys",
      "create api key",
      "api access",
      "programmatic access",
      "api token",
    ],
    label: "Manage API keys",
    desc: "Settings → Integrations → API keys (Pro+)",
    path: "/dashboard/settings?tab=integrations",
    icon: Key,
    cat: "Settings",
  },
  {
    q: [
      "github",
      "connect github",
      "github integration",
      "github repo",
      "repository",
    ],
    label: "Connect GitHub",
    desc: "Settings tab → GitHub connection",
    icon: GitPullRequest,
    cat: "Settings",
    siteSpecific: true,
    siteTab: "settings",
  },
  {
    q: [
      "client dashboard",
      "client access",
      "share with client",
      "read only",
      "invite client",
    ],
    label: "Client access",
    desc: "Settings → Integrations → invite clients (Agency)",
    path: "/dashboard/settings?tab=integrations",
    icon: Users,
    cat: "Settings",
  },
  {
    q: [
      "scheduled report",
      "weekly report",
      "monthly report",
      "report schedule",
    ],
    label: "Scheduled reports",
    desc: "Settings → Integrations → report delivery (Agency)",
    path: "/dashboard/settings?tab=integrations",
    icon: FileText,
    cat: "Settings",
  },

  // Settings — Account
  {
    q: ["delete account", "close account", "remove account", "cancel"],
    label: "Delete account",
    desc: "Settings → Account tab → Danger zone",
    path: "/dashboard/settings?tab=account",
    icon: Trash2,
    cat: "Settings",
  },

  // Billing
  {
    q: [
      "billing",
      "plan",
      "upgrade",
      "subscription",
      "pricing",
      "change plan",
      "downgrade",
      "free plan",
      "pro plan",
      "agency plan",
      "starter plan",
    ],
    label: "Billing & plans",
    desc: "View plan, usage, and upgrade options",
    path: "/dashboard/billing",
    icon: CreditCard,
    cat: "Billing",
  },
  {
    q: ["usage", "scan limit", "how many scans", "quota", "limits"],
    label: "Check usage",
    desc: "Scan, AI suggestion, and PR limits",
    path: "/dashboard/billing",
    icon: BarChart3,
    cat: "Billing",
  },

  // Compliance (Agency)
  {
    q: ["audit log", "audit trail", "activity log", "who did what"],
    label: "Audit log",
    desc: "All actions across your organization (Agency)",
    path: "/dashboard/audit-log",
    icon: Shield,
    cat: "Compliance",
  },
  {
    q: [
      "evidence",
      "soc 2",
      "soc2",
      "iso",
      "iso 27001",
      "compliance",
      "evidence export",
      "audit evidence",
    ],
    label: "Evidence export",
    desc: "SOC 2 or ISO 27001 evidence packages (Agency)",
    path: "/dashboard/evidence",
    icon: Package,
    cat: "Compliance",
  },

  // Badge (site-specific)
  {
    q: ["badge", "embed badge", "accessibility badge", "widget"],
    label: "Embed accessibility badge",
    desc: "Settings tab → Badge embed code",
    icon: Shield,
    cat: "Tools",
    siteSpecific: true,
    siteTab: "settings",
  },

  // Help
  {
    q: [
      "help",
      "support",
      "contact",
      "get help",
      "documentation",
      "docs",
      "how to",
      "getting started",
    ],
    label: "Documentation",
    desc: "Full docs, API reference, and guides",
    path: "/docs",
    icon: HelpCircle,
    cat: "Help",
  },
  {
    q: ["contact", "support", "email support", "bug report", "feedback"],
    label: "Contact support",
    desc: "Send us a message or report a bug",
    path: "/contact",
    icon: HelpCircle,
    cat: "Help",
  },
  {
    q: ["keyboard", "shortcuts", "hotkeys", "keyboard shortcuts"],
    label: "Keyboard shortcuts",
    desc: "Press ? on any site detail page",
    path: "/dashboard/sites",
    icon: Code,
    cat: "Help",
  },
];

function scoreMatch(query, entry) {
  var q = query.toLowerCase().trim();
  if (!q) return 0;
  var words = q.split(/\s+/);
  var score = 0;

  for (var i = 0; i < entry.q.length; i++) {
    var variant = entry.q[i].toLowerCase();
    if (variant === q) return 100;
    if (variant.indexOf(q) === 0) score = Math.max(score, 80);
    if (variant.indexOf(q) !== -1) score = Math.max(score, 60);
    var variantWords = variant.split(/\s+/);
    var matched = 0;
    for (var w = 0; w < words.length; w++) {
      for (var vw = 0; vw < variantWords.length; vw++) {
        if (
          variantWords[vw].indexOf(words[w]) !== -1 ||
          words[w].indexOf(variantWords[vw]) !== -1
        ) {
          matched++;
          break;
        }
      }
    }
    if (matched > 0) score = Math.max(score, (matched / words.length) * 50);
  }
  var labelLower = entry.label.toLowerCase();
  var descLower = entry.desc.toLowerCase();
  if (labelLower.indexOf(q) !== -1) score = Math.max(score, 55);
  if (descLower.indexOf(q) !== -1) score = Math.max(score, 30);
  for (var w2 = 0; w2 < words.length; w2++) {
    if (labelLower.indexOf(words[w2]) !== -1) score = Math.max(score, 40);
  }
  return score;
}

export default function HelpSearch() {
  var { t } = useTheme();
  var { sites } = useAuth();
  var navigate = useNavigate();
  var [open, setOpen] = useState(false);
  var [query, setQuery] = useState("");
  var [selectedIdx, setSelectedIdx] = useState(0);
  var [pickingSite, setPickingSite] = useState(null); // entry waiting for site selection
  var [siteIdx, setSiteIdx] = useState(0);
  var inputRef = useRef(null);
  var panelRef = useRef(null);

  var siteList = sites || [];

  var results = [];
  if (query.trim()) {
    var scored = HELP_ENTRIES.map(function (entry) {
      return { entry: entry, score: scoreMatch(query, entry) };
    })
      .filter(function (r) {
        return r.score > 15;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 8);
    results = scored.map(function (r) {
      return r.entry;
    });
  } else if (open && !pickingSite) {
    results = HELP_ENTRIES.filter(function (e) {
      return (
        e.q[0] === "run scan" ||
        e.q[0] === "view issues" ||
        e.q[0] === "add site" ||
        e.q[0] === "test element" ||
        e.q[0] === "help" ||
        e.q[0] === "billing"
      );
    });
  }

  var handleSelect = useCallback(
    function (entry) {
      if (entry.siteSpecific && siteList.length > 0) {
        // If only 1 site, skip the picker
        if (siteList.length === 1) {
          setOpen(false);
          setQuery("");
          setPickingSite(null);
          navigate(
            "/dashboard/sites/" +
              siteList[0].id +
              (entry.siteTab ? "?tab=" + entry.siteTab : "")
          );
          return;
        }
        setPickingSite(entry);
        setSiteIdx(0);
        return;
      }
      setOpen(false);
      setQuery("");
      setPickingSite(null);
      navigate(entry.path || "/dashboard/sites");
    },
    [navigate, siteList]
  );

  var handleSiteSelect = useCallback(
    function (site) {
      setOpen(false);
      setQuery("");
      var tabParam =
        pickingSite && pickingSite.siteTab ? "?tab=" + pickingSite.siteTab : "";
      setPickingSite(null);
      navigate("/dashboard/sites/" + site.id + tabParam);
    },
    [navigate, pickingSite]
  );

  var handleBack = useCallback(function () {
    setPickingSite(null);
    setSiteIdx(0);
    if (inputRef.current) inputRef.current.focus();
  }, []);

  // Keyboard nav
  useEffect(
    function () {
      if (!open) return;
      var handler = function (e) {
        if (e.key === "Escape") {
          if (pickingSite) {
            handleBack();
          } else {
            setOpen(false);
            setQuery("");
          }
          return;
        }
        if (pickingSite) {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setSiteIdx(function (i) {
              return Math.min(i + 1, siteList.length - 1);
            });
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setSiteIdx(function (i) {
              return Math.max(i - 1, 0);
            });
          }
          if (e.key === "Enter" && siteList[siteIdx]) {
            e.preventDefault();
            handleSiteSelect(siteList[siteIdx]);
          }
          if (e.key === "Backspace" || (e.key === "ArrowLeft" && !query)) {
            e.preventDefault();
            handleBack();
          }
          return;
        }
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedIdx(function (i) {
            return Math.min(i + 1, results.length - 1);
          });
        }
        if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedIdx(function (i) {
            return Math.max(i - 1, 0);
          });
        }
        if (e.key === "Enter" && results[selectedIdx]) {
          e.preventDefault();
          handleSelect(results[selectedIdx]);
        }
      };
      document.addEventListener("keydown", handler);
      return function () {
        document.removeEventListener("keydown", handler);
      };
    },
    [
      open,
      results,
      selectedIdx,
      handleSelect,
      pickingSite,
      siteList,
      siteIdx,
      handleSiteSelect,
      handleBack,
      query,
    ]
  );

  useEffect(
    function () {
      setSelectedIdx(0);
    },
    [query]
  );

  useEffect(
    function () {
      if (!open) return;
      var handler = function (e) {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          setOpen(false);
          setQuery("");
          setPickingSite(null);
        }
      };
      document.addEventListener("mousedown", handler);
      return function () {
        document.removeEventListener("mousedown", handler);
      };
    },
    [open]
  );

  useEffect(
    function () {
      if (open && !pickingSite && inputRef.current) inputRef.current.focus();
    },
    [open, pickingSite]
  );

  useEffect(function () {
    var handler = function (e) {
      var tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (document.activeElement?.isContentEditable) return;
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setOpen(true);
      }
    };
    document.addEventListener("keydown", handler);
    return function () {
      document.removeEventListener("keydown", handler);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      style={{ position: "relative", marginBottom: "0.5rem" }}
    >
      {/* Trigger button */}
      <button
        onClick={function () {
          setOpen(true);
        }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          width: "100%",
          padding: "0.4rem 0.7rem",
          borderRadius: 7,
          border: "1px solid " + t.ink08,
          background: t.paper,
          color: t.ink50,
          fontFamily: "var(--body)",
          fontSize: "0.75rem",
          cursor: "pointer",
          transition: "all 0.15s",
          textAlign: "left",
        }}
        onMouseEnter={function (e) {
          e.currentTarget.style.borderColor = t.accent + "40";
        }}
        onMouseLeave={function (e) {
          e.currentTarget.style.borderColor = t.ink08;
        }}
      >
        <Search size={13} strokeWidth={2} />
        <span style={{ flex: 1 }}>Help & search...</span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.52rem",
            padding: "0.05rem 0.25rem",
            borderRadius: 3,
            background: t.ink04,
            color: t.ink50,
            fontWeight: 600,
          }}
        >
          /
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 4px)",
            left: 0,
            right: 0,
            borderRadius: 10,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            boxShadow: "0 -8px 32px rgba(0,0,0,0.12)",
            overflow: "hidden",
            zIndex: 100,
            maxHeight: 400,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Input area */}
          {!pickingSite && (
            <div
              style={{
                padding: "0.5rem 0.6rem",
                borderBottom: "1px solid " + t.ink08,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <Search size={14} color={t.accent} />
              <input
                ref={inputRef}
                value={query}
                onChange={function (e) {
                  setQuery(e.target.value);
                }}
                placeholder="What do you need help with?"
                style={{
                  flex: 1,
                  border: "none",
                  background: "none",
                  color: t.ink,
                  fontFamily: "var(--body)",
                  fontSize: "0.82rem",
                  outline: "none",
                }}
              />
              {query && (
                <button
                  onClick={function () {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: t.ink50,
                    display: "flex",
                    padding: "0.1rem",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}

          {/* Site picker header */}
          {pickingSite && (
            <div
              style={{
                padding: "0.5rem 0.6rem",
                borderBottom: "1px solid " + t.ink08,
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <button
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: t.accent,
                  display: "flex",
                  alignItems: "center",
                  padding: "0.1rem",
                }}
                aria-label="Back to search"
              >
                <ArrowLeft size={14} />
              </button>
              <div style={{ flex: 1 }}>
                <div
                  style={{ fontSize: "0.72rem", fontWeight: 600, color: t.ink }}
                >
                  {pickingSite.label}
                </div>
                <div style={{ fontSize: "0.6rem", color: t.ink50 }}>
                  Which site?
                </div>
              </div>
            </div>
          )}

          {/* Results or site list */}
          <div style={{ overflowY: "auto", flex: 1 }} aria-live="polite">
            {pickingSite ? (
              /* Site picker */
              siteList.length === 0 ? (
                <div
                  style={{
                    padding: "1.2rem",
                    textAlign: "center",
                    fontSize: "0.78rem",
                    color: t.ink50,
                  }}
                >
                  No sites yet.{" "}
                  <button
                    onClick={function () {
                      setOpen(false);
                      setPickingSite(null);
                      navigate("/dashboard/sites?add=true");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: t.accent,
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.78rem",
                    }}
                  >
                    Add a site first
                  </button>
                </div>
              ) : (
                siteList.map(function (site, i) {
                  var isSelected = i === siteIdx;
                  return (
                    <button
                      key={site.id}
                      onClick={function () {
                        handleSiteSelect(site);
                      }}
                      onMouseEnter={function () {
                        setSiteIdx(i);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        width: "100%",
                        padding: "0.55rem 0.7rem",
                        border: "none",
                        background: isSelected ? t.accentBg : "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "background 0.08s",
                      }}
                    >
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          background: isSelected ? t.accent + "15" : t.ink04,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <Globe
                          size={13}
                          color={isSelected ? t.accent : t.ink50}
                          strokeWidth={1.8}
                        />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: 600,
                            color: isSelected ? t.accent : t.ink,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {site.display_name || site.domain}
                        </div>
                        <div
                          style={{
                            fontSize: "0.62rem",
                            fontFamily: "var(--mono)",
                            color: t.ink50,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {site.domain}
                          {site.score != null ? " · " + site.score : ""}
                        </div>
                      </div>
                      <ChevronRight
                        size={12}
                        color={isSelected ? t.accent : "transparent"}
                        style={{ flexShrink: 0 }}
                      />
                    </button>
                  );
                })
              )
            ) : results.length === 0 && query.trim() ? (
              <div style={{ padding: "1.2rem", textAlign: "center" }}>
                <div
                  style={{
                    fontSize: "0.82rem",
                    color: t.ink50,
                    marginBottom: "0.3rem",
                  }}
                >
                  No results for "{query}"
                </div>
                <div style={{ fontSize: "0.7rem", color: t.ink50 }}>
                  Try "scan", "issues", "report", or "billing"
                </div>
              </div>
            ) : (
              results.map(function (entry, i) {
                var Icon = entry.icon;
                var isSelected = i === selectedIdx;
                return (
                  <button
                    key={entry.label}
                    onClick={function () {
                      handleSelect(entry);
                    }}
                    onMouseEnter={function () {
                      setSelectedIdx(i);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      width: "100%",
                      padding: "0.55rem 0.7rem",
                      border: "none",
                      background: isSelected ? t.accentBg : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      transition: "background 0.08s",
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 6,
                        background: isSelected ? t.accent + "15" : t.ink04,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon
                        size={13}
                        color={isSelected ? t.accent : t.ink50}
                        strokeWidth={1.8}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: "0.78rem",
                          fontWeight: 600,
                          color: isSelected ? t.accent : t.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.label}
                      </div>
                      <div
                        style={{
                          fontSize: "0.65rem",
                          color: t.ink50,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.desc}
                      </div>
                    </div>
                    {entry.siteSpecific ? (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.48rem",
                          padding: "0.08rem 0.25rem",
                          borderRadius: 3,
                          background: isSelected ? t.accent + "15" : t.ink04,
                          color: isSelected ? t.accent : t.ink50,
                          fontWeight: 600,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        SITE →
                      </span>
                    ) : (
                      <ArrowRight
                        size={12}
                        color={isSelected ? t.accent : "transparent"}
                        style={{ flexShrink: 0 }}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "0.35rem 0.7rem",
              borderTop: "1px solid " + t.ink08,
              display: "flex",
              gap: "0.8rem",
              fontFamily: "var(--mono)",
              fontSize: "0.52rem",
              color: t.ink50,
            }}
          >
            {pickingSite ? (
              <>
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>← back</span>
                <span>esc close</span>
              </>
            ) : (
              <>
                <span>↑↓ navigate</span>
                <span>↵ select</span>
                <span>esc close</span>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
