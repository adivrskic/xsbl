import { useState, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import PlanGate from "../../components/ui/PlanGate";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import {
  Shield,
  Download,
  Loader2,
  Calendar,
  FileJson,
  FileText,
  CheckCircle,
  AlertTriangle,
  Globe,
  GitPullRequest,
  Scan,
  Users,
  ChevronDown,
  ChevronRight,
  Package,
} from "lucide-react";

/* ── Framework definitions ── */
var FRAMEWORKS = {
  soc2: {
    id: "soc2",
    name: "SOC 2 Type II",
    desc: "Trust Service Criteria — Security, Availability, Processing Integrity",
    sections: [
      {
        id: "cc6_access",
        control: "CC6.1 / CC6.3",
        title: "Logical Access Controls",
        desc: "Evidence of user access management, role assignments, and access changes.",
        query: "access",
      },
      {
        id: "cc6_change",
        control: "CC6.8 / CC8.1",
        title: "Change Management",
        desc: "Evidence of code changes via pull requests, review process, and deployment history.",
        query: "changes",
      },
      {
        id: "cc7_monitor",
        control: "CC7.1 / CC7.2",
        title: "System Monitoring",
        desc: "Evidence of continuous monitoring through automated scans, alerting, and scheduled checks.",
        query: "monitoring",
      },
      {
        id: "cc7_incident",
        control: "CC7.3 / CC7.4",
        title: "Incident & Vulnerability Management",
        desc: "Evidence of vulnerability detection, triage, and remediation timelines.",
        query: "vulnerabilities",
      },
      {
        id: "cc3_risk",
        control: "CC3.1 / CC3.2",
        title: "Risk Assessment",
        desc: "Accessibility risk scores over time, trend data, and compliance posture.",
        query: "risk",
      },
    ],
  },
  iso27001: {
    id: "iso27001",
    name: "ISO 27001:2022",
    desc: "Information Security Management System — Annex A Controls",
    sections: [
      {
        id: "a5_policy",
        control: "A.5.1 / A.5.2",
        title: "Security Policies & Organization",
        desc: "Org structure, plan configuration, and access policies.",
        query: "access",
      },
      {
        id: "a8_asset",
        control: "A.8.1 / A.8.2",
        title: "Asset Management",
        desc: "Inventory of monitored web assets (sites), ownership, and classification.",
        query: "assets",
      },
      {
        id: "a8_vuln",
        control: "A.8.8",
        title: "Technical Vulnerability Management",
        desc: "Vulnerability scanning results, issue lifecycle, and remediation evidence.",
        query: "vulnerabilities",
      },
      {
        id: "a8_change",
        control: "A.8.32",
        title: "Change Management",
        desc: "Tracked code changes, pull requests, and fix deployments.",
        query: "changes",
      },
      {
        id: "a12_ops",
        control: "A.12.1 / A.12.4",
        title: "Operational Security & Logging",
        desc: "Audit log of all system events, monitoring schedules, and operational records.",
        query: "monitoring",
      },
    ],
  },
};

/* ── Data fetchers ── */
async function fetchEvidenceData(orgId, dateFrom, dateTo) {
  var range = { from: dateFrom, to: dateTo };

  // Parallel queries
  var [auditRes, sitesRes, scansRes, issuesRes, prsRes, membersRes] =
    await Promise.all([
      supabase
        .from("audit_log")
        .select("*")
        .eq("org_id", orgId)
        .gte("created_at", range.from)
        .lte("created_at", range.to)
        .order("created_at", { ascending: false })
        .limit(500),
      supabase.from("sites").select("*").eq("org_id", orgId),
      supabase
        .from("scans")
        .select("*, sites!inner(org_id)")
        .eq("sites.org_id", orgId)
        .gte("created_at", range.from)
        .lte("created_at", range.to)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("issues")
        .select("*, sites!inner(org_id)")
        .eq("sites.org_id", orgId)
        .limit(1000),
      supabase
        .from("fix_prs")
        .select("*, sites!inner(org_id)")
        .eq("sites.org_id", orgId)
        .gte("created_at", range.from)
        .lte("created_at", range.to)
        .order("created_at", { ascending: false })
        .limit(200),
      supabase
        .from("org_members")
        .select("user_id, role, profiles(email, display_name)")
        .eq("org_id", orgId),
    ]);

  return {
    auditLog: auditRes.data || [],
    sites: sitesRes.data || [],
    scans: scansRes.data || [],
    issues: issuesRes.data || [],
    prs: prsRes.data || [],
    members: membersRes.data || [],
  };
}

function buildSection(sectionDef, data, dateFrom, dateTo) {
  var q = sectionDef.query;
  var evidence = {
    control: sectionDef.control,
    title: sectionDef.title,
    description: sectionDef.desc,
    period: { from: dateFrom, to: dateTo },
    collected_at: new Date().toISOString(),
    records: [],
    summary: {},
  };

  if (q === "access") {
    // User access evidence
    var accessEvents = data.auditLog.filter(function (l) {
      return (
        l.action === "user.invited" ||
        l.action === "user.removed" ||
        l.resource_type === "user"
      );
    });
    evidence.records = accessEvents.map(function (e) {
      return {
        timestamp: e.created_at,
        action: e.action,
        actor: e.user_id,
        description: e.description,
        details: e.metadata,
      };
    });
    evidence.summary = {
      total_members: data.members.length,
      members: data.members.map(function (m) {
        return {
          role: m.role,
          email: m.profiles && m.profiles.email ? m.profiles.email : "unknown",
        };
      }),
      access_change_events: accessEvents.length,
    };
  } else if (q === "changes") {
    // Change management evidence
    evidence.records = data.prs.map(function (pr) {
      return {
        timestamp: pr.created_at,
        type: "pull_request",
        pr_number: pr.pr_number,
        pr_url: pr.pr_url,
        branch: pr.branch_name,
        file_path: pr.file_path || null,
        status: pr.status,
        site_id: pr.site_id,
      };
    });
    var prEvents = data.auditLog.filter(function (l) {
      return l.action === "pr.created" || l.action === "pr.bulk_created";
    });
    evidence.summary = {
      total_prs_created: data.prs.length,
      prs_open: data.prs.filter(function (p) {
        return p.status === "open";
      }).length,
      prs_merged: data.prs.filter(function (p) {
        return p.status === "merged";
      }).length,
      change_events_logged: prEvents.length,
    };
  } else if (q === "monitoring") {
    // Monitoring evidence
    var scanEvents = data.auditLog.filter(function (l) {
      return l.resource_type === "scan";
    });
    evidence.records = scanEvents.map(function (e) {
      return {
        timestamp: e.created_at,
        action: e.action,
        description: e.description,
        details: e.metadata,
      };
    });
    var scheduledSites = data.sites.filter(function (s) {
      return s.scan_schedule && s.scan_schedule !== "manual";
    });
    evidence.summary = {
      total_scans_in_period: data.scans.length,
      scans_completed: data.scans.filter(function (s) {
        return s.status === "complete";
      }).length,
      scans_failed: data.scans.filter(function (s) {
        return s.status === "failed";
      }).length,
      sites_with_scheduled_scans: scheduledSites.length,
      schedules: scheduledSites.map(function (s) {
        return {
          domain: s.domain,
          frequency: s.scan_schedule,
          hour_utc: s.schedule_hour,
        };
      }),
      monitoring_events_logged: scanEvents.length,
    };
  } else if (q === "vulnerabilities") {
    // Vulnerability management evidence
    var open = data.issues.filter(function (i) {
      return i.status === "open";
    });
    var fixed = data.issues.filter(function (i) {
      return i.status === "fixed";
    });
    var ignored = data.issues.filter(function (i) {
      return i.status === "ignored";
    });
    var bySeverity = { critical: 0, serious: 0, moderate: 0, minor: 0 };
    open.forEach(function (i) {
      bySeverity[i.impact] = (bySeverity[i.impact] || 0) + 1;
    });

    // Remediation timelines: issues that were fixed, with time-to-fix
    var remediations = fixed
      .filter(function (i) {
        return i.created_at && i.updated_at;
      })
      .map(function (i) {
        var created = new Date(i.created_at);
        var updated = new Date(i.updated_at);
        var hoursToFix = Math.round((updated - created) / (1000 * 60 * 60));
        return {
          rule_id: i.rule_id,
          impact: i.impact,
          detected: i.created_at,
          resolved: i.updated_at,
          hours_to_resolve: hoursToFix,
        };
      })
      .slice(0, 50);

    evidence.records = remediations;
    evidence.summary = {
      total_vulnerabilities: data.issues.length,
      currently_open: open.length,
      fixed: fixed.length,
      ignored: ignored.length,
      open_by_severity: bySeverity,
      avg_hours_to_fix:
        remediations.length > 0
          ? Math.round(
              remediations.reduce(function (s, r) {
                return s + r.hours_to_resolve;
              }, 0) / remediations.length
            )
          : null,
    };
  } else if (q === "risk") {
    // Risk assessment evidence
    var scoresByDomain = {};
    data.scans
      .filter(function (s) {
        return s.status === "complete" && s.score != null;
      })
      .forEach(function (s) {
        var site = data.sites.find(function (si) {
          return si.id === s.site_id;
        });
        var domain = site ? site.domain : s.site_id;
        if (!scoresByDomain[domain]) scoresByDomain[domain] = [];
        scoresByDomain[domain].push({
          date: s.completed_at || s.created_at,
          score: Math.round(s.score),
          issues_found: s.issues_found,
          pages_scanned: s.pages_scanned,
        });
      });

    evidence.records = Object.entries(scoresByDomain).map(function (entry) {
      return { domain: entry[0], scan_history: entry[1] };
    });
    evidence.summary = {
      sites_monitored: data.sites.length,
      current_scores: data.sites.map(function (s) {
        return {
          domain: s.domain,
          score: s.score != null ? Math.round(s.score) : null,
          last_scan: s.last_scan_at,
        };
      }),
      average_score:
        data.sites.filter(function (s) {
          return s.score != null;
        }).length > 0
          ? Math.round(
              data.sites
                .filter(function (s) {
                  return s.score != null;
                })
                .reduce(function (sum, s) {
                  return sum + s.score;
                }, 0) /
                data.sites.filter(function (s) {
                  return s.score != null;
                }).length
            )
          : null,
    };
  } else if (q === "assets") {
    // Asset inventory
    evidence.records = data.sites.map(function (s) {
      return {
        id: s.id,
        domain: s.domain,
        display_name: s.display_name,
        score: s.score,
        last_scan: s.last_scan_at,
        scan_schedule: s.scan_schedule || "manual",
        github_connected: !!s.github_repo,
        created_at: s.created_at,
      };
    });
    evidence.summary = {
      total_assets: data.sites.length,
      with_scheduled_scans: data.sites.filter(function (s) {
        return s.scan_schedule && s.scan_schedule !== "manual";
      }).length,
      with_github: data.sites.filter(function (s) {
        return !!s.github_repo;
      }).length,
    };
  }

  return evidence;
}

function buildFullExport(framework, sections, data, org, dateFrom, dateTo) {
  var fw = FRAMEWORKS[framework];
  var exportData = {
    export_metadata: {
      framework: fw.name,
      framework_id: framework,
      organization: org.name,
      generated_at: new Date().toISOString(),
      generated_by: "xsbl Compliance Evidence Export",
      period: { from: dateFrom, to: dateTo },
      version: "1.0",
    },
    sections: {},
  };

  fw.sections.forEach(function (secDef) {
    if (sections.indexOf(secDef.id) !== -1) {
      exportData.sections[secDef.id] = buildSection(
        secDef,
        data,
        dateFrom,
        dateTo
      );
    }
  });

  return exportData;
}

function downloadJSON(data, filename) {
  var blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSVBundle(exportData, orgName) {
  var prefix = (orgName || "org").replace(/\s+/g, "-").toLowerCase();
  var date = new Date().toISOString().slice(0, 10);

  // Summary CSV
  var summaryRows = [["Section", "Control", "Title", "Records", "Key Metric"]];
  Object.entries(exportData.sections).forEach(function (entry) {
    var key = entry[0];
    var sec = entry[1];
    var metric = "";
    if (sec.summary.total_vulnerabilities != null)
      metric = "Open: " + sec.summary.currently_open;
    else if (sec.summary.total_scans_in_period != null)
      metric = "Scans: " + sec.summary.total_scans_in_period;
    else if (sec.summary.total_prs_created != null)
      metric = "PRs: " + sec.summary.total_prs_created;
    else if (sec.summary.average_score != null)
      metric = "Avg score: " + sec.summary.average_score;
    else if (sec.summary.total_members != null)
      metric = "Members: " + sec.summary.total_members;
    else if (sec.summary.total_assets != null)
      metric = "Assets: " + sec.summary.total_assets;
    summaryRows.push([
      key,
      sec.control,
      sec.title,
      String(sec.records.length),
      metric,
    ]);
  });

  var csvContent = summaryRows
    .map(function (r) {
      return r
        .map(function (c) {
          return '"' + String(c).replace(/"/g, '""') + '"';
        })
        .join(",");
    })
    .join("\n");

  // Records CSV — flatten all records
  var allRecords = [];
  Object.entries(exportData.sections).forEach(function (entry) {
    var secId = entry[0];
    var sec = entry[1];
    sec.records.forEach(function (rec) {
      allRecords.push(
        Object.assign({ section: secId, control: sec.control }, rec)
      );
    });
  });

  if (allRecords.length > 0) {
    var keys = Object.keys(allRecords[0]);
    var recordsCsv =
      keys.join(",") +
      "\n" +
      allRecords
        .map(function (r) {
          return keys
            .map(function (k) {
              var v = r[k];
              if (v === null || v === undefined) return '""';
              if (typeof v === "object") v = JSON.stringify(v);
              return '"' + String(v).replace(/"/g, '""') + '"';
            })
            .join(",");
        })
        .join("\n");

    csvContent += "\n\n--- RECORDS ---\n" + recordsCsv;
  }

  var blob = new Blob([csvContent], { type: "text/csv" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download =
    prefix +
    "-evidence-" +
    exportData.export_metadata.framework_id +
    "-" +
    date +
    ".csv";
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Component ── */
export default function EvidenceExportPage() {
  var { t } = useTheme();
  var { org } = useAuth();
  var plan = org?.plan || "free";

  // Date range — default last 90 days
  var now = new Date();
  var ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  var [dateFrom, setDateFrom] = useState(
    ninetyDaysAgo.toISOString().slice(0, 10)
  );
  var [dateTo, setDateTo] = useState(now.toISOString().slice(0, 10));
  var [framework, setFramework] = useState("soc2");
  var [selectedSections, setSelectedSections] = useState(
    FRAMEWORKS.soc2.sections.map(function (s) {
      return s.id;
    })
  );
  var [loading, setLoading] = useState(false);
  var [preview, setPreview] = useState(null);
  var [expandedPreview, setExpandedPreview] = useState({});

  var fw = FRAMEWORKS[framework];

  var handleFrameworkChange = function (newFw) {
    setFramework(newFw);
    setSelectedSections(
      FRAMEWORKS[newFw].sections.map(function (s) {
        return s.id;
      })
    );
    setPreview(null);
  };

  var toggleSection = function (id) {
    setSelectedSections(function (p) {
      return p.indexOf(id) !== -1
        ? p.filter(function (s) {
            return s !== id;
          })
        : p.concat([id]);
    });
  };

  var handleGenerate = useCallback(
    async function () {
      if (!org) return;
      setLoading(true);
      setPreview(null);
      try {
        var data = await fetchEvidenceData(
          org.id,
          dateFrom + "T00:00:00Z",
          dateTo + "T23:59:59Z"
        );
        var exportData = buildFullExport(
          framework,
          selectedSections,
          data,
          org,
          dateFrom,
          dateTo
        );
        setPreview(exportData);
      } catch (err) {
        console.error("[evidence] Failed:", err);
      }
      setLoading(false);
    },
    [org, framework, selectedSections, dateFrom, dateTo]
  );

  var handleDownloadJSON = function () {
    if (!preview) return;
    var name = (org?.name || "org").replace(/\s+/g, "-").toLowerCase();
    downloadJSON(
      preview,
      name +
        "-evidence-" +
        framework +
        "-" +
        new Date().toISOString().slice(0, 10) +
        ".json"
    );
  };

  var handleDownloadCSV = function () {
    if (!preview) return;
    downloadCSVBundle(preview, org?.name);
  };

  var controlIcon = function (query) {
    if (query === "access") return Users;
    if (query === "changes") return GitPullRequest;
    if (query === "monitoring") return Scan;
    if (query === "vulnerabilities") return AlertTriangle;
    if (query === "risk") return Shield;
    if (query === "assets") return Globe;
    return FileText;
  };

  return (
    <PlanGate
      currentPlan={plan}
      requiredPlan="agency"
      feature="SOC 2 / ISO evidence export"
    >
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.3rem",
          }}
        >
          <Package size={20} color={t.accent} strokeWidth={2} />
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: t.ink,
              margin: 0,
            }}
          >
            Evidence Export
          </h1>
        </div>
        <p
          style={{
            color: t.ink50,
            fontSize: "0.88rem",
            marginBottom: "1.5rem",
          }}
        >
          Generate structured evidence packages for SOC 2 and ISO 27001 audits.
        </p>

        {/* Configuration */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* Left — framework + date */}
          <div
            style={{
              padding: "1.2rem",
              borderRadius: 10,
              border: "1px solid " + t.ink08,
              background: t.cardBg,
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: t.ink50,
                marginBottom: "0.5rem",
              }}
            >
              Framework
            </div>
            <div
              style={{ display: "flex", gap: "0.4rem", marginBottom: "1rem" }}
            >
              {Object.values(FRAMEWORKS).map(function (f) {
                var isActive = framework === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={function () {
                      handleFrameworkChange(f.id);
                    }}
                    style={{
                      flex: 1,
                      padding: "0.6rem 0.8rem",
                      borderRadius: 8,
                      border: "1.5px solid " + (isActive ? t.accent : t.ink08),
                      background: isActive ? t.accentBg : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: isActive ? t.accent : t.ink,
                        marginBottom: "0.15rem",
                      }}
                    >
                      {f.name}
                    </div>
                    <div
                      style={{
                        fontSize: "0.62rem",
                        color: t.ink50,
                        lineHeight: 1.4,
                      }}
                    >
                      {f.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: t.ink50,
                marginBottom: "0.4rem",
              }}
            >
              Evidence period
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <Calendar size={14} color={t.ink50} />
              <input
                type="date"
                value={dateFrom}
                onChange={function (e) {
                  setDateFrom(e.target.value);
                }}
                style={{
                  padding: "0.35rem 0.5rem",
                  borderRadius: 5,
                  border: "1.5px solid " + t.ink08,
                  background: t.paper,
                  color: t.ink,
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  outline: "none",
                }}
              />
              <span style={{ color: t.ink50, fontSize: "0.72rem" }}>to</span>
              <input
                type="date"
                value={dateTo}
                onChange={function (e) {
                  setDateTo(e.target.value);
                }}
                style={{
                  padding: "0.35rem 0.5rem",
                  borderRadius: 5,
                  border: "1.5px solid " + t.ink08,
                  background: t.paper,
                  color: t.ink,
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  outline: "none",
                }}
              />
            </div>
          </div>

          {/* Right — sections */}
          <div
            style={{
              padding: "1.2rem",
              borderRadius: 10,
              border: "1px solid " + t.ink08,
              background: t.cardBg,
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: t.ink50,
                marginBottom: "0.5rem",
              }}
            >
              Sections to include
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.25rem",
              }}
            >
              {fw.sections.map(function (sec) {
                var isSelected = selectedSections.indexOf(sec.id) !== -1;
                var Icon = controlIcon(sec.query);
                return (
                  <label
                    key={sec.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.4rem 0.5rem",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: isSelected ? t.accentBg : "transparent",
                      transition: "background 0.1s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={function () {
                        toggleSection(sec.id);
                      }}
                      style={{ accentColor: t.accent }}
                    />
                    <Icon size={13} color={isSelected ? t.accent : t.ink50} />
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: "0.76rem",
                          fontWeight: 600,
                          color: isSelected ? t.ink : t.ink50,
                        }}
                      >
                        {sec.title}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.52rem",
                          color: t.ink50,
                        }}
                      >
                        {sec.control}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={handleGenerate}
            disabled={loading || selectedSections.length === 0}
            style={{
              padding: "0.55rem 1.2rem",
              borderRadius: 8,
              border: "none",
              background: t.accent,
              color: "white",
              fontSize: "0.88rem",
              fontWeight: 600,
              cursor:
                loading || selectedSections.length === 0
                  ? "not-allowed"
                  : "pointer",
              opacity: loading || selectedSections.length === 0 ? 0.5 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="xsbl-spin" />
            ) : (
              <Package size={16} />
            )}
            {loading ? "Compiling evidence..." : "Generate evidence package"}
          </button>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.ink50,
            }}
          >
            {selectedSections.length} of {fw.sections.length} sections
          </span>
        </div>

        {/* Preview + Download */}
        {preview && (
          <div
            style={{
              borderRadius: 12,
              border: "1px solid " + t.ink08,
              background: t.cardBg,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "1rem 1.2rem",
                borderBottom: "1px solid " + t.ink08,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: t.ink04,
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <CheckCircle size={16} color={t.green} />
                <span
                  style={{ fontSize: "0.88rem", fontWeight: 600, color: t.ink }}
                >
                  Evidence package ready
                </span>
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    color: t.ink50,
                  }}
                >
                  {Object.keys(preview.sections).length} sections &middot;{" "}
                  {preview.export_metadata.framework}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                <button
                  onClick={handleDownloadJSON}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: 6,
                    border: "1.5px solid " + t.ink08,
                    background: "none",
                    color: t.ink,
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <FileJson size={13} /> JSON
                </button>
                <button
                  onClick={handleDownloadCSV}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: 6,
                    border: "1.5px solid " + t.ink08,
                    background: "none",
                    color: t.ink,
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <Download size={13} /> CSV
                </button>
              </div>
            </div>

            {/* Section previews */}
            <div style={{ padding: "0.5rem 0" }}>
              {Object.entries(preview.sections).map(function (entry) {
                var secId = entry[0];
                var sec = entry[1];
                var isExpanded = !!expandedPreview[secId];
                var Icon = controlIcon(
                  fw.sections.find(function (s) {
                    return s.id === secId;
                  })?.query || ""
                );

                return (
                  <div key={secId}>
                    <button
                      onClick={function () {
                        setExpandedPreview(function (p) {
                          var n = Object.assign({}, p);
                          n[secId] = !n[secId];
                          return n;
                        });
                      }}
                      style={{
                        width: "100%",
                        padding: "0.7rem 1.2rem",
                        border: "none",
                        background: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        cursor: "pointer",
                        borderTop: "1px solid " + t.ink04,
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown size={14} color={t.ink50} />
                      ) : (
                        <ChevronRight size={14} color={t.ink50} />
                      )}
                      <Icon size={14} color={t.accent} />
                      <div style={{ flex: 1, textAlign: "left" }}>
                        <span
                          style={{
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: t.ink,
                          }}
                        >
                          {sec.title}
                        </span>
                        <span
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.55rem",
                            color: t.ink50,
                            marginLeft: "0.5rem",
                          }}
                        >
                          {sec.control}
                        </span>
                      </div>
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.62rem",
                          color: t.ink50,
                        }}
                      >
                        {sec.records.length} records
                      </span>
                    </button>

                    {isExpanded && (
                      <div style={{ padding: "0 1.2rem 1rem 2.8rem" }}>
                        {/* Summary cards */}
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.5rem",
                            marginBottom: "0.8rem",
                          }}
                        >
                          {Object.entries(sec.summary).map(function (s) {
                            var key = s[0];
                            var val = s[1];
                            if (typeof val === "object") return null;
                            return (
                              <div
                                key={key}
                                style={{
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: 5,
                                  background: t.ink04,
                                  fontFamily: "var(--mono)",
                                  fontSize: "0.6rem",
                                }}
                              >
                                <span style={{ color: t.ink50 }}>
                                  {key.replace(/_/g, " ")}:{" "}
                                </span>
                                <span style={{ color: t.ink, fontWeight: 600 }}>
                                  {val === null ? "—" : String(val)}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Sample records */}
                        {sec.records.length > 0 && (
                          <div
                            style={{
                              padding: "0.6rem 0.8rem",
                              borderRadius: 6,
                              background: t.ink04,
                              fontFamily: "var(--mono)",
                              fontSize: "0.6rem",
                              color: t.ink50,
                              maxHeight: 200,
                              overflowY: "auto",
                              whiteSpace: "pre-wrap",
                              lineHeight: 1.6,
                            }}
                          >
                            {JSON.stringify(sec.records.slice(0, 3), null, 2)}
                            {sec.records.length > 3 && (
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  color: t.accent,
                                  fontWeight: 600,
                                }}
                              >
                                ... and {sec.records.length - 3} more records in
                                the export
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <style>{`
          @keyframes xsbl-spin { to { transform: rotate(360deg); } }
          .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
        `}</style>
      </div>
    </PlanGate>
  );
}
