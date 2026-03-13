import { useState, useEffect, useCallback, useRef } from "react";
import {
  useParams,
  Link,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { logAudit } from "../../lib/audit";
import {
  useKeyboardShortcuts,
  ShortcutHelpOverlay,
} from "../../components/ui/KeyboardShortcuts";
import {
  AlertTriangle,
  Play,
  Trash2,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  Filter,
  ChevronDown,
  Eye,
  EyeOff,
  Download,
  HelpCircle,
  X,
  Lightbulb,
  FileText,
  Settings2,
} from "lucide-react";
import IssueDetailModal from "../../components/dashboard/IssueDetailModal";
import ScoreChart from "../../components/dashboard/ScoreChart";
import PageBreakdown from "../../components/dashboard/PageBreakdown";
import ScanConfigModal from "../../components/dashboard/ScanConfigModal";
import BulkFixBar from "../../components/dashboard/BulkFixBar";
import ReportButton from "../../components/dashboard/ReportButton";
import AccessibilitySimulator from "../../components/dashboard/AccessibilitySimulator";
import GitHubConnect from "../../components/dashboard/GithubConnect";
import SchedulePicker from "../../components/dashboard/SchedulePicker";
import ScanProfileEditor from "../../components/dashboard/ScanProfileEditor";
import PlanGate from "../../components/ui/PlanGate";
import CIWorkflowPanel from "../../components/dashboard/CIWorkflowPanel";
import ScanCompare from "../../components/dashboard/ScanCompare";
import AccessibilityStatementGenerator from "../../components/dashboard/AccessibilityStatementGenerator";
import ReportSchedulePicker from "../../components/dashboard/ReportSchedulePicker";
import QuickWinsCard from "../../components/dashboard/QuickWinsCard";
import { timeAgo, fullDate } from "../../lib/timeAgo";

// ── Extracted subcomponents ──
import {
  generateFingerprint,
  exportIssuesToCSV,
} from "../../lib/siteDetailUtils";
import { ImpactBadge, FixBadge } from "../../components/dashboard/ImpactBadge";
import VerifyPanel from "../../components/dashboard/VerifyPanel";
import IssueFilters from "../../components/dashboard/IssueFilters";
import ScoreExplainerModal from "../../components/dashboard/ScoreExplainerModal";
import {
  VerificationTokenPanel,
  BadgeEmbedPanel,
  IgnoreRulesPanel,
  DangerZonePanel,
} from "../../components/dashboard/SiteSettingsPanels";

/* ── Main page ── */
export default function SiteDetailPage() {
  const { t } = useTheme();
  const { session, org, refreshSites, user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  const [site, setSite] = useState(null);
  const [scans, setScans] = useState([]);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState(null);
  const [scanProgress, setScanProgress] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("overview");

  // Handle ?action=scan from command palette
  var pendingScanRef = useRef(false);

  // Set tab from ?tab= URL param (works on mount AND subsequent navigations)
  useEffect(
    function () {
      var urlTab = searchParams.get("tab");
      if (
        urlTab &&
        ["overview", "issues", "scans", "settings"].indexOf(urlTab) !== -1
      ) {
        setTab(urlTab);
        searchParams.delete("tab");
        setSearchParams(searchParams, { replace: true });
      }
      var action = searchParams.get("action");
      if (action === "scan") {
        searchParams.delete("action");
        setSearchParams(searchParams, { replace: true });
        pendingScanRef.current = true;
      }
    },
    [searchParams]
  );
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [filters, setFilters] = useState({});
  const [showScanConfig, setShowScanConfig] = useState(false);
  const [selectedForFix, setSelectedForFix] = useState([]);
  const [viewMode, setViewMode] = useState("grouped");
  const [groupBy, setGroupBy] = useState("rule");
  const [sortMode, setSortMode] = useState("severity");
  const [showDiff, setShowDiff] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [showScoreExplainer, setShowScoreExplainer] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [scoreCopied, setScoreCopied] = useState(false);
  const [showStatement, setShowStatement] = useState(false);
  const [scanJustCompleted, setScanJustCompleted] = useState(null);
  const [focusedIssueIdx, setFocusedIssueIdx] = useState(-1);
  const [issueSearch, setIssueSearch] = useState("");
  const issueSearchRef = useRef(null);
  const issueListRef = useRef(null);

  // Module-level cache for site detail data
  const cacheRef = useRef({ id: null, site: null, scans: null, issues: null });

  // Load data — uses cache if same site ID
  const loadData = useCallback(
    async (force) => {
      if (!force && cacheRef.current.id === id && cacheRef.current.site) {
        setSite(cacheRef.current.site);
        setScans(cacheRef.current.scans || []);
        setIssues(cacheRef.current.issues || []);
        setLoading(false);
        return;
      }
      // Parallel fetch — site, scans, and issues have no dependency on each other
      var [siteRes, scansRes, issuesRes] = await Promise.all([
        supabase.from("sites").select("*").eq("id", id).single(),
        supabase
          .from("scans")
          .select("*")
          .eq("site_id", id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("issues")
          .select("*")
          .eq("site_id", id)
          .order("created_at", { ascending: false })
          .limit(500),
      ]);
      var s = siteRes.data;
      var sc = scansRes.data || [];
      var iss = issuesRes.data || [];
      setSite(s);
      setScans(sc);
      setIssues(iss);
      if (s) {
        cacheRef.current = { id: id, site: s, scans: sc, issues: iss };
      }
      setLoading(false);
    },
    [id]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load org members for assignee display on issue rows
  const [memberMap, setMemberMap] = useState({});
  useEffect(
    function () {
      if (!org?.id) return;
      supabase
        .from("org_members")
        .select("user_id")
        .eq("org_id", org.id)
        .then(function (res) {
          var userIds = (res.data || []).map(function (m) {
            return m.user_id;
          });
          if (userIds.length === 0) return;
          supabase
            .from("profiles")
            .select("id, email, full_name")
            .in("id", userIds)
            .then(function (pRes) {
              var map = {};
              (pRes.data || []).forEach(function (p) {
                var name = p.full_name || p.email || "?";
                map[p.id] = {
                  name: name,
                  email: p.email || "",
                  initials: name.substring(0, 2).toUpperCase(),
                };
              });
              setMemberMap(map);
            });
        });
    },
    [org?.id]
  );

  // Realtime: listen for scan status changes
  useEffect(() => {
    const channel = supabase
      .channel(`scans-${id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "scans",
          filter: `site_id=eq.${id}`,
        },
        (payload) => {
          const scan = payload.new;
          if (scan.status === "running") {
            setScanProgress({
              status: "running",
              pagesScanned: scan.pages_scanned || 0,
              issuesFound: scan.issues_found || 0,
            });
          } else if (scan.status === "complete") {
            setScanProgress(null);
            setScanning(false);
            setScanJustCompleted({
              score: scan.score,
              pages: scan.pages_scanned,
              issues: scan.issues_found,
              time: Date.now(),
            });
            loadData(true); // Force reload everything
          } else if (scan.status === "failed") {
            setScanProgress(null);
            setScanning(false);
            setScanError(scan.error || "Scan failed");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id, loadData]);

  const handleScan = async (config = {}) => {
    setScanning(true);
    setScanError(null);
    setScanProgress({ status: "starting", pagesScanned: 0, issuesFound: 0 });
    setShowScanConfig(false);
    try {
      const body = { site_id: id };
      if (config.urls) body.urls = config.urls;
      if (config.scan_auth) body.scan_auth = config.scan_auth;
      const res = await supabase.functions.invoke("scan-site", {
        body,
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (res.error) throw new Error(res.error.message || "Scan failed");
      var scanData = res.data;
      await loadData(true);
      setScanProgress(null);
      if (scanData && !scanJustCompleted) {
        setScanJustCompleted({
          score: scanData.score,
          pages: scanData.pages_scanned,
          issues: scanData.issues_found,
          carriedForward: scanData.pages_carried_forward || 0,
          incremental: scanData.incremental || false,
          time: Date.now(),
        });
      }
    } catch (err) {
      setScanError(err.message);
      setScanProgress(null);
    }
    setScanning(false);
  };

  // Fire pending scan from ?action=scan URL param
  useEffect(
    function () {
      if (pendingScanRef.current && site && !scanning && !loading) {
        pendingScanRef.current = false;
        handleScan();
      }
    },
    [site, loading]
  );

  const handleIssueUpdate = (updatedIssue) => {
    setIssues((prev) =>
      prev.map((i) => (i.id === updatedIssue.id ? updatedIssue : i))
    );
  };

  const handleFilterByPage = (pageUrl) => {
    setFilters((prev) => ({ ...prev, page: [pageUrl] }));
    setTab("issues");
  };

  var handleAddIgnoreRule = async function (rule) {
    if (!site) return;
    var existing = site.ignore_rules || [];
    // Check for duplicate
    var isDuplicate = existing.some(function (r) {
      return (
        r.rule_id === rule.rule_id &&
        (!rule.selector || r.selector === rule.selector)
      );
    });
    if (isDuplicate) return;

    var updated = existing.concat([
      {
        rule_id: rule.rule_id,
        description: rule.description,
        selector: rule.selector || null,
        created_at: new Date().toISOString(),
      },
    ]);

    var { data } = await supabase
      .from("sites")
      .update({ ignore_rules: updated })
      .eq("id", site.id)
      .select()
      .single();
    if (data) setSite(data);

    // Bulk-mark matching open issues as ignored
    var matchingIds = issues
      .filter(function (i) {
        return i.status === "open" && i.rule_id === rule.rule_id;
      })
      .map(function (i) {
        return i.id;
      });

    if (matchingIds.length > 0) {
      await supabase
        .from("issues")
        .update({ status: "ignored" })
        .in("id", matchingIds);

      setIssues(function (prev) {
        return prev.map(function (i) {
          if (matchingIds.indexOf(i.id) !== -1) {
            return Object.assign({}, i, { status: "ignored" });
          }
          return i;
        });
      });
    }

    setSelectedIssue(null);

    logAudit({
      action: "settings.updated",
      resourceType: "site",
      resourceId: site.id,
      description:
        "Ignore rule added: " +
        rule.rule_id +
        " (" +
        matchingIds.length +
        " issues auto-ignored)",
      metadata: { rule_id: rule.rule_id, issues_ignored: matchingIds.length },
    });
  };

  // Apply filters
  // ── Scan diff: identify issues new in the latest scan ──
  var newIssueIds = new Set();
  var completedScans = scans.filter(function (s) {
    return s.status === "complete";
  });
  if (completedScans.length >= 2) {
    var latestScanId = completedScans[0].id;
    var prevScanId = completedScans[1].id;

    // Build fingerprint set from previous scan's issues (normalized for fuzzy matching)
    var prevFingerprints = new Set();
    for (var pi = 0; pi < issues.length; pi++) {
      if (issues[pi].scan_id === prevScanId) {
        prevFingerprints.add(
          generateFingerprint(
            issues[pi].rule_id,
            issues[pi].page_url,
            issues[pi].element_selector
          )
        );
      }
    }

    // Issues in the latest scan that have no match in previous scan = new
    for (var ni = 0; ni < issues.length; ni++) {
      if (issues[ni].scan_id === latestScanId) {
        var fp = generateFingerprint(
          issues[ni].rule_id,
          issues[ni].page_url,
          issues[ni].element_selector
        );
        if (!prevFingerprints.has(fp)) {
          newIssueIds.add(issues[ni].id);
        }
      }
    }
  } else if (completedScans.length === 1) {
    // First scan ever — all issues are "new"
    var firstScanId = completedScans[0].id;
    for (var fi = 0; fi < issues.length; fi++) {
      if (issues[fi].scan_id === firstScanId) {
        newIssueIds.add(issues[fi].id);
      }
    }
  }

  var newIssueCount = newIssueIds.size;

  var searchLower = issueSearch.trim().toLowerCase();

  const filteredIssues = issues.filter((issue) => {
    if (filters.impact?.length && !filters.impact.includes(issue.impact))
      return false;
    if (filters.status?.length && !filters.status.includes(issue.status))
      return false;
    if (
      filters.wcag?.length &&
      !filters.wcag.some((tag) => issue.wcag_tags?.includes(tag))
    )
      return false;
    if (filters.page?.length && !filters.page.includes(issue.page_url))
      return false;
    // Assigned to me filter
    if (filters.assigned_to_me && issue.assigned_to !== user?.id) return false;
    // Full-text search across descriptions, selectors, page URLs, rule IDs
    if (searchLower) {
      var haystack = (
        (issue.rule_id || "") +
        " " +
        (issue.description || "") +
        " " +
        (issue.element_selector || "") +
        " " +
        (issue.page_url || "")
      ).toLowerCase();
      if (haystack.indexOf(searchLower) === -1) return false;
    }
    return true;
  });

  // Sort: severity (default) or quick-wins (fixable + high-impact first)
  const impactOrder = { critical: 0, serious: 1, moderate: 2, minor: 3 };
  const sortedIssues = [...filteredIssues].sort(function (a, b) {
    if (sortMode === "quick-wins") {
      // Issues with fix suggestions come first
      var aHasFix = a.fix_suggestion ? 1 : 0;
      var bHasFix = b.fix_suggestion ? 1 : 0;
      if (bHasFix !== aHasFix) return bHasFix - aHasFix;
      // Within same fix-availability tier, sort by severity
      return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
    }
    // Default: severity only
    return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
  });

  // Group issues by rule_id + description (deduplication)
  var groupedIssues = [];
  var groupMap = {};

  if (groupBy === "page") {
    // Group by page_url
    for (var gi = 0; gi < sortedIssues.length; gi++) {
      var iss = sortedIssues[gi];
      var key = iss.page_url || "(unknown page)";
      if (!groupMap[key]) {
        groupMap[key] = {
          rule_id: key,
          description: null,
          label: key.replace(/^https?:\/\/[^/]+/, "").replace(/\/$/, "") || "/",
          impact: iss.impact,
          wcag_tags: [],
          instances: [],
          pages: new Set(),
          expanded: false,
          isPageGroup: true,
        };
        groupedIssues.push(groupMap[key]);
      }
      groupMap[key].instances.push(iss);
      groupMap[key].pages.add(iss.page_url);
      if (impactOrder[iss.impact] < impactOrder[groupMap[key].impact])
        groupMap[key].impact = iss.impact;
    }
  } else {
    // Group by rule_id (default)
    for (var gi = 0; gi < sortedIssues.length; gi++) {
      var iss = sortedIssues[gi];
      var key = iss.rule_id + "||" + (iss.description || "");
      if (!groupMap[key]) {
        groupMap[key] = {
          rule_id: iss.rule_id,
          description: iss.description,
          impact: iss.impact,
          wcag_tags: iss.wcag_tags,
          instances: [],
          pages: new Set(),
          expanded: false,
        };
        groupedIssues.push(groupMap[key]);
      }
      groupMap[key].instances.push(iss);
      if (iss.page_url) groupMap[key].pages.add(iss.page_url);
      if (impactOrder[iss.impact] < impactOrder[groupMap[key].impact])
        groupMap[key].impact = iss.impact;
    }
  }
  // Convert Sets to counts
  for (var gk = 0; gk < groupedIssues.length; gk++) {
    groupedIssues[gk].pageCount = groupedIssues[gk].pages.size;
    groupedIssues[gk].count = groupedIssues[gk].instances.length;
    groupedIssues[gk].allIds = groupedIssues[gk].instances.map(function (i) {
      return i.id;
    });
    // Count how many instances have fix suggestions (used for quick-wins sort)
    groupedIssues[gk].fixableCount = groupedIssues[gk].instances.filter(
      function (i) {
        return !!i.fix_suggestion;
      }
    ).length;
    groupedIssues[gk].newCount = groupedIssues[gk].instances.filter(function (
      i
    ) {
      return newIssueIds.has(i.id);
    }).length;
  }

  // In quick-wins mode, re-sort groups: fully fixable groups first, then by severity
  if (sortMode === "quick-wins") {
    groupedIssues.sort(function (a, b) {
      var aAllFixable =
        a.fixableCount === a.count ? 1 : a.fixableCount > 0 ? 0.5 : 0;
      var bAllFixable =
        b.fixableCount === b.count ? 1 : b.fixableCount > 0 ? 0.5 : 0;
      if (bAllFixable !== aAllFixable) return bAllFixable - aAllFixable;
      return (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4);
    });
  }

  // ── Focus management for keyboard navigation ──
  // Reset focus when tab, filters, or search change
  useEffect(
    function () {
      setFocusedIssueIdx(-1);
    },
    [tab, filters, issueSearch, sortMode, viewMode, groupBy]
  );

  // Auto-scroll focused issue into view
  useEffect(
    function () {
      if (focusedIssueIdx < 0 || tab !== "issues") return;
      var el = issueListRef.current?.querySelector(
        '[data-focus-idx="' + focusedIssueIdx + '"]'
      );
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    },
    [focusedIssueIdx, tab]
  );

  // Auto-expand group containing focused issue (grouped view)
  useEffect(
    function () {
      if (focusedIssueId == null || viewMode !== "grouped") return;
      for (var gi = 0; gi < groupedIssues.length; gi++) {
        var group = groupedIssues[gi];
        var groupKey = group.rule_id + "-" + gi;
        for (var ii = 0; ii < group.instances.length; ii++) {
          if (group.instances[ii].id === focusedIssueId) {
            if (!expandedGroups[groupKey]) {
              setExpandedGroups(function (prev) {
                var next = Object.assign({}, prev);
                next[groupKey] = true;
                return next;
              });
            }
            return;
          }
        }
      }
    },
    [focusedIssueId, viewMode]
  );

  // Flat list of issues for keyboard navigation (works in both grouped and flat view)
  var navIssues = viewMode === "flat" ? sortedIssues : sortedIssues;
  var navIssueCount = navIssues.length;
  var focusedIssueId =
    focusedIssueIdx >= 0 && focusedIssueIdx < navIssueCount
      ? navIssues[focusedIssueIdx].id
      : null;

  // ── Keyboard shortcuts ──
  var shortcutDefs = [
    {
      key: "?",
      description: "Show keyboard shortcuts",
      category: "General",
      handler: function () {
        setShowShortcutHelp(true);
      },
    },
    {
      key: "s",
      description: "Run scan",
      category: "Actions",
      handler: function () {
        if (!scanning && !isClient && site) handleScan();
      },
    },
    {
      key: "1",
      description: "Overview tab",
      category: "Navigation",
      handler: function () {
        setTab("overview");
      },
    },
    {
      key: "2",
      description: "Issues tab",
      category: "Navigation",
      handler: function () {
        setTab("issues");
      },
    },
    {
      key: "3",
      description: "Scans tab",
      category: "Navigation",
      handler: function () {
        setTab("scans");
      },
    },
    {
      key: "4",
      description: "Settings tab",
      category: "Navigation",
      handler: function () {
        if (!isClient) setTab("settings");
      },
    },
    {
      key: "j",
      description: "Next issue",
      category: "Issues",
      handler: function () {
        if (tab !== "issues" || navIssueCount === 0) return;
        setFocusedIssueIdx(function (prev) {
          return Math.min(prev + 1, navIssueCount - 1);
        });
      },
    },
    {
      key: "k",
      description: "Previous issue",
      category: "Issues",
      handler: function () {
        if (tab !== "issues" || navIssueCount === 0) return;
        setFocusedIssueIdx(function (prev) {
          return Math.max(prev - 1, 0);
        });
      },
    },
    {
      key: "enter",
      description: "Open focused issue",
      category: "Issues",
      handler: function () {
        if (
          tab !== "issues" ||
          focusedIssueIdx < 0 ||
          focusedIssueIdx >= navIssueCount
        )
          return;
        setSelectedIssue(navIssues[focusedIssueIdx]);
      },
    },
    {
      key: "f",
      description: "Open issue (view fix)",
      category: "Issues",
      handler: function () {
        if (tab !== "issues") return;
        if (focusedIssueIdx >= 0 && focusedIssueIdx < navIssueCount) {
          setSelectedIssue(navIssues[focusedIssueIdx]);
        }
      },
    },
    {
      key: "g",
      description: "Open issue (GitHub)",
      category: "Issues",
      handler: function () {
        if (tab !== "issues") return;
        if (focusedIssueIdx >= 0 && focusedIssueIdx < navIssueCount) {
          setSelectedIssue(navIssues[focusedIssueIdx]);
        }
      },
    },
    {
      key: "x",
      description: "Toggle select for bulk fix",
      category: "Issues",
      handler: function () {
        if (
          tab !== "issues" ||
          focusedIssueIdx < 0 ||
          focusedIssueIdx >= navIssueCount
        )
          return;
        var issue = navIssues[focusedIssueIdx];
        setSelectedForFix(function (prev) {
          if (prev.indexOf(issue.id) !== -1) {
            return prev.filter(function (id) {
              return id !== issue.id;
            });
          }
          if (prev.length >= maxPerPr) return prev;
          return prev.concat([issue.id]);
        });
      },
    },
    {
      key: "p",
      description: "Create PR (with selected)",
      category: "Actions",
      handler: function () {
        // Focus the bulk fix bar — it auto-shows when selectedForFix.length > 0
        if (selectedForFix.length === 0 || tab !== "issues") return;
        var prBtn = document.querySelector("[data-bulk-pr-btn]");
        if (prBtn) prBtn.click();
      },
    },
    {
      key: "/",
      description: "Search issues",
      category: "Issues",
      handler: function () {
        setTab("issues");
        // Defer focus to next frame so the input is rendered
        setTimeout(function () {
          if (issueSearchRef.current) issueSearchRef.current.focus();
        }, 50);
      },
    },
    {
      key: "c",
      description: "Compare scans",
      category: "Actions",
      handler: function () {
        if (
          scans.filter(function (s) {
            return s.status === "complete";
          }).length >= 2
        ) {
          setShowCompare(true);
        }
      },
    },
    {
      key: "d",
      description: "Toggle scan diff",
      category: "Issues",
      handler: function () {
        if (tab !== "issues") setTab("issues");
        if (completedScans.length >= 2 && newIssueCount > 0) {
          setShowDiff(function (v) {
            return !v;
          });
        }
      },
    },
    {
      key: "escape",
      description: "Close / deselect",
      category: "General",
      handler: function () {
        if (showShortcutHelp) {
          setShowShortcutHelp(false);
          return;
        }
        if (selectedIssue) {
          setSelectedIssue(null);
          return;
        }
        if (showScanConfig) {
          setShowScanConfig(false);
          return;
        }
        // Clear search if active
        if (issueSearch) {
          setIssueSearch("");
          return;
        }
        // Clear focus
        if (focusedIssueIdx >= 0) {
          setFocusedIssueIdx(-1);
          return;
        }
      },
    },
  ];
  useKeyboardShortcuts(shortcutDefs);

  // #25 — Dynamic browser tab title with issue count
  useEffect(
    function () {
      if (!site) return;
      var siteName = site.display_name || site.domain || "";
      var open = issues.filter(function (i) {
        return i.status === "open";
      }).length;
      var parts = [];
      if (tab === "issues" && open > 0) {
        parts.push(open + " issue" + (open !== 1 ? "s" : ""));
      }
      parts.push(siteName);
      parts.push("xsbl");
      document.title = parts.join(" — ");
      return function () {
        document.title = "xsbl — Accessibility Scanner";
      };
    },
    [site, tab, issues]
  );

  if (loading)
    return (
      <div>
        {/* ← Sites back link */}
        <div
          style={{
            width: 60,
            height: 13,
            borderRadius: 4,
            background: t.ink08,
            marginBottom: "0.5rem",
            animation: "skeletonPulse 1.5s ease-in-out infinite",
          }}
        />

        {/* Title row: site name + verified badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            marginBottom: "0.3rem",
          }}
        >
          <div
            style={{
              width: 200,
              height: 26,
              borderRadius: 6,
              background: t.ink08,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <div
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: t.ink08,
              }}
            />
            <div
              style={{
                width: 55,
                height: 10,
                borderRadius: 3,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.05s",
              }}
            />
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            width: 140,
            height: 12,
            borderRadius: 4,
            background: t.ink08,
            marginBottom: "1.5rem",
            animation: "skeletonPulse 1.5s ease-in-out infinite",
            animationDelay: "0.05s",
          }}
        />

        {/* Tab bar */}
        <div
          style={{
            display: "flex",
            gap: "0.15rem",
            borderBottom: "1px solid " + t.ink08,
            marginBottom: "1.5rem",
            paddingBottom: "0.15rem",
          }}
        >
          {[65, 55, 48, 60].map(function (w, i) {
            return (
              <div
                key={i}
                style={{
                  width: w,
                  height: 14,
                  borderRadius: 4,
                  background: i === 0 ? t.accentBg : t.ink04,
                  margin: "0.55rem 0.45rem",
                  animation: "skeletonPulse 1.5s ease-in-out infinite",
                  animationDelay: i * 0.04 + "s",
                }}
              />
            );
          })}
        </div>

        {/* Scan panel skeleton */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderRadius: 12,
            border: "1px solid " + t.ink04,
            background: t.accentBg,
            marginBottom: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                width: 100,
                height: 16,
                borderRadius: 4,
                background: t.ink08,
                marginBottom: "0.3rem",
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.08s",
              }}
            />
            <div
              style={{
                width: 170,
                height: 11,
                borderRadius: 3,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.12s",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <div
              style={{
                width: 72,
                height: 34,
                borderRadius: 8,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.1s",
              }}
            />
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.14s",
              }}
            />
          </div>
        </div>

        {/* Stats grid — 5 cards matching actual layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.8rem",
            marginBottom: "1.5rem",
          }}
        >
          {[1, 2, 3, 4, 5].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  padding: "1rem",
                  borderRadius: 10,
                  border: "1px solid " + t.ink08,
                  background: t.cardBg,
                }}
              >
                <div
                  style={{
                    width: 55 + (i % 3) * 12,
                    height: 9,
                    borderRadius: 3,
                    background: t.ink08,
                    marginBottom: "0.3rem",
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    animationDelay: i * 0.06 + "s",
                  }}
                />
                <div
                  style={{
                    width: i === 5 ? 70 : 40,
                    height: i === 5 ? 13 : 24,
                    borderRadius: 5,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    animationDelay: i * 0.06 + 0.03 + "s",
                  }}
                />
              </div>
            );
          })}
        </div>

        {/* Score chart placeholder */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            padding: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              width: 90,
              height: 10,
              borderRadius: 3,
              background: t.ink08,
              marginBottom: "1rem",
              animation: "skeletonPulse 1.5s ease-in-out infinite",
              animationDelay: "0.15s",
            }}
          />
          <div
            style={{
              height: 140,
              borderRadius: 6,
              background: t.ink04,
              animation: "skeletonPulse 1.5s ease-in-out infinite",
              animationDelay: "0.2s",
            }}
          />
        </div>

        {/* Page breakdown placeholder */}
        <div
          style={{
            borderRadius: 10,
            border: "1px solid " + t.ink08,
            background: t.cardBg,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "0.9rem 1.1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                width: 110,
                height: 13,
                borderRadius: 4,
                background: t.ink08,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.2s",
              }}
            />
            <div
              style={{
                width: 30,
                height: 16,
                borderRadius: 3,
                background: t.ink04,
                animation: "skeletonPulse 1.5s ease-in-out infinite",
                animationDelay: "0.22s",
              }}
            />
          </div>
          {[1, 2, 3].map(function (i) {
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.65rem 1.1rem",
                  borderTop: "1px solid " + t.ink04,
                }}
              >
                <div>
                  <div
                    style={{
                      width: 120 + i * 20,
                      height: 12,
                      borderRadius: 3,
                      background: t.ink08,
                      marginBottom: "0.25rem",
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      animationDelay: 0.22 + i * 0.06 + "s",
                    }}
                  />
                  <div
                    style={{
                      width: 80 + i * 15,
                      height: 9,
                      borderRadius: 3,
                      background: t.ink04,
                      animation: "skeletonPulse 1.5s ease-in-out infinite",
                      animationDelay: 0.24 + i * 0.06 + "s",
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 28,
                    height: 18,
                    borderRadius: 4,
                    background: t.ink08,
                    animation: "skeletonPulse 1.5s ease-in-out infinite",
                    animationDelay: 0.26 + i * 0.06 + "s",
                  }}
                />
              </div>
            );
          })}
        </div>

        <style>{`@keyframes skeletonPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }`}</style>
      </div>
    );
  if (!site)
    return (
      <div>
        <p style={{ color: t.ink50 }}>Site not found.</p>
        <Link
          to="/dashboard/sites"
          style={{ color: t.accent, textDecoration: "none" }}
        >
          Back to sites
        </Link>
      </div>
    );

  const tabDefs = [
    { id: "overview", label: "Overview" },
    {
      id: "issues",
      label: `Issues (${issues.filter((i) => i.status === "open").length})`,
    },
    { id: "scans", label: "Scans" },
    !isClient && { id: "settings", label: "Settings" },
  ].filter(Boolean);

  const openCount = issues.filter((i) => i.status === "open").length;
  const criticalCount = issues.filter(
    (i) => i.impact === "critical" && i.status === "open"
  ).length;
  const seriousCount = issues.filter(
    (i) => i.impact === "serious" && i.status === "open"
  ).length;

  var handleCopyScore = function () {
    var domain = site.display_name || site.domain || "";
    var score = site.score != null ? Math.round(site.score) : "N/A";
    var parts = [domain + " — Accessibility: " + score + "/100 (WCAG 2.2 AA)"];
    var issueParts = [];
    if (criticalCount > 0) issueParts.push(criticalCount + " critical");
    if (seriousCount > 0) issueParts.push(seriousCount + " serious");
    if (issueParts.length > 0) {
      parts.push(openCount + " open issues (" + issueParts.join(", ") + ")");
    } else if (openCount > 0) {
      parts.push(openCount + " open issues");
    } else {
      parts.push("No open issues");
    }
    parts.push("xsbl.io");
    navigator.clipboard.writeText(parts.join(" — ")).then(function () {
      setScoreCopied(true);
      setTimeout(function () {
        setScoreCopied(false);
      }, 2000);
    });
  };

  var plan = org?.plan || "free";
  var isClient = org?.role === "client";

  var ISSUES_PER_PR = { free: 1, starter: 5, pro: 10, agency: 20 };
  var maxPerPr = ISSUES_PER_PR[plan] || 1;
  var atSelectionCap = selectedForFix.length >= maxPerPr;

  return (
    <div>
      {/* Header */}
      <Link
        to="/dashboard/sites"
        style={{
          color: t.ink50,
          textDecoration: "none",
          fontSize: "0.82rem",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
          marginBottom: "0.5rem",
        }}
      >
        <ArrowLeft size={14} strokeWidth={1.8} /> Sites
      </Link>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          flexWrap: "wrap",
          marginBottom: "0.3rem",
        }}
      >
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.6rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          {site.display_name || site.domain}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: site.verified ? t.green : t.amber,
            }}
          />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.66rem",
              color: site.verified ? t.green : t.amber,
              fontWeight: 600,
            }}
          >
            {site.verified ? "Verified" : "Unverified"}
          </span>
        </div>
      </div>
      <p
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.78rem",
          color: t.ink50,
          marginBottom: "1.5rem",
        }}
      >
        {site.domain}
      </p>

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Site sections"
        style={{
          display: "flex",
          gap: "0.15rem",
          borderBottom: `1px solid ${t.ink08}`,
          marginBottom: "1.5rem",
        }}
      >
        {tabDefs.map(({ id: tid, label }) => (
          <button
            key={tid}
            role="tab"
            aria-selected={tab === tid}
            aria-controls={"tabpanel-" + tid}
            id={"tab-" + tid}
            onClick={() => setTab(tid)}
            style={{
              padding: "0.55rem 0.9rem",
              border: "none",
              borderBottom: `2px solid ${
                tab === tid ? t.accent : "transparent"
              }`,
              background: "none",
              color: tab === tid ? t.accent : t.ink50,
              fontFamily: "var(--body)",
              fontSize: "0.84rem",
              fontWeight: tab === tid ? 600 : 500,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {!site.verified && tab === "overview" && (
        <VerifyPanel
          site={site}
          onVerified={function () {
            /* Immediately update local state so UI reflects verified */
            setSite(function (prev) {
              return Object.assign({}, prev, { verified: true });
            });
            /* Also update the cache so navigating away and back stays correct */
            if (cacheRef.current.site) {
              cacheRef.current.site = Object.assign({}, cacheRef.current.site, {
                verified: true,
              });
            }
            /* Invalidate the sites list cache so SitesPage shows verified too */
            refreshSites();
            /* Force a background reload to sync everything from DB */
            loadData(true);
            logAudit({
              action: "site.verified",
              resourceType: "site",
              resourceId: site.id,
              description: "Verified ownership of " + site.domain,
              metadata: { domain: site.domain },
            });
          }}
        />
      )}

      {/* ── Overview ── */}
      {tab === "overview" && (
        <div
          role="tabpanel"
          id="tabpanel-overview"
          aria-labelledby="tab-overview"
        >
          {/* ── Scan panel (hidden for client users) ── */}
          {!isClient && (
            <div
              style={{
                padding: "1.2rem 1.4rem",
                borderRadius: 12,
                border: "1px solid " + t.accent + "25",
                background: t.accentBg,
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "0.8rem",
                }}
              >
                <div>
                  <h2
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: t.ink,
                      margin: "0 0 0.15rem",
                    }}
                  >
                    Run a scan
                  </h2>
                  <p
                    title={site.last_scan_at ? fullDate(site.last_scan_at) : ""}
                    style={{
                      fontFamily: "var(--body)",
                      fontSize: "0.78rem",
                      color: t.ink50,
                      margin: 0,
                    }}
                  >
                    {site.last_scan_at
                      ? "Last scanned " + timeAgo(site.last_scan_at)
                      : "No scans yet"}
                  </p>
                </div>
                <button
                  onClick={() => handleScan()}
                  disabled={scanning}
                  style={{
                    padding: "0.55rem 1.4rem",
                    borderRadius: 8,
                    border: "none",
                    background: t.accent,
                    color: "white",
                    fontFamily: "var(--body)",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    cursor: scanning ? "not-allowed" : "pointer",
                    opacity: scanning ? 0.6 : 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {scanning ? (
                    <Loader2 size={15} className="xsbl-spin" />
                  ) : (
                    <Play size={15} fill="white" />
                  )}
                  {scanning ? "Scanning" : "Scan now"}
                </button>
              </div>

              {/* Secondary action bar */}
              <div
                style={{
                  display: "inline-flex",
                  flexWrap: "wrap",
                  borderRadius: 8,
                  background: t.ink04,
                  border: "1px solid " + t.ink08,
                  padding: 3,
                  gap: 2,
                  marginTop: "0.8rem",
                }}
              >
                {[
                  {
                    label: "Configure",
                    icon: Settings2,
                    onClick: function () {
                      setShowScanConfig(true);
                    },
                    show: true,
                  },
                  {
                    label: "Simulator",
                    icon: Eye,
                    onClick: function () {
                      setShowSimulator(true);
                    },
                    show: scans.length > 0,
                    planGate: "starter",
                    planFeature: "Simulator",
                  },
                  {
                    label: "Statement",
                    icon: FileText,
                    onClick: function () {
                      setShowStatement(true);
                    },
                    show: site.score != null,
                  },
                ]
                  .filter(function (a) {
                    return a.show;
                  })
                  .map(function (action) {
                    var Icon = action.icon;
                    var btn = (
                      <button
                        key={action.label}
                        onClick={action.onClick}
                        disabled={scanning}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          padding: "0.35rem 0.7rem",
                          height: 30,
                          borderRadius: 6,
                          border: "none",
                          background: "transparent",
                          color: t.ink50,
                          fontFamily: "var(--body)",
                          fontSize: "0.76rem",
                          fontWeight: 500,
                          cursor: scanning ? "not-allowed" : "pointer",
                          transition: "color 0.15s, background 0.15s",
                          whiteSpace: "nowrap",
                        }}
                        onMouseEnter={function (e) {
                          e.currentTarget.style.background = t.cardBg;
                          e.currentTarget.style.color = t.ink;
                          e.currentTarget.style.boxShadow =
                            "0 1px 3px " + t.ink08;
                        }}
                        onMouseLeave={function (e) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = t.ink50;
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      >
                        <Icon size={13} strokeWidth={1.8} />
                        {action.label}
                      </button>
                    );
                    if (action.planGate) {
                      return (
                        <PlanGate
                          key={action.label}
                          currentPlan={plan}
                          requiredPlan={action.planGate}
                          feature={action.planFeature}
                          compact
                        >
                          {btn}
                        </PlanGate>
                      );
                    }
                    return btn;
                  })}
                {scans.length > 0 && (
                  <PlanGate
                    currentPlan={plan}
                    requiredPlan="pro"
                    feature="PDF reports"
                    compact
                  >
                    <ReportButton
                      site={site}
                      scan={scans[0]}
                      className="scan-seg-btn"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.3rem",
                        padding: "0.35rem 0.7rem",
                        height: 30,
                        borderRadius: 6,
                        border: "none",
                        background: "transparent",
                        color: t.ink50,
                        fontFamily: "var(--body)",
                        fontSize: "0.76rem",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "color 0.15s, background 0.15s",
                        whiteSpace: "nowrap",
                        boxSizing: "border-box",
                      }}
                    />
                  </PlanGate>
                )}
              </div>

              {/* Progress + error below buttons */}
              <div aria-live="polite" aria-atomic="true">
                {scanProgress && (
                  <div
                    style={{
                      marginTop: "0.8rem",
                      padding: "0.7rem 1rem",
                      borderRadius: 10,
                      background: t.cardBg,
                      border: "1px solid " + t.ink08,
                      overflow: "hidden",
                    }}
                  >
                    {/* Header row */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.55rem",
                      }}
                    >
                      <Loader2
                        size={13}
                        className="xsbl-spin"
                        color={t.accent}
                      />
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.72rem",
                          fontWeight: 600,
                          color: t.accent,
                        }}
                      >
                        {scanProgress.status === "starting"
                          ? "Starting scan\u2026"
                          : "Scanning your site\u2026"}
                      </span>
                    </div>

                    {/* Animated progress bar (indeterminate) */}
                    <div
                      style={{
                        height: 3,
                        borderRadius: 2,
                        background: t.ink08,
                        marginBottom: "0.6rem",
                        overflow: "hidden",
                        position: "relative",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          height: "100%",
                          width: "40%",
                          borderRadius: 2,
                          background: t.accent,
                          animation:
                            "xsbl-progress-slide 1.4s ease-in-out infinite",
                        }}
                      />
                    </div>

                    {/* Live counters */}
                    <div
                      style={{
                        display: "flex",
                        gap: "1.5rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "0.15rem",
                          }}
                        >
                          Pages scanned
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color: t.ink,
                            lineHeight: 1,
                          }}
                        >
                          {scanProgress.pagesScanned}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: "0.15rem",
                          }}
                        >
                          Issues found
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--serif)",
                            fontSize: "1.15rem",
                            fontWeight: 700,
                            color:
                              scanProgress.issuesFound > 0 ? t.amber : t.ink,
                            lineHeight: 1,
                          }}
                        >
                          {scanProgress.issuesFound}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {scanError && (
                  <div
                    role="alert"
                    style={{
                      marginTop: "0.6rem",
                      padding: "0.55rem 0.9rem",
                      borderRadius: 8,
                      background: t.red + "08",
                      border: "1px solid " + t.red + "20",
                      color: t.red,
                      fontSize: "0.82rem",
                      lineHeight: 1.5,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <AlertTriangle
                      size={14}
                      strokeWidth={2}
                      style={{ flexShrink: 0 }}
                    />
                    {scanError}
                  </div>
                )}
              </div>
              {/* end aria-live */}
            </div>
          )}

          {/* Scan just completed — quick actions */}
          {scanJustCompleted && (
            <div
              style={{
                marginBottom: "1rem",
                padding: "0.9rem 1.1rem",
                borderRadius: 10,
                border: "1px solid " + t.green + "25",
                background: t.greenBg || t.green + "06",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                flexWrap: "wrap",
              }}
            >
              <Check
                size={16}
                color={t.green}
                strokeWidth={2.5}
                style={{ flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 120 }}>
                <div
                  style={{
                    fontSize: "0.84rem",
                    fontWeight: 600,
                    color: t.green,
                  }}
                >
                  Scan complete
                </div>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.66rem",
                    color: t.ink50,
                    marginTop: "0.1rem",
                  }}
                >
                  {scanJustCompleted.pages &&
                    scanJustCompleted.pages +
                      " page" +
                      (scanJustCompleted.pages !== 1 ? "s" : "") +
                      " · "}
                  {scanJustCompleted.issues != null &&
                    scanJustCompleted.issues +
                      " issue" +
                      (scanJustCompleted.issues !== 1 ? "s" : "")}
                  {scanJustCompleted.score != null &&
                    " · score " + Math.round(scanJustCompleted.score)}
                  {scanJustCompleted.incremental && (
                    <div style={{ color: t.accent }}>
                      {scanJustCompleted.carriedForward} unchanged page
                      {scanJustCompleted.carriedForward !== 1 ? "s" : ""}{" "}
                      skipped
                    </div>
                  )}
                </div>
              </div>
              <div
                style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}
              >
                {scanJustCompleted.issues > 0 && (
                  <button
                    onClick={function () {
                      setTab("issues");
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "none",
                      background: t.accent,
                      color: "white",
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    View issues
                  </button>
                )}
                {scans.length >= 2 && (
                  <button
                    onClick={function () {
                      setShowCompare(true);
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Compare
                  </button>
                )}
                {!site.scan_schedule || site.scan_schedule === "manual" ? (
                  <button
                    onClick={function () {
                      setTab("settings");
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Schedule scans
                  </button>
                ) : null}
                {site.score != null && (
                  <button
                    onClick={function () {
                      setShowStatement(true);
                      setScanJustCompleted(null);
                    }}
                    style={{
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.74rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Statement
                  </button>
                )}
                <button
                  onClick={function () {
                    setScanJustCompleted(null);
                  }}
                  aria-label="Dismiss"
                  style={{
                    padding: "0.2rem",
                    borderRadius: 4,
                    border: "none",
                    background: "none",
                    color: t.ink50,
                    cursor: "pointer",
                    display: "flex",
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.8rem",
              marginBottom: "1.5rem",
            }}
          >
            {/* Score card — special with explainer link */}
            <div
              style={{
                padding: "1rem",
                borderRadius: 10,
                border: `1px solid ${t.ink08}`,
                background: t.cardBg,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.3rem",
                  }}
                >
                  Score
                </div>
                {site.score != null && (
                  <button
                    onClick={handleCopyScore}
                    title={scoreCopied ? "Copied!" : "Copy score summary"}
                    aria-label={
                      scoreCopied
                        ? "Copied to clipboard"
                        : "Copy score summary to clipboard"
                    }
                    style={{
                      background: "none",
                      border: "none",
                      padding: "0.2rem",
                      cursor: "pointer",
                      color: scoreCopied ? t.green : t.ink50,
                      display: "flex",
                      alignItems: "center",
                      borderRadius: 4,
                      transition: "color 0.15s",
                    }}
                  >
                    {scoreCopied ? (
                      <Check size={12} strokeWidth={2.5} />
                    ) : (
                      <Copy size={12} strokeWidth={2} />
                    )}
                  </button>
                )}
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color:
                    site.score != null
                      ? site.score >= 80
                        ? t.green
                        : site.score >= 50
                        ? t.amber
                        : t.red
                      : t.ink50,
                }}
              >
                {site.score != null ? Math.round(site.score) : "\u2014"}
              </div>
              {site.score != null && site.score < 80 && (
                <button
                  onClick={function () {
                    setShowScoreExplainer(true);
                  }}
                  style={{
                    marginTop: "0.35rem",
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    color: t.accent,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                >
                  <HelpCircle size={11} /> Why this score?
                </button>
              )}
            </div>

            {/* Remaining stat cards */}
            {[
              {
                label: "Open issues",
                value: openCount,
                color: openCount > 0 ? t.red : t.green,
              },
              {
                label: "Critical",
                value: criticalCount,
                color: criticalCount > 0 ? t.red : t.green,
              },
              { label: "Total scans", value: scans.length, color: t.ink },
              {
                label: "Last scan",
                value: site.last_scan_at ? timeAgo(site.last_scan_at) : "Never",
                title: site.last_scan_at ? fullDate(site.last_scan_at) : "",
                color: t.ink,
                small: true,
              },
            ].map(({ label, value, color, small, title }) => (
              <div
                key={label}
                title={title || ""}
                style={{
                  padding: "1rem",
                  borderRadius: 10,
                  border: `1px solid ${t.ink08}`,
                  background: t.cardBg,
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.3rem",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: small ? "var(--body)" : "var(--serif)",
                    fontSize: small ? "0.82rem" : "1.5rem",
                    fontWeight: small ? 600 : 700,
                    color,
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          {/* Powered by badge — free tier only */}
          {plan === "free" && site.score != null && (
            <div style={{ textAlign: "center", marginBottom: "1rem" }}>
              <a
                href="https://xsbl.io"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  padding: "0.3rem 0.7rem",
                  borderRadius: 6,
                  border: "1px solid " + t.ink08,
                  background: t.ink04,
                  textDecoration: "none",
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  color: t.ink50,
                  transition: "all 0.15s",
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.borderColor = t.accent;
                  e.currentTarget.style.color = t.accent;
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.borderColor = t.ink08;
                  e.currentTarget.style.color = t.ink50;
                }}
              >
                Scanned by{" "}
                <span style={{ fontWeight: 600, color: t.ink }}>xsbl</span>
                <span style={{ color: t.accent }}>.</span>
              </a>
            </div>
          )}

          {/* Quick wins — prioritized "fix these first" card */}
          {issues.filter(function (i) {
            return i.status === "open";
          }).length > 0 && (
            <QuickWinsCard
              issues={issues}
              siteId={site.id}
              onSelect={function (issue) {
                setSelectedIssue(issue);
              }}
            />
          )}

          {/* Page breakdown from latest scan */}
          {scans.length > 0 && scans[0].summary_json?.pages?.length > 1 && (
            <PlanGate
              currentPlan={plan}
              requiredPlan="pro"
              feature="Per-page breakdown"
            >
              <PageBreakdown
                scan={scans[0]}
                issues={issues}
                onFilterByPage={handleFilterByPage}
              />
            </PlanGate>
          )}

          {/* Score chart */}
          <div style={{ marginBottom: "1.5rem" }}>
            <PlanGate
              currentPlan={plan}
              requiredPlan="pro"
              feature="Score trends"
            >
              <ScoreChart scans={scans} />
            </PlanGate>
          </div>

          <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-progress-slide { 0% { left: -40%; } 100% { left: 100%; } }`}</style>
        </div>
      )}

      {/* ── Issues ── */}
      {tab === "issues" && (
        <div role="tabpanel" id="tabpanel-issues" aria-labelledby="tab-issues">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.6rem",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <IssueFilters
              filters={filters}
              setFilters={setFilters}
              issues={issues}
              userId={user?.id}
            />
            {/* Issue search */}
            <div style={{ position: "relative", minWidth: 160 }}>
              <input
                ref={issueSearchRef}
                value={issueSearch}
                onChange={function (e) {
                  setIssueSearch(e.target.value);
                }}
                placeholder="Search issues…  /"
                aria-label="Search issues"
                style={{
                  width: "100%",
                  padding: "0.35rem 0.65rem",
                  paddingRight: issueSearch ? "1.6rem" : "0.65rem",
                  borderRadius: 6,
                  border: "1.5px solid " + (issueSearch ? t.accent : t.ink08),
                  background: t.paper,
                  color: t.ink,
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.15s",
                }}
                onFocus={function (e) {
                  e.currentTarget.style.borderColor = t.accent;
                }}
                onBlur={function (e) {
                  if (!issueSearch) e.currentTarget.style.borderColor = t.ink08;
                }}
              />
              {issueSearch && (
                <button
                  onClick={function () {
                    setIssueSearch("");
                    issueSearchRef.current?.focus();
                  }}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: 4,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    padding: "0.15rem",
                    cursor: "pointer",
                    color: t.ink50,
                    display: "flex",
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
            <div
              style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}
            >
              <div
                style={{
                  display: "flex",
                  background: t.ink04,
                  borderRadius: 6,
                  padding: "0.15rem",
                }}
              >
                {[
                  { v: "rule", l: "By rule" },
                  { v: "page", l: "By page" },
                  { v: "flat", l: "Flat" },
                ].map(function (opt) {
                  var isActive =
                    opt.v === "flat"
                      ? viewMode === "flat"
                      : viewMode === "grouped" && groupBy === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={function () {
                        if (opt.v === "flat") {
                          setViewMode("flat");
                        } else {
                          setViewMode("grouped");
                          setGroupBy(opt.v);
                        }
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 5,
                        border: "none",
                        background: isActive ? t.cardBg : "transparent",
                        color: isActive ? t.ink : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>

              {/* Sort mode toggle */}
              <div
                style={{
                  display: "flex",
                  background: t.ink04,
                  borderRadius: 6,
                  padding: "0.15rem",
                }}
              >
                {[
                  { v: "severity", l: "Severity" },
                  { v: "quick-wins", l: "Quick wins" },
                ].map(function (opt) {
                  var isActive = sortMode === opt.v;
                  return (
                    <button
                      key={opt.v}
                      onClick={function () {
                        setSortMode(opt.v);
                      }}
                      style={{
                        padding: "0.25rem 0.6rem",
                        borderRadius: 5,
                        border: "none",
                        background: isActive ? t.cardBg : "transparent",
                        color: isActive
                          ? opt.v === "quick-wins"
                            ? t.green
                            : t.ink
                          : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 1px 3px rgba(0,0,0,0.08)"
                          : "none",
                      }}
                    >
                      {opt.l}
                    </button>
                  );
                })}
              </div>

              {/* Scan diff toggle */}
              {completedScans.length >= 2 && newIssueCount > 0 && (
                <button
                  onClick={function () {
                    setShowDiff(function (v) {
                      return !v;
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: 5,
                    border: showDiff
                      ? "1.5px solid " + t.green
                      : "1.5px solid " + t.ink08,
                    background: showDiff ? t.green + "10" : "transparent",
                    color: showDiff ? t.green : t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: showDiff ? t.green : t.ink50,
                      flexShrink: 0,
                    }}
                  />
                  {newIssueCount} new
                </button>
              )}

              {sortedIssues.length > 0 && (
                <button
                  onClick={function () {
                    exportIssuesToCSV(
                      sortedIssues,
                      site.display_name || site.domain
                    );
                  }}
                  style={{
                    padding: "0.25rem 0.55rem",
                    borderRadius: 5,
                    border: "1px solid " + t.ink08,
                    background: "none",
                    color: t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.6rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                  }}
                  onMouseEnter={function (e) {
                    e.currentTarget.style.borderColor = t.accent;
                    e.currentTarget.style.color = t.accent;
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.borderColor = t.ink08;
                    e.currentTarget.style.color = t.ink50;
                  }}
                >
                  <Download size={11} /> CSV
                </button>
              )}
            </div>
          </div>

          {sortedIssues.length > 0 && site.github_repo && !isClient && (
            <div
              style={{
                display: "flex",
                gap: "0.3rem",
                marginBottom: "0.6rem",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  marginRight: "0.3rem",
                }}
              >
                Select:
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  color: atSelectionCap ? t.red : t.ink50,
                  fontWeight: 600,
                  padding: "0.1rem 0.35rem",
                  borderRadius: 3,
                  background: atSelectionCap ? t.red + "12" : t.ink04,
                }}
              >
                {selectedForFix.length}/{maxPerPr}
              </span>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.ink08,
                  background: "none",
                  color: t.ink50,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                All open
              </button>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.impact === "critical" && i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.red + "30",
                  background: "none",
                  color: t.red,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                Critical
              </button>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.impact === "serious" && i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.red + "20",
                  background: "none",
                  color: t.red,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                Serious
              </button>
              <button
                onClick={function () {
                  setSelectedForFix(
                    sortedIssues
                      .filter(function (i) {
                        return i.impact === "moderate" && i.status === "open";
                      })
                      .map(function (i) {
                        return i.id;
                      })
                      .slice(0, maxPerPr)
                  );
                }}
                style={{
                  padding: "0.2rem 0.5rem",
                  borderRadius: 4,
                  border: "1px solid " + t.amber + "30",
                  background: "none",
                  color: t.amber,
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                Moderate
              </button>
              {selectedForFix.length > 0 && (
                <button
                  onClick={function () {
                    setSelectedForFix([]);
                  }}
                  style={{
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    border: "none",
                    background: t.ink04,
                    color: t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    cursor: "pointer",
                  }}
                >
                  Clear ({selectedForFix.length})
                </button>
              )}
            </div>
          )}

          {sortedIssues.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                border: "1px dashed " + t.ink20,
                borderRadius: 12,
              }}
            >
              <p style={{ color: t.ink50 }}>
                {issues.length === 0
                  ? "No issues found. Run a scan to check for accessibility violations."
                  : "No issues match your filters."}
              </p>
            </div>
          ) : viewMode === "grouped" ? (
            <div
              ref={issueListRef}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.65rem",
                  color: t.ink50,
                  marginBottom: "0.2rem",
                }}
              >
                {groupedIssues.length} unique issues ({sortedIssues.length}{" "}
                total)
                {issueSearch && (
                  <span style={{ color: t.accent, marginLeft: "0.5rem" }}>
                    matching "{issueSearch}"
                  </span>
                )}
                {selectedForFix.length > 0 && (
                  <span style={{ color: t.accent, marginLeft: "0.5rem" }}>
                    {selectedForFix.length}/{maxPerPr} selected
                  </span>
                )}
              </div>
              {sortMode === "quick-wins" &&
                (function () {
                  var fixableGroups = groupedIssues.filter(function (g) {
                    return g.fixableCount > 0;
                  }).length;
                  var totalFixable = groupedIssues.reduce(function (s, g) {
                    return s + g.fixableCount;
                  }, 0);
                  return fixableGroups > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem 0.8rem",
                        borderRadius: 7,
                        background: t.green + "08",
                        border: "1px solid " + t.green + "20",
                        marginBottom: "0.3rem",
                      }}
                    >
                      <Lightbulb size={14} color={t.green} strokeWidth={2} />
                      <span
                        style={{
                          fontSize: "0.78rem",
                          color: t.ink,
                          fontWeight: 500,
                        }}
                      >
                        <strong style={{ color: t.green }}>
                          {totalFixable} issues
                        </strong>{" "}
                        across {fixableGroups} groups have AI fixes ready —
                        start with these.
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        padding: "0.6rem 0.8rem",
                        borderRadius: 7,
                        background: t.ink04,
                        fontSize: "0.78rem",
                        color: t.ink50,
                        marginBottom: "0.3rem",
                      }}
                    >
                      No AI fix suggestions available yet. Run a scan with AI
                      fixes enabled.
                    </div>
                  );
                })()}
              {groupedIssues.map(function (group, gi) {
                var groupKey = group.rule_id + "-" + gi;
                var isExpanded = !!expandedGroups[groupKey];
                var allSelected = group.allIds.every(function (id) {
                  return selectedForFix.indexOf(id) !== -1;
                });
                var someSelected =
                  !allSelected &&
                  group.allIds.some(function (id) {
                    return selectedForFix.indexOf(id) !== -1;
                  });
                var isQW = sortMode === "quick-wins";
                var hasAIFix = group.fixableCount > 0;
                return (
                  <div
                    key={group.rule_id + "-" + gi}
                    style={{
                      opacity: isQW && !hasAIFix ? 0.45 : 1,
                      transition: "opacity 0.2s",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.85rem 1.1rem",
                        borderRadius: isExpanded ? "8px 8px 0 0" : 8,
                        border:
                          "1px solid " +
                          (allSelected
                            ? t.accent
                            : isQW && hasAIFix
                            ? t.green + "40"
                            : t.ink08),
                        borderLeft:
                          isQW && hasAIFix ? "3px solid " + t.green : undefined,
                        background: allSelected
                          ? t.accentBg
                          : isQW && hasAIFix
                          ? t.green + "04"
                          : t.cardBg,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        transition: "all 0.15s",
                      }}
                      onMouseEnter={function (e) {
                        if (!allSelected)
                          e.currentTarget.style.borderColor = t.accent;
                      }}
                      onMouseLeave={function (e) {
                        if (!allSelected)
                          e.currentTarget.style.borderColor =
                            isQW && hasAIFix ? t.green + "40" : t.ink08;
                      }}
                    >
                      {site.github_repo && !isClient && (
                        <div
                          onClick={function (e) {
                            e.stopPropagation();
                            if (allSelected) {
                              setSelectedForFix(function (p) {
                                return p.filter(function (id) {
                                  return group.allIds.indexOf(id) === -1;
                                });
                              });
                            } else {
                              setSelectedForFix(function (p) {
                                var n = p.slice();
                                group.allIds.forEach(function (id) {
                                  if (
                                    n.indexOf(id) === -1 &&
                                    n.length < maxPerPr
                                  )
                                    n.push(id);
                                });
                                return n;
                              });
                            }
                          }}
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: 4,
                            flexShrink: 0,
                            border:
                              "1.5px solid " +
                              (allSelected
                                ? t.accent
                                : someSelected
                                ? t.accent
                                : t.ink20),
                            background: allSelected
                              ? t.accent
                              : someSelected
                              ? t.accent + "40"
                              : "transparent",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                          }}
                        >
                          {(allSelected || someSelected) && (
                            <Check size={12} color="white" strokeWidth={3} />
                          )}
                        </div>
                      )}
                      <div
                        onClick={function () {
                          setExpandedGroups(function (prev) {
                            var next = Object.assign({}, prev);
                            next[groupKey] = !next[groupKey];
                            return next;
                          });
                        }}
                        style={{ flex: 1, minWidth: 0 }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <ImpactBadge impact={group.impact} />
                          {sortMode === "quick-wins" && (
                            <FixBadge
                              count={group.fixableCount}
                              total={group.count}
                            />
                          )}
                          {showDiff && group.newCount > 0 && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.5rem",
                                fontWeight: 700,
                                padding: "0.08rem 0.35rem",
                                borderRadius: 3,
                                background: t.green + "15",
                                color: t.green,
                                letterSpacing: "0.04em",
                                flexShrink: 0,
                              }}
                            >
                              {group.newCount === group.count
                                ? "ALL NEW"
                                : group.newCount + " NEW"}
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              color: t.accent,
                              fontWeight: 600,
                              width: groupBy === "page" ? "auto" : 140,
                              maxWidth: groupBy === "page" ? 240 : 140,
                              flexShrink: 0,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {group.isPageGroup ? group.label : group.rule_id}
                          </span>
                          <span
                            style={{
                              fontSize: "0.82rem",
                              color: t.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {group.isPageGroup
                              ? group.instances.length +
                                " issue" +
                                (group.instances.length !== 1 ? "s" : "")
                              : group.description}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          flexShrink: 0,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.62rem",
                            color: t.ink50,
                            background: t.ink04,
                            padding: "0.1rem 0.4rem",
                            borderRadius: 3,
                            minWidth: 32,
                            textAlign: "center",
                          }}
                        >
                          {group.count}×
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.62rem",
                            color: t.ink50,
                            background: t.ink04,
                            padding: "0.1rem 0.4rem",
                            borderRadius: 3,
                            minWidth: 38,
                            textAlign: "center",
                          }}
                        >
                          {group.isPageGroup
                            ? [
                                ...new Set(
                                  group.instances.map(function (i) {
                                    return i.rule_id;
                                  })
                                ),
                              ].length + " rules"
                            : group.pageCount + " pg"}
                        </span>
                        <ChevronDown
                          size={14}
                          color={t.ink50}
                          style={{
                            transform: isExpanded
                              ? "rotate(180deg)"
                              : "rotate(0)",
                            transition: "transform 0.2s",
                            cursor: "pointer",
                          }}
                          onClick={function (e) {
                            e.stopPropagation();
                            setExpandedGroups(function (prev) {
                              var next = Object.assign({}, prev);
                              next[groupKey] = !next[groupKey];
                              return next;
                            });
                          }}
                        />
                      </div>
                    </div>
                    {isExpanded && (
                      <div
                        style={{
                          borderLeft: "1px solid " + t.ink08,
                          borderRight: "1px solid " + t.ink08,
                          borderBottom: "1px solid " + t.ink08,
                          borderRadius: "0 0 8px 8px",
                        }}
                      >
                        {group.instances.map(function (inst) {
                          var isSel = selectedForFix.indexOf(inst.id) !== -1;
                          var instFocused = inst.id === focusedIssueId;
                          return (
                            <div
                              key={inst.id}
                              data-focus-idx={sortedIssues.indexOf(inst)}
                              onClick={function () {
                                setSelectedIssue(inst);
                              }}
                              style={{
                                padding: "0.55rem 1.1rem 0.55rem 2.6rem",
                                borderTop: "1px solid " + t.ink04,
                                background: instFocused
                                  ? t.accent + "08"
                                  : isSel
                                  ? t.accentBg
                                  : t.paper,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                cursor: "pointer",
                                opacity: inst.status !== "open" ? 0.5 : 1,
                                boxShadow: instFocused
                                  ? "inset 3px 0 0 " + t.accent
                                  : "none",
                              }}
                            >
                              {site.github_repo && !isClient && (
                                <div
                                  onClick={function (e) {
                                    e.stopPropagation();
                                    setSelectedForFix(function (p) {
                                      if (isSel)
                                        return p.filter(function (id) {
                                          return id !== inst.id;
                                        });
                                      if (p.length >= maxPerPr) return p;
                                      return p.concat([inst.id]);
                                    });
                                  }}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: 3,
                                    flexShrink: 0,
                                    border:
                                      "1.5px solid " +
                                      (isSel ? t.accent : t.ink20),
                                    background: isSel
                                      ? t.accent
                                      : "transparent",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                  }}
                                >
                                  {isSel && (
                                    <Check
                                      size={10}
                                      color="white"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                              )}
                              <span
                                style={{
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.68rem",
                                  color: t.ink50,
                                  flex: 1,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {(function () {
                                  try {
                                    return new URL(inst.page_url).pathname;
                                  } catch (e) {
                                    return inst.page_url || "/";
                                  }
                                })()}
                              </span>
                              {inst.element_selector && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.55rem",
                                    color: t.ink50,
                                    background: t.ink04,
                                    padding: "0.08rem 0.3rem",
                                    borderRadius: 3,
                                    maxWidth: 140,
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                    display: "inline-block",
                                  }}
                                >
                                  {inst.element_selector}
                                </span>
                              )}
                              {inst.assigned_to &&
                                memberMap[inst.assigned_to] && (
                                  <span
                                    title={memberMap[inst.assigned_to].name}
                                    style={{
                                      width: 16,
                                      height: 16,
                                      borderRadius: "50%",
                                      background: t.accent,
                                      color: "white",
                                      fontFamily: "var(--mono)",
                                      fontSize: "0.42rem",
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                    }}
                                  >
                                    {memberMap[inst.assigned_to].initials}
                                  </span>
                                )}
                              {inst.viewport && (
                                <span
                                  title={"Fails at: " + inst.viewport}
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.45rem",
                                    fontWeight: 600,
                                    padding: "0.06rem 0.25rem",
                                    borderRadius: 3,
                                    background:
                                      inst.viewport.indexOf("mobile") !== -1
                                        ? t.amber + "12"
                                        : t.accent + "10",
                                    color:
                                      inst.viewport.indexOf("mobile") !== -1
                                        ? t.amber
                                        : t.accent,
                                    flexShrink: 0,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.03em",
                                  }}
                                >
                                  {inst.viewport.indexOf(",") !== -1
                                    ? "all"
                                    : inst.viewport}
                                </span>
                              )}
                              {inst.status !== "open" && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.52rem",
                                    fontWeight: 600,
                                    padding: "0.08rem 0.3rem",
                                    borderRadius: 3,
                                    background:
                                      inst.status === "fixed"
                                        ? t.greenBg
                                        : inst.status === "removed"
                                        ? t.accent + "12"
                                        : t.ink04,
                                    color:
                                      inst.status === "fixed"
                                        ? t.green
                                        : inst.status === "removed"
                                        ? t.accent
                                        : t.ink50,
                                  }}
                                >
                                  {inst.status}
                                </span>
                              )}
                              {showDiff && newIssueIds.has(inst.id) && (
                                <span
                                  style={{
                                    fontFamily: "var(--mono)",
                                    fontSize: "0.48rem",
                                    fontWeight: 700,
                                    padding: "0.05rem 0.3rem",
                                    borderRadius: 3,
                                    background: t.green + "15",
                                    color: t.green,
                                    letterSpacing: "0.04em",
                                    flexShrink: 0,
                                  }}
                                >
                                  NEW
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              ref={issueListRef}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.35rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.65rem",
                  color: t.ink50,
                  marginBottom: "0.2rem",
                }}
              >
                {sortedIssues.length} issues
                {issueSearch && (
                  <span style={{ color: t.accent, marginLeft: "0.5rem" }}>
                    matching "{issueSearch}"
                  </span>
                )}
                {selectedForFix.length > 0 && (
                  <span style={{ color: t.accent, marginLeft: "0.5rem" }}>
                    {selectedForFix.length}/{maxPerPr} selected
                  </span>
                )}
              </div>
              {sortedIssues.map(function (issue, issueIdx) {
                var isSelected = selectedForFix.indexOf(issue.id) !== -1;
                var isFocused = issue.id === focusedIssueId;
                return (
                  <div
                    key={issue.id}
                    data-focus-idx={issueIdx}
                    style={{
                      padding: "0.85rem 1.1rem",
                      borderRadius: 8,
                      border:
                        "1px solid " +
                        (isFocused
                          ? t.accent
                          : isSelected
                          ? t.accent
                          : t.ink08),
                      background: isFocused
                        ? t.accent + "08"
                        : isSelected
                        ? t.accentBg
                        : t.cardBg,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                      opacity: issue.status !== "open" ? 0.55 : 1,
                      transition: "all 0.15s",
                      boxShadow: isFocused
                        ? "0 0 0 2px " + t.accent + "40"
                        : "none",
                    }}
                    onMouseEnter={function (e) {
                      if (!isSelected && !isFocused)
                        e.currentTarget.style.borderColor = t.accent;
                    }}
                    onMouseLeave={function (e) {
                      if (!isSelected && !isFocused)
                        e.currentTarget.style.borderColor = t.ink08;
                    }}
                  >
                    {site.github_repo && !isClient && (
                      <div
                        onClick={function (e) {
                          e.stopPropagation();
                          setSelectedForFix(function (p) {
                            if (isSelected)
                              return p.filter(function (id) {
                                return id !== issue.id;
                              });
                            if (p.length >= maxPerPr) return p;
                            return p.concat([issue.id]);
                          });
                        }}
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: 4,
                          flexShrink: 0,
                          border:
                            "1.5px solid " + (isSelected ? t.accent : t.ink20),
                          background: isSelected ? t.accent : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                      >
                        {isSelected && (
                          <Check size={12} color="white" strokeWidth={3} />
                        )}
                      </div>
                    )}
                    <div
                      onClick={function () {
                        setSelectedIssue(issue);
                      }}
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "0.6rem",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            flex: 1,
                            minWidth: 0,
                          }}
                        >
                          <ImpactBadge impact={issue.impact} />
                          {sortMode === "quick-wins" &&
                            issue.fix_suggestion && (
                              <FixBadge count={1} total={1} />
                            )}
                          {showDiff && newIssueIds.has(issue.id) && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.48rem",
                                fontWeight: 700,
                                padding: "0.05rem 0.3rem",
                                borderRadius: 3,
                                background: t.green + "15",
                                color: t.green,
                                letterSpacing: "0.04em",
                                flexShrink: 0,
                              }}
                            >
                              NEW
                            </span>
                          )}
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              color: t.accent,
                              width: 140,
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
                              fontSize: "0.82rem",
                              color: t.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {issue.description}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            flexShrink: 0,
                          }}
                        >
                          {issue.page_url &&
                            (function () {
                              try {
                                var p = new URL(issue.page_url).pathname;
                                return p !== "/" ? (
                                  <span
                                    style={{
                                      fontFamily: "var(--mono)",
                                      fontSize: "0.55rem",
                                      color: t.ink50,
                                      background: t.ink04,
                                      padding: "0.1rem 0.3rem",
                                      borderRadius: 3,
                                      maxWidth: 100,
                                      overflow: "hidden",
                                      textOverflow: "ellipsis",
                                      whiteSpace: "nowrap",
                                      display: "inline-block",
                                    }}
                                  >
                                    {p}
                                  </span>
                                ) : null;
                              } catch (e) {
                                return null;
                              }
                            })()}
                          {issue.assigned_to &&
                            memberMap[issue.assigned_to] && (
                              <span
                                title={memberMap[issue.assigned_to].name}
                                style={{
                                  width: 18,
                                  height: 18,
                                  borderRadius: "50%",
                                  background: t.accent,
                                  color: "white",
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.45rem",
                                  fontWeight: 700,
                                  display: "inline-flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                }}
                              >
                                {memberMap[issue.assigned_to].initials}
                              </span>
                            )}
                          {issue.viewport && (
                            <span
                              title={"Fails at: " + issue.viewport}
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.48rem",
                                fontWeight: 600,
                                padding: "0.08rem 0.3rem",
                                borderRadius: 3,
                                background:
                                  issue.viewport.indexOf("mobile") !== -1
                                    ? t.amber + "12"
                                    : t.accent + "10",
                                color:
                                  issue.viewport.indexOf("mobile") !== -1
                                    ? t.amber
                                    : t.accent,
                                flexShrink: 0,
                                textTransform: "uppercase",
                                letterSpacing: "0.03em",
                              }}
                            >
                              {issue.viewport.indexOf(",") !== -1
                                ? "all"
                                : issue.viewport}
                            </span>
                          )}
                          {issue.status !== "open" && (
                            <span
                              style={{
                                fontFamily: "var(--mono)",
                                fontSize: "0.55rem",
                                fontWeight: 600,
                                padding: "0.1rem 0.35rem",
                                borderRadius: 3,
                                background:
                                  issue.status === "fixed"
                                    ? t.greenBg
                                    : issue.status === "removed"
                                    ? t.accent + "12"
                                    : t.ink04,
                                color:
                                  issue.status === "fixed"
                                    ? t.green
                                    : issue.status === "removed"
                                    ? t.accent
                                    : t.ink50,
                              }}
                            >
                              {issue.status.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!isClient && (
            <BulkFixBar
              selectedIds={selectedForFix}
              issues={issues}
              site={site}
              maxPerPr={maxPerPr}
              plan={plan}
              onClear={function () {
                setSelectedForFix([]);
              }}
              onFixed={function () {
                setSelectedForFix([]);
                loadData(true);
              }}
            />
          )}
        </div>
      )}
      {/* ── Scans ── */}
      {tab === "scans" && (
        <div role="tabpanel" id="tabpanel-scans" aria-labelledby="tab-scans">
          {scans.length === 0 ? (
            <div
              style={{
                padding: "3rem",
                textAlign: "center",
                border: `1px dashed ${t.ink20}`,
                borderRadius: 12,
              }}
            >
              <p style={{ color: t.ink50 }}>No scans yet.</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              {/* Compare button — needs at least 2 completed scans */}
              {scans.filter(function (s) {
                return s.status === "complete";
              }).length >= 2 && (
                <div style={{ marginBottom: "0.4rem" }}>
                  <button
                    onClick={function () {
                      setShowCompare(true);
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.4rem 0.85rem",
                      borderRadius: 7,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink50,
                      fontFamily: "var(--body)",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                    onMouseEnter={function (e) {
                      e.currentTarget.style.borderColor = t.accent;
                      e.currentTarget.style.color = t.accent;
                    }}
                    onMouseLeave={function (e) {
                      e.currentTarget.style.borderColor = t.ink20;
                      e.currentTarget.style.color = t.ink50;
                    }}
                  >
                    Compare scans
                  </button>
                </div>
              )}
              {scans.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.85rem 1.1rem",
                    borderRadius: 8,
                    border: `1px solid ${t.ink08}`,
                    background: t.cardBg,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "0.84rem",
                        fontWeight: 500,
                        color: t.ink,
                      }}
                    >
                      <span title={fullDate(scan.created_at)}>
                        {timeAgo(scan.created_at)}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.68rem",
                        color: t.ink50,
                      }}
                    >
                      {scan.pages_scanned || 0} page
                      {(scan.pages_scanned || 0) !== 1 ? "s" : ""} ·{" "}
                      {scan.issues_found || 0} issue
                      {(scan.issues_found || 0) !== 1 ? "s" : ""}
                      {scan.summary_json?.incremental && (
                        <span style={{ color: t.accent, marginLeft: "0.3rem" }}>
                          ⚡ {scan.summary_json.total_pages_carried_forward}{" "}
                          cached
                        </span>
                      )}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.7rem",
                    }}
                  >
                    {scan.score != null && (
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.88rem",
                          fontWeight: 700,
                          color:
                            scan.score >= 80
                              ? t.green
                              : scan.score >= 50
                              ? t.amber
                              : t.red,
                        }}
                      >
                        {Math.round(scan.score)}
                      </span>
                    )}
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.62rem",
                        padding: "0.18rem 0.45rem",
                        borderRadius: 4,
                        fontWeight: 600,
                        background:
                          scan.status === "complete"
                            ? t.greenBg
                            : scan.status === "failed"
                            ? `${t.red}12`
                            : scan.status === "running"
                            ? t.accentBg
                            : t.ink04,
                        color:
                          scan.status === "complete"
                            ? t.green
                            : scan.status === "failed"
                            ? t.red
                            : scan.status === "running"
                            ? t.accent
                            : t.ink50,
                      }}
                    >
                      {scan.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Settings ── */}
      {tab === "settings" && (
        <div
          role="tabpanel"
          id="tabpanel-settings"
          aria-labelledby="tab-settings"
        >
          {/* Scan Schedule */}
          <SchedulePicker
            site={site}
            plan={org?.plan || "free"}
            onUpdate={(s) => setSite(s)}
          />

          {/* Report Schedule — Pro + Agency */}
          <ReportSchedulePicker
            site={site}
            plan={plan}
            onUpdate={(s) => setSite(s)}
          />

          {/* Custom Scan Profile — Agency only */}
          <PlanGate
            currentPlan={plan}
            requiredPlan="agency"
            feature="Custom scan profiles"
          >
            <ScanProfileEditor site={site} onUpdate={(s) => setSite(s)} />
          </PlanGate>

          {/* Verification Token — show/hide */}
          <VerificationTokenPanel site={site} />

          {/* GitHub Integration */}
          <GitHubConnect site={site} onUpdate={(s) => setSite(s)} />

          <CIWorkflowPanel site={site} onUpdate={(s) => setSite(s)} />

          {/* Badge Embed — free for all plans (branding vehicle) */}
          <BadgeEmbedPanel site={site} />

          {/* Ignore Rules */}
          <IgnoreRulesPanel
            site={site}
            onUpdate={function (s) {
              setSite(s);
            }}
          />

          {/* Danger zone */}
          <DangerZonePanel site={site} />
        </div>
      )}

      {/* Issue detail modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          site={site}
          onClose={() => setSelectedIssue(null)}
          onUpdate={handleIssueUpdate}
          readOnly={isClient}
          onIgnoreRule={!isClient ? handleAddIgnoreRule : undefined}
        />
      )}

      {/* Scan config modal */}
      {showScanConfig && (
        <ScanConfigModal
          site={site}
          plan={org?.plan || "free"}
          scanning={scanning}
          onScan={handleScan}
          onClose={() => setShowScanConfig(false)}
        />
      )}

      {/* Accessibility Simulator */}
      {showSimulator && (
        <AccessibilitySimulator
          site={site}
          issues={issues}
          onClose={function () {
            setShowSimulator(false);
          }}
        />
      )}

      {showScoreExplainer && site && (
        <ScoreExplainerModal
          t={t}
          score={site.score || 0}
          issues={issues}
          scans={scans}
          onClose={function () {
            setShowScoreExplainer(false);
          }}
        />
      )}

      {/* Scan comparison modal */}
      {showCompare && (
        <ScanCompare
          scans={scans}
          issues={issues}
          onClose={function () {
            setShowCompare(false);
          }}
        />
      )}

      {/* Accessibility statement generator */}
      {showStatement && (
        <AccessibilityStatementGenerator
          site={site}
          issues={issues}
          scans={scans}
          onClose={function () {
            setShowStatement(false);
          }}
        />
      )}

      {/* Keyboard shortcuts help */}
      {showShortcutHelp && (
        <ShortcutHelpOverlay
          shortcuts={shortcutDefs}
          onClose={function () {
            setShowShortcutHelp(false);
          }}
        />
      )}

      {/* Shortcut hint */}
      <button
        onClick={function () {
          setShowShortcutHelp(true);
        }}
        title="Keyboard shortcuts (?)"
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          width: 28,
          height: 28,
          borderRadius: 6,
          border: "1px solid " + t.ink08,
          background: t.cardBg,
          color: t.ink50,
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          fontWeight: 700,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          zIndex: 20,
        }}
        onMouseEnter={function (e) {
          e.currentTarget.style.color = t.accent;
        }}
        onMouseLeave={function (e) {
          e.currentTarget.style.color = t.ink50;
        }}
      >
        ?
      </button>
    </div>
  );
}
