import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
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
} from "lucide-react";

/*
  Knowledge base — every entry has:
  - q: array of question/keyword variants users might type
  - label: what shows in results
  - desc: short explanation
  - path: where to navigate (route or route#section)
  - icon: Lucide icon component
  - cat: category for grouping
  - plan: optional minimum plan required
  - tab: optional settings tab to activate
*/
var HELP_ENTRIES = [
  // Sites
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

  // Scanning
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
    desc: "Open a site and click Quick Scan or configure scan options",
    path: "/dashboard/sites",
    icon: Scan,
    cat: "Scanning",
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
    desc: "Open a site → Settings tab → Scan schedule",
    path: "/dashboard/sites",
    icon: Scan,
    cat: "Scanning",
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
    desc: "Open a site → Settings tab → Scan profile (Agency)",
    path: "/dashboard/sites",
    icon: Settings,
    cat: "Scanning",
  },

  // Issues
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
    desc: "Open a site → Issues tab to see all detected violations",
    path: "/dashboard/sites",
    icon: Shield,
    cat: "Issues",
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
    desc: "Open an issue → click Create Fix PR (requires GitHub)",
    path: "/dashboard/sites",
    icon: GitPullRequest,
    cat: "Issues",
  },
  {
    q: ["bulk fix", "fix multiple", "batch fix"],
    label: "Bulk fix issues",
    desc: "Select multiple issues on the Issues tab, then Create Fix PR",
    path: "/dashboard/sites",
    icon: GitPullRequest,
    cat: "Issues",
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
    desc: "Open an issue → use the status buttons (Open, Fixed, Ignored)",
    path: "/dashboard/sites",
    icon: Shield,
    cat: "Issues",
  },

  // Reports & scores
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
    desc: "Open a site → click 'Why this score?' on the score card",
    path: "/dashboard/sites",
    icon: BarChart3,
    cat: "Reports",
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
    desc: "Open a site → click the Report button (Pro+)",
    path: "/dashboard/sites",
    icon: FileText,
    cat: "Reports",
  },
  {
    q: ["trend", "trends", "progress", "over time", "history", "improving"],
    label: "Issue trends chart",
    desc: "View the opened vs fixed chart on the Overview page",
    path: "/dashboard",
    icon: BarChart3,
    cat: "Reports",
  },

  // Element tester
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
    desc: "Paste any HTML and get instant axe-core accessibility results",
    path: "/dashboard/tester",
    icon: Code,
    cat: "Tools",
  },

  // Simulator
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
    desc: "Open a site → click the Simulator button to preview impairments",
    path: "/dashboard/sites",
    icon: Eye,
    cat: "Tools",
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
    tab: "general",
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
    tab: "general",
  },
  {
    q: ["status page", "public page", "public status", "share status"],
    label: "Public status page",
    desc: "Settings → General → enable public accessibility status page",
    path: "/dashboard/settings",
    icon: Globe,
    cat: "Settings",
    tab: "general",
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
    path: "/dashboard/settings",
    icon: Users,
    cat: "Settings",
    tab: "team",
  },
  {
    q: ["remove member", "kick user", "remove user", "remove teammate"],
    label: "Remove a team member",
    desc: "Settings → Team tab → click Remove next to a member",
    path: "/dashboard/settings",
    icon: Users,
    cat: "Settings",
    tab: "team",
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
    desc: "Settings → Alerts tab → toggle scan/issue/digest notifications",
    path: "/dashboard/settings",
    icon: Bell,
    cat: "Settings",
    tab: "alerts",
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
    desc: "Settings → Alerts tab → add your Slack webhook URL (Pro+)",
    path: "/dashboard/settings",
    icon: Bell,
    cat: "Settings",
    tab: "alerts",
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
    desc: "Settings → Integrations tab → create and manage API keys (Pro+)",
    path: "/dashboard/settings",
    icon: Key,
    cat: "Settings",
    tab: "integrations",
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
    desc: "Open a site → Settings tab → GitHub connection",
    path: "/dashboard/sites",
    icon: GitPullRequest,
    cat: "Settings",
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
    desc: "Settings → Integrations → invite clients to view-only dashboards (Agency)",
    path: "/dashboard/settings",
    icon: Users,
    cat: "Settings",
    tab: "integrations",
  },
  {
    q: [
      "scheduled report",
      "weekly report",
      "monthly report",
      "report schedule",
    ],
    label: "Scheduled reports",
    desc: "Settings → Integrations → set up automatic report delivery (Agency)",
    path: "/dashboard/settings",
    icon: FileText,
    cat: "Settings",
    tab: "integrations",
  },

  // Settings — Account
  {
    q: ["delete account", "close account", "remove account", "cancel"],
    label: "Delete account",
    desc: "Settings → Account tab → Danger zone",
    path: "/dashboard/settings",
    icon: Trash2,
    cat: "Settings",
    tab: "account",
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
    desc: "View your current plan, usage, and upgrade options",
    path: "/dashboard/billing",
    icon: CreditCard,
    cat: "Billing",
  },
  {
    q: ["usage", "scan limit", "how many scans", "quota", "limits"],
    label: "Check usage",
    desc: "See your scan, AI suggestion, and PR limits on the Billing page",
    path: "/dashboard/billing",
    icon: BarChart3,
    cat: "Billing",
  },

  // Compliance (Agency)
  {
    q: ["audit log", "audit trail", "activity log", "who did what"],
    label: "Audit log",
    desc: "View all actions taken across your organization (Agency)",
    path: "/dashboard/audit-log",
    icon: Shield,
    cat: "Compliance",
    plan: "agency",
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
    desc: "Generate SOC 2 or ISO 27001 evidence packages (Agency)",
    path: "/dashboard/evidence",
    icon: Package,
    cat: "Compliance",
    plan: "agency",
  },

  // General help
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
    desc: "Read the full xsbl docs, API reference, and guides",
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
    desc: "Press ? on any site detail page to see all shortcuts",
    path: "/dashboard/sites",
    icon: Code,
    cat: "Help",
  },
  {
    q: ["badge", "embed badge", "accessibility badge", "widget"],
    label: "Embed accessibility badge",
    desc: "Open a site → Settings tab → Badge embed code",
    path: "/dashboard/sites",
    icon: Shield,
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

    // Exact match
    if (variant === q) return 100;

    // Starts with
    if (variant.indexOf(q) === 0) score = Math.max(score, 80);

    // Contains full query
    if (variant.indexOf(q) !== -1) score = Math.max(score, 60);

    // Word overlap
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
    if (matched > 0) {
      var wordScore = (matched / words.length) * 50;
      score = Math.max(score, wordScore);
    }
  }

  // Also match against label and desc
  var labelLower = entry.label.toLowerCase();
  var descLower = entry.desc.toLowerCase();
  if (labelLower.indexOf(q) !== -1) score = Math.max(score, 55);
  if (descLower.indexOf(q) !== -1) score = Math.max(score, 30);

  for (var w = 0; w < words.length; w++) {
    if (labelLower.indexOf(words[w]) !== -1) score = Math.max(score, 40);
  }

  return score;
}

export default function HelpSearch({ compact }) {
  var { t } = useTheme();
  var navigate = useNavigate();
  var [open, setOpen] = useState(false);
  var [query, setQuery] = useState("");
  var [selectedIdx, setSelectedIdx] = useState(0);
  var inputRef = useRef(null);
  var panelRef = useRef(null);

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
  } else if (open) {
    // Show suggested entries when empty
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
      setOpen(false);
      setQuery("");
      navigate(entry.path);
    },
    [navigate]
  );

  // Keyboard nav
  useEffect(
    function () {
      if (!open) return;
      var handler = function (e) {
        if (e.key === "Escape") {
          setOpen(false);
          setQuery("");
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
    [open, results, selectedIdx, handleSelect]
  );

  // Reset selection when results change
  useEffect(
    function () {
      setSelectedIdx(0);
    },
    [query]
  );

  // Close on outside click
  useEffect(
    function () {
      if (!open) return;
      var handler = function (e) {
        if (panelRef.current && !panelRef.current.contains(e.target)) {
          setOpen(false);
          setQuery("");
        }
      };
      document.addEventListener("mousedown", handler);
      return function () {
        document.removeEventListener("mousedown", handler);
      };
    },
    [open]
  );

  // Focus input when opened
  useEffect(
    function () {
      if (open && inputRef.current) inputRef.current.focus();
    },
    [open]
  );

  // Global "/" shortcut to open
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
      {/* Search trigger */}
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

      {/* Search panel — pops up above the button */}
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
            maxHeight: 380,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Input */}
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

          {/* Results */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {results.length === 0 && query.trim() ? (
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
                    <ArrowRight
                      size={12}
                      color={isSelected ? t.accent : "transparent"}
                      style={{ flexShrink: 0 }}
                    />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
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
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
          </div>
        </div>
      )}
    </div>
  );
}
