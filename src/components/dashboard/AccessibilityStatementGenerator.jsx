import { useState, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { X, FileText, Copy, Check, Download, Eye, Code } from "lucide-react";

function esc(s) {
  return (s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatDate(d) {
  return new Date(d || Date.now()).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function AccessibilityStatementGenerator({
  site,
  issues,
  scans,
  onClose,
}) {
  var { t } = useTheme();
  var { org } = useAuth();

  var [companyName, setCompanyName] = useState(org?.name || "");
  var [websiteUrl, setWebsiteUrl] = useState(
    (site.domain || "").startsWith("http")
      ? site.domain
      : "https://" + (site.domain || "")
  );
  var [contactEmail, setContactEmail] = useState("");
  var [contactPhone, setContactPhone] = useState("");
  var [standard, setStandard] = useState("AA");
  var [additionalNotes, setAdditionalNotes] = useState("");
  var [viewMode, setViewMode] = useState("preview");
  var [copied, setCopied] = useState(false);

  // Derive data from scan results
  var openIssues = issues.filter(function (i) {
    return i.status === "open";
  });
  var impactCounts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  openIssues.forEach(function (i) {
    impactCounts[i.impact] = (impactCounts[i.impact] || 0) + 1;
  });
  var score = site.score != null ? Math.round(site.score) : null;
  var lastScanDate = site.last_scan_at ? formatDate(site.last_scan_at) : null;
  var totalScans = scans ? scans.length : 0;

  // Collect unique WCAG tags across issues
  var wcagSet = new Set();
  openIssues.forEach(function (i) {
    (i.wcag_tags || []).forEach(function (tag) {
      wcagSet.add(tag);
    });
  });
  var wcagTags = Array.from(wcagSet).sort();

  // Build known limitations from top issue rules
  var ruleMap = {};
  openIssues.forEach(function (i) {
    if (!ruleMap[i.rule_id]) {
      ruleMap[i.rule_id] = {
        rule_id: i.rule_id,
        description: i.description,
        impact: i.impact,
        count: 0,
      };
    }
    ruleMap[i.rule_id].count++;
  });
  var topRules = Object.values(ruleMap)
    .sort(function (a, b) {
      var ord = { critical: 0, serious: 1, moderate: 2, minor: 3 };
      return (ord[a.impact] || 4) - (ord[b.impact] || 4);
    })
    .slice(0, 6);

  var name = companyName || "Our organization";

  // Generate the statement
  var statement = useMemo(
    function () {
      var lines = [];

      lines.push("# Accessibility Statement");
      lines.push("");
      lines.push(
        name +
          " is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards."
      );
      lines.push("");

      // Conformance status
      lines.push("## Conformance Status");
      lines.push("");
      var wcagLevel =
        standard === "AAA" ? "WCAG 2.2 Level AAA" : "WCAG 2.2 Level AA";
      if (score != null && score >= 90) {
        lines.push(
          websiteUrl +
            " is substantially conformant with " +
            wcagLevel +
            ". Substantially conformant means that some parts of the content may not fully conform to the accessibility standard."
        );
      } else if (score != null && score >= 70) {
        lines.push(
          websiteUrl +
            " is partially conformant with " +
            wcagLevel +
            ". Partially conformant means that some aspects of the content do not fully conform to the accessibility standard. We are actively working to resolve these issues."
        );
      } else {
        lines.push(
          websiteUrl +
            " is working toward conformance with " +
            wcagLevel +
            ". We acknowledge that there are areas requiring improvement and are committed to making the necessary changes."
        );
      }
      lines.push("");

      // Measures
      lines.push("## Measures to Support Accessibility");
      lines.push("");
      lines.push(
        name + " takes the following measures to ensure accessibility:"
      );
      lines.push("");
      lines.push(
        "- Automated accessibility scanning with continuous monitoring"
      );
      lines.push(
        "- Testing against WCAG 2.2 " +
          standard +
          " success criteria using axe-core in a real browser environment"
      );
      if (totalScans > 1) {
        lines.push("- Regular recurring scans to catch regressions");
      }
      if (impactCounts.critical > 0 || impactCounts.serious > 0) {
        lines.push(
          "- Prioritized remediation of critical and serious accessibility barriers"
        );
      }
      lines.push("- Ongoing review of content for accessibility compliance");
      lines.push("");

      // Current status
      if (score != null) {
        lines.push("## Current Accessibility Score");
        lines.push("");
        lines.push(
          "As of " +
            (lastScanDate || formatDate()) +
            ", our automated accessibility score is **" +
            score +
            "/100** based on " +
            wcagLevel +
            " criteria."
        );
        lines.push("");
        if (openIssues.length > 0) {
          lines.push("Current open issues by severity:");
          lines.push("");
          if (impactCounts.critical > 0)
            lines.push(
              "- **Critical:** " +
                impactCounts.critical +
                " issue" +
                (impactCounts.critical !== 1 ? "s" : "")
            );
          if (impactCounts.serious > 0)
            lines.push(
              "- **Serious:** " +
                impactCounts.serious +
                " issue" +
                (impactCounts.serious !== 1 ? "s" : "")
            );
          if (impactCounts.moderate > 0)
            lines.push(
              "- **Moderate:** " +
                impactCounts.moderate +
                " issue" +
                (impactCounts.moderate !== 1 ? "s" : "")
            );
          if (impactCounts.minor > 0)
            lines.push(
              "- **Minor:** " +
                impactCounts.minor +
                " issue" +
                (impactCounts.minor !== 1 ? "s" : "")
            );
          lines.push("");
        }
      }

      // Known limitations
      if (topRules.length > 0) {
        lines.push("## Known Limitations");
        lines.push("");
        lines.push(
          "Despite our best efforts, some areas of " +
            websiteUrl +
            " may not be fully accessible. Below is a summary of known issues we are working to resolve:"
        );
        lines.push("");
        for (var ri = 0; ri < topRules.length; ri++) {
          var rule = topRules[ri];
          lines.push(
            "- **" +
              rule.description +
              "** (" +
              rule.count +
              " instance" +
              (rule.count !== 1 ? "s" : "") +
              ", " +
              rule.impact +
              " impact)"
          );
        }
        lines.push("");
        lines.push(
          "We are actively working to remediate these issues and improve overall accessibility."
        );
        lines.push("");
      }

      // Technical specifications
      lines.push("## Technical Specifications");
      lines.push("");
      lines.push(
        "The accessibility of " +
          websiteUrl +
          " relies on the following technologies:"
      );
      lines.push("");
      lines.push("- HTML");
      lines.push("- CSS");
      lines.push("- JavaScript");
      lines.push("- WAI-ARIA");
      lines.push("");
      lines.push(
        "These technologies are relied upon for conformance with " +
          wcagLevel +
          "."
      );
      lines.push("");

      // Assessment approach
      lines.push("## Assessment Approach");
      lines.push("");
      lines.push(
        name +
          " assessed the accessibility of " +
          websiteUrl +
          " using automated scanning with xsbl, which tests the rendered DOM in a real Chromium browser against " +
          wcagLevel +
          " criteria. " +
          (totalScans > 0
            ? totalScans +
              " scan" +
              (totalScans !== 1 ? "s" : "") +
              " " +
              (totalScans !== 1 ? "have" : "has") +
              " been performed to date."
            : "")
      );
      lines.push("");
      if (wcagTags.length > 0) {
        lines.push(
          "WCAG criteria evaluated include: " + wcagTags.join(", ") + "."
        );
        lines.push("");
      }

      // Additional notes
      if (additionalNotes.trim()) {
        lines.push("## Additional Information");
        lines.push("");
        lines.push(additionalNotes.trim());
        lines.push("");
      }

      // Feedback
      lines.push("## Feedback");
      lines.push("");
      lines.push(
        "We welcome your feedback on the accessibility of " +
          websiteUrl +
          ". If you encounter accessibility barriers, please let us know:"
      );
      lines.push("");
      if (contactEmail) lines.push("- **Email:** " + contactEmail);
      if (contactPhone) lines.push("- **Phone:** " + contactPhone);
      if (!contactEmail && !contactPhone)
        lines.push("- Contact us through our website");
      lines.push("");
      lines.push(
        "We aim to respond to accessibility feedback within 5 business days."
      );
      lines.push("");

      // Date
      lines.push("---");
      lines.push("");
      lines.push(
        "*This statement was generated on " +
          formatDate() +
          " and is based on automated testing results. Manual accessibility testing may reveal additional areas for improvement.*"
      );

      return lines.join("\n");
    },
    [
      companyName,
      websiteUrl,
      contactEmail,
      contactPhone,
      standard,
      additionalNotes,
      score,
      openIssues.length,
      totalScans,
    ]
  );

  // Convert markdown to simple HTML
  var htmlOutput = useMemo(
    function () {
      return statement
        .replace(/^# (.+)$/gm, "<h1>$1</h1>")
        .replace(/^## (.+)$/gm, "<h2>$1</h2>")
        .replace(/^\- \*\*(.+?)\*\*(.*)$/gm, "<li><strong>$1</strong>$2</li>")
        .replace(/^\- (.+)$/gm, "<li>$1</li>")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(/^---$/gm, "<hr>")
        .replace(/(<li>.*<\/li>\n?)+/g, function (match) {
          return "<ul>\n" + match + "</ul>\n";
        })
        .replace(/\n\n/g, "\n</p>\n<p>\n")
        .replace(/^(?!<[hul1-9ip])/gm, function (match, offset, str) {
          var line = str.substring(offset).split("\n")[0];
          if (!line.trim() || line.startsWith("<") || line.startsWith("</"))
            return match;
          return match;
        });
    },
    [statement]
  );

  var handleCopy = function (format) {
    var text = format === "html" ? htmlOutput : statement;
    navigator.clipboard.writeText(text).then(function () {
      setCopied(true);
      setTimeout(function () {
        setCopied(false);
      }, 2000);
    });
  };

  var handleDownload = function () {
    var blob = new Blob([statement], { type: "text/markdown" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download =
      (site.domain || "site").replace(/[^a-z0-9]/gi, "-") +
      "-accessibility-statement.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  // Render markdown for preview (simple conversion)
  function renderPreview(md) {
    var html = md
      .replace(
        /^# (.+)$/gm,
        '<h1 style="font-family:var(--serif);font-size:1.4rem;font-weight:700;margin:1.5rem 0 0.5rem;color:' +
          t.ink +
          ';">$1</h1>'
      )
      .replace(
        /^## (.+)$/gm,
        '<h2 style="font-family:var(--serif);font-size:1.05rem;font-weight:700;margin:1.3rem 0 0.4rem;color:' +
          t.ink +
          ';">$1</h2>'
      )
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^- (.+)$/gm, '<li style="margin-bottom:0.25rem;">$1</li>')
      .replace(/(<li[^>]*>.*<\/li>\n?)+/g, function (match) {
        return (
          '<ul style="margin:0.4rem 0 0.8rem;padding-left:1.3rem;color:' +
          t.ink50 +
          ';">' +
          match +
          "</ul>"
        );
      })
      .replace(
        /^---$/gm,
        '<hr style="border:none;border-top:1px solid ' +
          t.ink08 +
          ';margin:1.2rem 0;">'
      )
      .replace(/\n\n/g, "<br><br>");

    return html;
  }

  var inputStyle = {
    width: "100%",
    padding: "0.5rem 0.7rem",
    borderRadius: 7,
    border: "1.5px solid " + t.ink08,
    background: t.cardBg,
    color: t.ink,
    fontFamily: "var(--body)",
    fontSize: "0.82rem",
    outline: "none",
    transition: "border-color 0.15s",
    boxSizing: "border-box",
  };

  var labelStyle = {
    fontFamily: "var(--mono)",
    fontSize: "0.6rem",
    fontWeight: 600,
    color: t.ink50,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    marginBottom: "0.25rem",
    display: "block",
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(4px)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 900,
          maxHeight: "92vh",
          borderRadius: 16,
          background: t.paper,
          border: "1px solid " + t.ink08,
          boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.4rem",
            borderBottom: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <FileText size={18} color={t.accent} strokeWidth={2} />
            <div>
              <h2
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: t.ink,
                  margin: 0,
                }}
              >
                Accessibility Statement
              </h2>
              <p
                style={{
                  fontFamily: "var(--body)",
                  fontSize: "0.72rem",
                  color: t.ink50,
                  margin: "0.1rem 0 0",
                }}
              >
                Generate a customizable statement for {site.domain}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.ink50,
              padding: "0.3rem",
              borderRadius: 6,
              display: "flex",
            }}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Body — two columns */}
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            minHeight: 0,
          }}
        >
          {/* Left: Form */}
          <div
            style={{
              width: 300,
              flexShrink: 0,
              padding: "1.2rem",
              borderRight: "1px solid " + t.ink08,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.8rem",
            }}
          >
            <div>
              <label style={labelStyle}>Company / Organization</label>
              <input
                value={companyName}
                onChange={function (e) {
                  setCompanyName(e.target.value);
                }}
                placeholder="Acme Inc."
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Website URL</label>
              <input
                value={websiteUrl}
                onChange={function (e) {
                  setWebsiteUrl(e.target.value);
                }}
                placeholder="https://example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Contact email</label>
              <input
                type="email"
                value={contactEmail}
                onChange={function (e) {
                  setContactEmail(e.target.value);
                }}
                placeholder="accessibility@example.com"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Contact phone (optional)</label>
              <input
                value={contactPhone}
                onChange={function (e) {
                  setContactPhone(e.target.value);
                }}
                placeholder="+1 (555) 123-4567"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Compliance standard</label>
              <div style={{ display: "flex", gap: "0.4rem" }}>
                {["AA", "AAA"].map(function (lvl) {
                  var active = standard === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={function () {
                        setStandard(lvl);
                      }}
                      style={{
                        flex: 1,
                        padding: "0.45rem",
                        borderRadius: 6,
                        border: "1.5px solid " + (active ? t.accent : t.ink08),
                        background: active ? t.accentBg : "none",
                        color: active ? t.accent : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        transition: "all 0.15s",
                      }}
                    >
                      WCAG {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Additional notes (optional)</label>
              <textarea
                value={additionalNotes}
                onChange={function (e) {
                  setAdditionalNotes(e.target.value);
                }}
                placeholder="Any extra information about your accessibility efforts, accommodations, or policies..."
                rows={4}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "var(--body)",
                  lineHeight: 1.6,
                }}
              />
            </div>

            {/* Scan data summary */}
            {score != null && (
              <div
                style={{
                  padding: "0.7rem 0.8rem",
                  borderRadius: 8,
                  background: t.accentBg,
                  border: "1px solid " + t.accent + "15",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.56rem",
                    fontWeight: 600,
                    color: t.accent,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "0.3rem",
                  }}
                >
                  From your scan data
                </div>
                <div
                  style={{ fontSize: "0.76rem", color: t.ink, lineHeight: 1.7 }}
                >
                  Score <strong>{score}/100</strong> · {openIssues.length} open
                  issue{openIssues.length !== 1 ? "s" : ""}
                  {lastScanDate && <> · Last scanned {lastScanDate}</>}
                </div>
              </div>
            )}
          </div>

          {/* Right: Preview / Code */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minWidth: 0,
            }}
          >
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                gap: "0.3rem",
                padding: "0.7rem 1.2rem",
                borderBottom: "1px solid " + t.ink08,
                flexShrink: 0,
              }}
            >
              {[
                { id: "preview", label: "Preview", icon: Eye },
                { id: "markdown", label: "Markdown", icon: Code },
                { id: "html", label: "HTML", icon: Code },
              ].map(function (tab) {
                var active = viewMode === tab.id;
                var Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={function () {
                      setViewMode(tab.id);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.35rem 0.7rem",
                      borderRadius: 6,
                      border: "none",
                      background: active ? t.accentBg : "none",
                      color: active ? t.accent : t.ink50,
                      fontFamily: "var(--mono)",
                      fontSize: "0.66rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <Icon size={12} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1.2rem 1.4rem",
              }}
            >
              {viewMode === "preview" && (
                <div
                  style={{
                    fontSize: "0.88rem",
                    color: t.ink50,
                    lineHeight: 1.8,
                  }}
                  dangerouslySetInnerHTML={{ __html: renderPreview(statement) }}
                />
              )}
              {viewMode === "markdown" && (
                <pre
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    color: t.ink,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {statement}
                </pre>
              )}
              {viewMode === "html" && (
                <pre
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.72rem",
                    color: t.ink,
                    lineHeight: 1.7,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    margin: 0,
                  }}
                >
                  {htmlOutput}
                </pre>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div
          style={{
            padding: "0.8rem 1.4rem",
            borderTop: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexShrink: 0,
          }}
        >
          <button
            onClick={function () {
              handleCopy(viewMode === "html" ? "html" : "markdown");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: "none",
              background: t.accent,
              color: "white",
              fontFamily: "var(--body)",
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {copied ? (
              <Check size={13} strokeWidth={2.5} />
            ) : (
              <Copy size={13} strokeWidth={2} />
            )}
            {copied
              ? "Copied!"
              : "Copy " + (viewMode === "html" ? "HTML" : "Markdown")}
          </button>
          <button
            onClick={handleDownload}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: "1.5px solid " + t.ink20,
              background: "none",
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.8rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Download size={13} strokeWidth={2} />
            Download .md
          </button>
          <div style={{ flex: 1 }} />
          <button
            onClick={onClose}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: "none",
              background: "none",
              color: t.ink50,
              fontFamily: "var(--body)",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
