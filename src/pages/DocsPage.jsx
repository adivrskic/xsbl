import { useState, useEffect, useRef } from "react";
import { useTheme } from "../context/ThemeContext";
import {
  Book,
  Code,
  Globe,
  Zap,
  Shield,
  GitBranch,
  Bell,
  Key,
  Eye,
  FileText,
  Terminal,
} from "lucide-react";
import { Link } from "react-router-dom";
import FadeIn from "../components/landing/FadeIn";

function CodeBlock({ code, lang }) {
  const { t } = useTheme();
  const [copied, setCopied] = useState(false);
  var handleCopy = function () {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };
  return (
    <div
      style={{
        position: "relative",
        borderRadius: 10,
        overflow: "hidden",
        marginBottom: "1.2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "0.5rem 1rem",
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          {lang}
        </span>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "none",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: copied ? "#34d399" : "rgba(255,255,255,0.3)",
            cursor: "pointer",
          }}
        >
          {copied ? "copied!" : "copy"}
        </button>
      </div>
      <pre
        style={{
          padding: "1rem 1.2rem",
          background: t.codeBg,
          fontFamily: "var(--mono)",
          fontSize: "0.74rem",
          color: "#a3a3a3",
          overflowX: "auto",
          margin: 0,
          lineHeight: 1.8,
          whiteSpace: "pre-wrap",
          wordBreak: "break-all",
        }}
      >
        {code}
      </pre>
    </div>
  );
}

function Sec({ id, icon: Icon, title, children }) {
  const { t } = useTheme();
  return (
    <FadeIn>
      <section
        id={id}
        style={{ marginBottom: "3.5rem", scrollMarginTop: "100px" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1rem",
          }}
        >
          <Icon size={20} color={t.accent} strokeWidth={1.8} />
          <h2
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: t.ink,
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
        <div style={{ fontSize: "0.92rem", color: t.ink50, lineHeight: 1.8 }}>
          {children}
        </div>
      </section>
    </FadeIn>
  );
}

function P({ children }) {
  return <p style={{ marginBottom: "0.8rem" }}>{children}</p>;
}
function B({ children }) {
  var { t } = useTheme();
  return <strong style={{ color: t.ink }}>{children}</strong>;
}
function Note({ children }) {
  var { t } = useTheme();
  return (
    <div
      style={{
        padding: "0.7rem 1rem",
        borderRadius: 8,
        background: t.accentBg,
        border: "1px solid " + t.accent + "20",
        fontSize: "0.84rem",
        color: t.ink,
        marginBottom: "1rem",
        lineHeight: 1.6,
      }}
    >
      {children}
    </div>
  );
}
function Mono({ children }) {
  var { t } = useTheme();
  return (
    <code
      style={{
        fontFamily: "var(--mono)",
        background: t.ink04,
        padding: "0.1rem 0.4rem",
        borderRadius: 3,
        fontSize: "0.84rem",
      }}
    >
      {children}
    </code>
  );
}

var sidebar = [
  { id: "getting-started", label: "Getting started", group: "Guides" },
  { id: "github-setup", label: "GitHub integration", group: "Guides" },
  { id: "cicd", label: "CI/CD (GitHub Actions)", group: "Guides" },
  { id: "slack-email", label: "Slack & email alerts", group: "Guides" },
  { id: "api-keys", label: "API keys", group: "API Reference" },
  { id: "quick-scan-api", label: "Quick scan", group: "API Reference" },
  { id: "scan-site-api", label: "Scan site", group: "API Reference" },
  { id: "bulk-fix-api", label: "Bulk fix PR", group: "API Reference" },
  {
    id: "generate-report-api",
    label: "Generate report",
    group: "API Reference",
  },
  { id: "alt-text-api", label: "Alt text generation", group: "API Reference" },
  { id: "check-usage-api", label: "Usage", group: "API Reference" },
  { id: "badge-api", label: "Badge", group: "API Reference" },
  { id: "rate-limits", label: "Rate limits", group: "Reference" },
  { id: "webhooks", label: "Realtime events", group: "Reference" },
];

export default function DocsPage() {
  const { t } = useTheme();
  const [activeSection, setActiveSection] = useState("getting-started");
  const activeSectionRef = useRef(activeSection);
  const isClickScrolling = useRef(false);

  // Scroll spy using IntersectionObserver
  useEffect(function () {
    var sectionIds = sidebar.map(function (s) {
      return s.id;
    });
    var lastId = sectionIds[sectionIds.length - 1];
    var visibleSections = {};

    var observer = new IntersectionObserver(
      function (entries) {
        if (isClickScrolling.current) return;
        entries.forEach(function (entry) {
          visibleSections[entry.target.id] = entry.isIntersecting;
        });
        // Pick the first visible section in document order
        for (var i = 0; i < sectionIds.length; i++) {
          if (visibleSections[sectionIds[i]]) {
            if (activeSectionRef.current !== sectionIds[i]) {
              activeSectionRef.current = sectionIds[i];
              setActiveSection(sectionIds[i]);
            }
            return;
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    // When scrolled to the bottom, force-select the last section
    var handleScroll = function () {
      if (isClickScrolling.current) return;
      var atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 40;
      if (atBottom && activeSectionRef.current !== lastId) {
        activeSectionRef.current = lastId;
        setActiveSection(lastId);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });

    return function () {
      observer.disconnect();
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  var scrollTo = function (id) {
    isClickScrolling.current = true;
    activeSectionRef.current = id;
    setActiveSection(id);
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Re-enable observer after scroll settles
    setTimeout(function () {
      isClickScrolling.current = false;
    }, 800);
  };

  var groups = [];
  var lastGroup = "";
  for (var i = 0; i < sidebar.length; i++) {
    if (sidebar[i].group !== lastGroup) {
      groups.push({ name: sidebar[i].group, items: [] });
      lastGroup = sidebar[i].group;
    }
    groups[groups.length - 1].items.push(sidebar[i]);
  }

  var BASE = "https://YOUR_PROJECT.supabase.co";

  return (
    <div>
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "6rem clamp(1.5rem, 3vw, 3rem) 4rem",
          display: "flex",
          gap: "3rem",
        }}
      >
        <aside
          className="hide-mobile"
          style={{
            width: 200,
            flexShrink: 0,
            position: "sticky",
            top: 80,
            alignSelf: "flex-start",
          }}
        >
          {groups.map(function (g) {
            return (
              <div key={g.name} style={{ marginBottom: "1rem" }}>
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: "0.4rem",
                    fontWeight: 600,
                    padding: "0 0.6rem",
                  }}
                >
                  {g.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.1rem",
                  }}
                >
                  {g.items.map(function (item) {
                    return (
                      <button
                        key={item.id}
                        onClick={function () {
                          scrollTo(item.id);
                        }}
                        style={{
                          background:
                            activeSection === item.id ? t.accentBg : "none",
                          border: "none",
                          padding: "0.35rem 0.6rem",
                          borderRadius: 5,
                          cursor: "pointer",
                          fontFamily: "var(--body)",
                          fontSize: "0.78rem",
                          fontWeight: 500,
                          color: activeSection === item.id ? t.accent : t.ink50,
                          textAlign: "left",
                        }}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </aside>

        <main style={{ flex: 1, minWidth: 0 }}>
          <FadeIn>
            <div style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  color: t.accent,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 600,
                  marginBottom: "0.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span
                  style={{ width: 20, height: 1.5, background: t.accent }}
                />{" "}
                Documentation
              </div>
              <h1
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
                  fontWeight: 700,
                  color: t.ink,
                  lineHeight: 1.15,
                  marginBottom: "0.8rem",
                }}
              >
                xsbl Docs
              </h1>
              <P>
                Guides, API reference, and integration setup for xsbl
                accessibility scanning.
              </P>
            </div>
          </FadeIn>

          {/* ═══ GUIDES ═══ */}

          <Sec id="getting-started" icon={Book} title="Getting started">
            <P>
              xsbl scans websites for WCAG 2.2 accessibility violations using
              axe-core in a real browser. There are three ways to use it:
            </P>
            <P>
              <B>1. Dashboard</B> — add sites, run scans, view issues, and
              generate reports at{" "}
              <Link to="/dashboard" style={{ color: t.accent }}>
                xsbl.io/dashboard
              </Link>
              .
            </P>
            <P>
              <B>2. GitHub integration</B> — connect your repo, select issues,
              and xsbl creates a pull request with AI-generated code fixes.
            </P>
            <P>
              <B>3. API & CI/CD</B> — trigger scans from your deployment
              pipeline using API keys.
            </P>
            <Note>
              All plans include the dashboard and scanning. GitHub PRs, API
              keys, and CI/CD require Pro or Agency.
            </Note>
          </Sec>

          <Sec id="github-setup" icon={GitBranch} title="GitHub integration">
            <P>
              Connect a GitHub repo to enable one-click PR creation for
              accessibility fixes.
            </P>
            <P>
              <B>Step 1:</B> Go to your site → Settings → GitHub Integration.
            </P>
            <P>
              <B>Step 2:</B> Enter your repo (e.g. <Mono>acme/website</Mono>)
              and a Personal Access Token with <Mono>repo</Mono> scope.
            </P>
            <P>
              <B>Step 3:</B> Click Test to verify, then Save.
            </P>
            <Note>
              Create a token at{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=xsbl-fixes"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: t.accent }}
              >
                github.com/settings/tokens
              </a>{" "}
              — select the "repo" scope.
            </Note>
            <P>
              <B>Single fix:</B> Open any issue → click "Create fix PR" → xsbl
              reads your source code, generates a fix, and opens a PR.
            </P>
            <P>
              <B>Bulk fix:</B> On the Issues tab, check multiple issues (or use
              quick-select buttons like "All critical"), then click "Create fix
              PR" in the floating bar. One PR with all fixes.
            </P>
            <P>
              <B>How file discovery works:</B> xsbl fetches your repo's file
              tree, scores files by relevance (matching page URLs to file names,
              component names, CSS selectors), fetches the top source files,
              sends them to the AI along with the issues, and commits the fixed
              files to a new branch.
            </P>
          </Sec>

          <Sec id="cicd" icon={Terminal} title="CI/CD (GitHub Actions)">
            <P>Run accessibility scans automatically after every deploy.</P>
            <P>
              <B>Step 1:</B> Create an API key in Settings → API Keys (Pro or
              Agency required).
            </P>
            <P>
              <B>Step 2:</B> Add repository secrets in GitHub:
            </P>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.78rem",
                lineHeight: 2.2,
                marginBottom: "0.8rem",
              }}
            >
              <div>
                <span style={{ color: t.accent }}>XSBL_API_KEY</span> — your API
                key
              </div>
              <div>
                <span style={{ color: t.accent }}>XSBL_SITE_ID</span> — your
                site UUID (from the URL in the dashboard)
              </div>
            </div>
            <P>
              <B>Step 3:</B> Add this workflow file to your repo:
            </P>
            <CodeBlock
              lang=".github/workflows/xsbl-a11y.yml"
              code={`name: Accessibility Scan
on:
  push:
    branches: [main]
  deployment_status:
    types: [completed]

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger xsbl scan
        run: |
          RESPONSE=$(curl -s \\
            -X POST "${BASE}/functions/v1/scan-site" \\
            -H "Authorization: Bearer \${{ secrets.XSBL_API_KEY }}" \\
            -H "Content-Type: application/json" \\
            -d '{"site_id": "\${{ secrets.XSBL_SITE_ID }}"}')
          
          SCORE=$(echo "$RESPONSE" | jq -r '.score')
          ISSUES=$(echo "$RESPONSE" | jq -r '.issues_found')
          
          echo "### Accessibility: $SCORE/100" >> $GITHUB_STEP_SUMMARY
          echo "$ISSUES issues found" >> $GITHUB_STEP_SUMMARY
          
          # Fail build if score is below threshold:
          # if (( $(echo "$SCORE < 70" | bc -l) )); then exit 1; fi`}
            />
            <P>
              The scan results appear in the GitHub Step Summary on every run.
              Uncomment the last line to fail builds when the score drops below
              your threshold.
            </P>
          </Sec>

          <Sec id="slack-email" icon={Bell} title="Slack & email alerts">
            <P>Get notified after every scan completes.</P>
            <P>
              <B>Slack:</B> Go to Settings → Alert Integrations → paste your
              Slack webhook URL → click Test. You'll get a rich message with
              score, issues, and a dashboard link.
            </P>
            <Note>
              Create a webhook at{" "}
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: t.accent }}
              >
                api.slack.com/messaging/webhooks
              </a>
            </Note>
            <P>
              <B>Email:</B> Add email addresses in Settings → Alert
              Integrations, or leave blank to use team members' addresses based
              on their notification preferences.
            </P>
          </Sec>

          {/* ═══ API REFERENCE ═══ */}

          <Sec id="api-keys" icon={Key} title="API keys">
            <P>
              API keys let you authenticate without a user session. Available on
              Pro and Agency.
            </P>
            <P>
              Create keys in Settings → API Keys. Each key is shown once — copy
              it immediately.
            </P>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/scan-site \\
  -H "Authorization: Bearer xsbl_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "your-site-uuid"}'`}
            />
            <P>
              Keys are prefixed with <Mono>xsbl_</Mono>, 45 characters. Max 5
              active keys per org.
            </P>
          </Sec>

          <Sec id="quick-scan-api" icon={Zap} title="Quick scan (public)">
            <P>Scan any URL without authentication.</P>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/quick-scan \\
  -H "Content-Type: application/json" \\
  -d '{"url": "https://example.com"}'`}
            />
            <CodeBlock
              lang="json"
              code={`{
  "score": 72,
  "issues_found": 14,
  "impact": { "critical": 2, "serious": 5, "moderate": 4, "minor": 3 },
  "top_issues": [
    { "rule_id": "image-alt", "impact": "critical", "count": 5,
      "description": "Images must have alternate text" }
  ]
}`}
            />
          </Sec>

          <Sec
            id="scan-site-api"
            icon={Globe}
            title="Scan site (authenticated)"
          >
            <P>Trigger a multi-page scan. Returns results synchronously.</P>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/scan-site \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "uuid"}'`}
            />
            <P>Pass specific URLs to scan only certain pages:</P>
            <CodeBlock
              lang="json"
              code={`{ "site_id": "uuid", "urls": ["https://example.com/", "https://example.com/about"] }`}
            />
            <P>
              <B>Page limits:</B> Free: 5, Starter: 10, Pro: 25, Agency: 50
            </P>
          </Sec>

          <Sec
            id="bulk-fix-api"
            icon={GitBranch}
            title="Bulk fix PR (authenticated)"
          >
            <P>
              Create a single PR fixing multiple issues. Requires GitHub
              connected on the site.
            </P>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/bulk-fix-pr \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "uuid", "issue_ids": ["id1", "id2", "id3"]}'`}
            />
            <CodeBlock
              lang="json"
              code={`{
  "status": "created",
  "pr_number": 42,
  "pr_url": "https://github.com/acme/site/pull/42",
  "issues_fixed": 3,
  "files_changed": 2
}`}
            />
          </Sec>

          <Sec
            id="generate-report-api"
            icon={FileText}
            title="Generate report (authenticated)"
          >
            <P>
              Generate an HTML compliance report (VPAT format). Print to PDF
              from the browser.
            </P>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/generate-report \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "uuid", "format": "html"}'`}
            />
            <P>
              Use <Mono>format: "json"</Mono> for raw data export.
            </P>
          </Sec>

          <Sec
            id="alt-text-api"
            icon={Eye}
            title="Alt text generation (authenticated)"
          >
            <P>Send an image URL and get Vision AI-generated alt text.</P>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/generate-alt-text \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"image_url": "https://example.com/hero.jpg", "page_url": "https://example.com"}'`}
            />
            <CodeBlock
              lang="json"
              code={`{
  "alt_text": "Team collaborating around a laptop in a modern office",
  "is_decorative": false,
  "confidence": 0.92
}`}
            />
            <P>Supports JPEG, PNG, GIF, WebP, and SVG. Max 5MB.</P>
          </Sec>

          <Sec id="check-usage-api" icon={Code} title="Usage (authenticated)">
            <P>Check current billing period usage:</P>
            <CodeBlock
              lang="bash"
              code={`curl ${BASE}/functions/v1/check-usage \\
  -H "Authorization: Bearer YOUR_TOKEN"`}
            />
            <CodeBlock
              lang="json"
              code={`{
  "plan": "pro",
  "scans_used": 42,
  "scans_limit": 100,
  "scans_remaining": 58,
  "can_scan": true
}`}
            />
          </Sec>

          <Sec id="badge-api" icon={Shield} title="Badge (public)">
            <P>Embed a dynamic accessibility score badge.</P>
            <CodeBlock
              lang="markdown"
              code={`![accessibility](${BASE}/functions/v1/badge?domain=example.com)`}
            />
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.78rem",
                lineHeight: 2,
              }}
            >
              <div>
                <span style={{ color: t.accent }}>domain</span> — required
              </div>
              <div>
                <span style={{ color: t.accent }}>style</span> —{" "}
                <Mono>flat</Mono> (default), <Mono>plastic</Mono>,{" "}
                <Mono>minimal</Mono>
              </div>
              <div>
                <span style={{ color: t.accent }}>label</span> — left-side text
                (default: "accessibility")
              </div>
            </div>
          </Sec>

          {/* ═══ REFERENCE ═══ */}

          <Sec id="rate-limits" icon={Shield} title="Rate limits">
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.78rem",
                lineHeight: 2.2,
                marginBottom: "0.8rem",
              }}
            >
              <div>Free — 3 scans/month, 1 site</div>
              <div>Starter ($19/mo) — 10 scans/month, 1 site</div>
              <div>
                Pro ($69/mo) — 100 scans/month, unlimited sites, API keys, CI/CD
              </div>
              <div>
                Agency ($249/mo) — unlimited scans, unlimited sites, white-label
                reports
              </div>
            </div>
          </Sec>

          <Sec id="webhooks" icon={Zap} title="Realtime events">
            <P>Use Supabase Realtime to listen for scan completions:</P>
            <CodeBlock
              lang="javascript"
              code={`supabase.channel("scans")
  .on("postgres_changes", {
    event: "*", schema: "public", table: "scans",
    filter: \`site_id=eq.\${siteId}\`,
  }, (payload) => {
    if (payload.new.status === "complete") {
      console.log("Score:", payload.new.score);
    }
  }).subscribe();`}
            />
            <P>
              Slack and email alerts fire automatically after every scan —
              configure in Settings.
            </P>
          </Sec>
        </main>
      </div>
    </div>
  );
}
