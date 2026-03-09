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
  List,
  ChevronUp,
  Clock,
  Users,
  Monitor,
  Settings,
  Download,
  Palette,
} from "lucide-react";
import { Link } from "react-router-dom";
import FadeIn from "../components/landing/FadeIn";
import "../styles/docs.css";

function CodeBlock({ code, lang }) {
  var [copied, setCopied] = useState(false);
  var handleCopy = function () {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };
  return (
    <div className="docs-code-block">
      <div className="docs-code-block__bar">
        <span className="docs-code-block__lang">{lang}</span>
        <button
          onClick={handleCopy}
          className={
            "docs-code-block__copy" +
            (copied ? " docs-code-block__copy--copied" : "")
          }
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        >
          <span aria-live="polite">{copied ? "copied!" : "copy"}</span>
        </button>
      </div>
      <pre aria-label={lang + " code example"}>{code}</pre>
    </div>
  );
}

function Sec({ id, icon: Icon, title, children }) {
  var { t } = useTheme();
  return (
    <section id={id} className="docs-section">
      <FadeIn>
        <div className="docs-section__header">
          <Icon size={20} color={t.accent} strokeWidth={1.8} />
          <h2 className="docs-section__title">{title}</h2>
        </div>
      </FadeIn>
      <FadeIn delay={0.05}>
        <div className="docs-section__body">{children}</div>
      </FadeIn>
    </section>
  );
}

function Note({ children }) {
  return <div className="docs-note">{children}</div>;
}

function Mono({ children }) {
  return <code className="docs-mono">{children}</code>;
}

var sidebar = [
  { id: "getting-started", label: "Getting started", group: "Guides" },
  { id: "scheduled-scans", label: "Scheduled scans", group: "Guides" },
  { id: "github-setup", label: "GitHub integration", group: "Guides" },
  { id: "cicd", label: "CI/CD (GitHub Actions)", group: "Guides" },
  { id: "slack-email", label: "Slack & email alerts", group: "Guides" },
  { id: "team-management", label: "Team management", group: "Guides" },
  { id: "simulator", label: "Accessibility simulator", group: "Guides" },
  { id: "status-page", label: "Public status page", group: "Guides" },
  { id: "client-dashboards", label: "Client dashboards", group: "Agency" },
  { id: "white-label", label: "White-label reports", group: "Agency" },
  { id: "scan-profiles", label: "Custom scan profiles", group: "Agency" },
  { id: "evidence-export", label: "Evidence export", group: "Agency" },
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
  var { t } = useTheme();
  var [activeSection, setActiveSection] = useState("getting-started");
  var [tocOpen, setTocOpen] = useState(false);
  var activeSectionRef = useRef(activeSection);
  var isClickScrolling = useRef(false);

  // Scroll spy using IntersectionObserver
  useEffect(function () {
    var sectionIds = sidebar.map(function (s) {
      return s.id;
    });
    var visibleSections = {};

    var observer = new IntersectionObserver(
      function (entries) {
        if (isClickScrolling.current) return;
        entries.forEach(function (entry) {
          visibleSections[entry.target.id] = entry.isIntersecting;
        });
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
      { rootMargin: "-88px 0px -60% 0px", threshold: 0 }
    );

    sectionIds.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return function () {
      observer.disconnect();
    };
  }, []);

  // When scrolled to bottom, select the last section
  useEffect(function () {
    var sectionIds = sidebar.map(function (s) {
      return s.id;
    });
    var lastId = sectionIds[sectionIds.length - 1];

    var handleScroll = function () {
      if (isClickScrolling.current) return;
      var atBottom =
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 40;
      if (atBottom && activeSectionRef.current !== lastId) {
        activeSectionRef.current = lastId;
        setActiveSection(lastId);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return function () {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  var scrollTo = function (id) {
    isClickScrolling.current = true;
    activeSectionRef.current = id;
    setActiveSection(id);
    setTocOpen(false);

    // Delay to let TOC collapse before calculating scroll position
    setTimeout(function () {
      var el = document.getElementById(id);
      if (el) {
        var isMobile = window.innerWidth <= 768;
        var navH = 64;
        var offset;

        if (isMobile) {
          // On mobile, sidebar is sticky above content — measure its collapsed height
          var sidebarEl = document.querySelector(".docs-sidebar");
          var sidebarH = sidebarEl
            ? sidebarEl.getBoundingClientRect().height
            : 48;
          offset = navH + sidebarH + 12;
        } else {
          // On desktop, sidebar is alongside — only nav offset needed
          offset = navH + 24;
        }

        var top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });

        var heading = el.querySelector("h2");
        if (heading) {
          heading.setAttribute("tabindex", "-1");
          heading.focus({ preventScroll: true });
        }
      }
      setTimeout(function () {
        isClickScrolling.current = false;
      }, 800);
    }, 100);
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

  var BASE =
    import.meta.env.VITE_SUPABASE_URL || "https://YOUR_PROJECT.supabase.co";

  return (
    <div>
      <div className="docs-page">
        {/* Sidebar navigation */}
        <aside className="docs-sidebar">
          {/* Mobile TOC toggle */}
          <button
            className="docs-toc-toggle"
            onClick={function () {
              setTocOpen(!tocOpen);
            }}
            aria-expanded={tocOpen}
            aria-controls="docs-toc-nav"
          >
            {tocOpen ? <ChevronUp size={16} /> : <List size={16} />}
            <span>{tocOpen ? "Hide" : "On this page"}</span>
            <span className="docs-toc-toggle__active">
              {
                sidebar.find(function (s) {
                  return s.id === activeSection;
                })?.label
              }
            </span>
          </button>

          <nav
            id="docs-toc-nav"
            className={"docs-toc-nav" + (tocOpen ? " docs-toc-nav--open" : "")}
            aria-label="Documentation sections"
          >
            {groups.map(function (g) {
              return (
                <div key={g.name} className="docs-sidebar__group">
                  <div className="docs-sidebar__group-label">{g.name}</div>
                  <div className="docs-sidebar__links" role="list">
                    {g.items.map(function (item) {
                      var isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          role="listitem"
                          onClick={function () {
                            scrollTo(item.id);
                          }}
                          className={
                            "docs-sidebar__link" +
                            (isActive ? " docs-sidebar__link--active" : "")
                          }
                          aria-current={isActive ? "true" : undefined}
                        >
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </aside>

        <main className="docs-main">
          <FadeIn>
            <div className="docs-header">
              <div className="docs-header__eyebrow">
                <span
                  className="docs-header__eyebrow-line"
                  aria-hidden="true"
                />
                Documentation
              </div>
              <h1 className="docs-header__title">xsbl Docs</h1>
              <p>
                Guides, API reference, and integration setup for xsbl
                accessibility scanning.
              </p>
            </div>
          </FadeIn>

          {/* ═══ GUIDES ═══ */}

          <Sec id="getting-started" icon={Book} title="Getting started">
            <p>
              xsbl scans websites for WCAG 2.2 accessibility violations using
              axe-core in a real browser. Here are the main ways to use it:
            </p>
            <p>
              <strong>1. Dashboard</strong> — add sites, run scans, view issues,
              and generate reports at{" "}
              <Link to="/dashboard">xsbl.io/dashboard</Link>.
            </p>
            <p>
              <strong>2. Scheduled scans</strong> — set daily or weekly scans
              per site and get alerted when new issues appear after a deploy.
            </p>
            <p>
              <strong>3. GitHub integration</strong> — connect your repo, select
              issues, and xsbl creates a pull request with AI-generated code
              fixes.
            </p>
            <p>
              <strong>4. API & CI/CD</strong> — trigger scans from your
              deployment pipeline using API keys.
            </p>
            <Note>
              All plans include the dashboard and manual scanning. Scheduled
              scans require Starter or above. GitHub PRs, API keys, and CI/CD
              require Pro or Agency.
            </Note>
            <p>
              <strong>Verify your site</strong> to unlock scheduled scans and
              compliance reports. Go to your site → the verification banner at
              the top. Choose DNS (add a TXT record), Meta tag (add a meta tag
              to your HTML), or File upload (host a verification file). Click
              "Verify" once done.
            </p>
          </Sec>

          <Sec id="scheduled-scans" icon={Clock} title="Scheduled scans">
            <p>
              Automate scanning on a daily or weekly schedule. Available on
              Starter, Pro, and Agency plans.
            </p>
            <p>
              Go to any site → Settings tab → Scan Schedule. Choose daily or
              weekly and select the hour (UTC) you want scans to run.
            </p>
            <Note>
              Scheduled scans count toward your monthly scan limit. Free plans
              are limited to manual scans only.
            </Note>
            <p>
              After each scheduled scan, xsbl automatically sends alerts (Slack
              and email) if configured, and auto-resolves issues that no longer
              appear in the results.
            </p>
            <p>
              The site overview shows the time of the last scheduled scan and
              when the next one is due. Your time zone is displayed alongside
              the UTC hour for reference.
            </p>
          </Sec>

          <Sec id="github-setup" icon={GitBranch} title="GitHub integration">
            <p>
              Connect a GitHub repo to enable one-click PR creation for
              accessibility fixes.
            </p>
            <p>
              <strong>Step 1:</strong> Go to your site → Settings → GitHub
              Integration.
            </p>
            <p>
              <strong>Step 2:</strong> Enter your repo (e.g.{" "}
              <Mono>acme/website</Mono>) and a Personal Access Token with{" "}
              <Mono>repo</Mono> scope.
            </p>
            <p>
              <strong>Step 3:</strong> Click Test to verify, then Save.
            </p>
            <Note>
              Create a token at{" "}
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=xsbl-fixes"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/settings/tokens
              </a>{" "}
              — select the "repo" scope.
            </Note>
            <p>
              <strong>Single fix:</strong> Open any issue → click "Create fix
              PR" → xsbl reads your source code, generates a fix with AI, and
              opens a PR.
            </p>
            <p>
              <strong>Bulk fix:</strong> On the Issues tab, check multiple
              issues (or use quick-select buttons like "All critical"), then
              click "Create fix PR" in the floating bar. One PR with all fixes.
            </p>
            <p>
              <strong>How file discovery works:</strong> xsbl fetches your
              repo's file tree, scores files by relevance (matching page URLs to
              file names, component names, CSS selectors), fetches the top
              source files, sends them to our AI along with the issues, and
              commits the fixed files to a new branch.
            </p>
          </Sec>

          <Sec id="cicd" icon={Terminal} title="CI/CD (GitHub Actions)">
            <p>Run accessibility scans automatically after every deploy.</p>
            <p>
              <strong>Step 1:</strong> Create an API key in Settings → API Keys
              (Pro or Agency required).
            </p>
            <p>
              <strong>Step 2:</strong> Add repository secrets in GitHub:
            </p>
            <div className="docs-param-list">
              <div>
                <span className="docs-param-list__key">XSBL_API_KEY</span> —
                your API key
              </div>
              <div>
                <span className="docs-param-list__key">XSBL_SITE_ID</span> —
                your site UUID (from the URL in the dashboard)
              </div>
            </div>
            <p>
              <strong>Step 3:</strong> Add this workflow file to your repo:
            </p>
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
            <p>
              The scan results appear in the GitHub Step Summary on every run.
              Uncomment the last line to fail builds when the score drops below
              your threshold.
            </p>
          </Sec>

          <Sec id="slack-email" icon={Bell} title="Slack & email alerts">
            <p>Get notified after every scan completes.</p>
            <p>
              <strong>Slack:</strong> Go to Settings → Alert Integrations →
              paste your Slack webhook URL → click Test. You'll get a rich
              message with score, issues, and a dashboard link.
            </p>
            <Note>
              Create a webhook at{" "}
              <a
                href="https://api.slack.com/messaging/webhooks"
                target="_blank"
                rel="noopener noreferrer"
              >
                api.slack.com/messaging/webhooks
              </a>
            </Note>
            <p>
              <strong>Email:</strong> Add email addresses in Settings → Alert
              Integrations, or leave blank to use team members' addresses based
              on their notification preferences.
            </p>
          </Sec>

          <Sec id="team-management" icon={Users} title="Team management">
            <p>
              Invite team members from Settings → Team. Enter their email and
              choose a role:
            </p>
            <p>
              <strong>Owner</strong> — full access including billing and account
              deletion. One per workspace.
            </p>
            <p>
              <strong>Admin</strong> — can manage sites, settings, and team
              members. Cannot change billing or delete the account.
            </p>
            <p>
              <strong>Member</strong> — can run scans, view issues, and create
              fix PRs. Cannot change settings or manage the team.
            </p>
            <Note>
              If the invitee already has an xsbl account, they're added
              immediately. Otherwise they receive an email invite and are added
              automatically when they sign up with that email address.
            </Note>
          </Sec>

          <Sec id="simulator" icon={Monitor} title="Accessibility simulator">
            <p>
              The simulator shows how your site appears under different vision
              conditions. Available on Pro and Agency plans.
            </p>
            <p>
              Go to any site → Simulator tab → select a condition. The simulator
              takes a real screenshot of your site and applies scientifically
              accurate filters for:
            </p>
            <p>
              Protanopia (red-blind), Deuteranopia (green-blind), Tritanopia
              (blue-blind), Achromatopsia (total color blindness), Low vision,
              Cataracts, Glaucoma, and Macular degeneration.
            </p>
            <p>
              Use these screenshots in client presentations and reports to
              demonstrate why accessibility matters.
            </p>
          </Sec>

          <Sec id="status-page" icon={Globe} title="Public status page">
            <p>
              Enable a public accessibility status page for your organization.
              Go to Settings → General → toggle "Public status page."
            </p>
            <p>
              Your status page lives at{" "}
              <Mono>xsbl.io/status/your-org-slug</Mono> and shows all verified
              sites with their current scores. It updates automatically after
              each scan.
            </p>
            <p>
              Link it from your site's footer to demonstrate your commitment to
              accessibility. Only verified sites appear on the status page.
            </p>
          </Sec>

          {/* ═══ AGENCY ═══ */}

          <Sec
            id="client-dashboards"
            icon={Users}
            title="Client dashboards (Agency)"
          >
            <p>
              Give clients read-only access to their sites without sharing your
              full dashboard. Agency plan only.
            </p>
            <p>
              <strong>Invite a client:</strong> Go to Settings → Integrations →
              Client Access → enter their email and select which sites they can
              see. They receive an invite link with a unique access token.
            </p>
            <p>
              Clients see their assigned sites, scores, issues, and reports —
              but cannot trigger scans, change settings, or see other clients'
              data.
            </p>
            <Note>
              Clients don't need an xsbl account. They access their dashboard
              via a unique token URL. You can revoke access at any time.
            </Note>
          </Sec>

          <Sec
            id="white-label"
            icon={Palette}
            title="White-label reports (Agency)"
          >
            <p>
              Replace xsbl branding with your company name on all client-facing
              reports. Agency plan only.
            </p>
            <p>
              Go to Settings → Integrations → Scheduled Reports. Enable
              white-label, enter your company name, add recipient emails, and
              set the delivery schedule (weekly or monthly).
            </p>
            <p>
              Reports include the overall score, per-page breakdowns, top issues
              with severity and WCAG criteria, and remediation guidance — all
              under your brand.
            </p>
          </Sec>

          <Sec
            id="scan-profiles"
            icon={Settings}
            title="Custom scan profiles (Agency)"
          >
            <p>Customize what gets scanned per site. Agency plan only.</p>
            <p>Go to any site → Settings → Scan Profile. You can:</p>
            <p>
              <strong>Exclude rules</strong> — skip specific axe-core rules that
              aren't relevant (e.g. rules for content you don't control).
            </p>
            <p>
              <strong>Exclude selectors</strong> — skip specific page elements
              like third-party widgets, chat bubbles, or ad containers.
            </p>
            <p>
              <strong>Toggle best practices</strong> — include or exclude
              best-practice checks that go beyond WCAG requirements.
            </p>
            <Note>
              Scan profiles persist across all scans (manual and scheduled) for
              that site.
            </Note>
          </Sec>

          <Sec
            id="evidence-export"
            icon={Download}
            title="Evidence export (Agency)"
          >
            <p>
              Export structured compliance evidence for SOC 2, ISO 27001, and
              HIPAA audits. Agency plan only.
            </p>
            <p>
              Go to Dashboard → Evidence Export. Select a framework, date range,
              and which sections to include:
            </p>
            <p>
              <strong>Vulnerability management</strong> — open/fixed issues,
              severity breakdown, remediation timelines.
            </p>
            <p>
              <strong>Access control</strong> — team members, roles, access
              change history.
            </p>
            <p>
              <strong>Change management</strong> — pull requests created, files
              changed, approval status.
            </p>
            <p>
              <strong>Monitoring</strong> — scan history, scheduled scan
              configuration, scan completion rates.
            </p>
            <p>
              <strong>Asset inventory</strong> — all monitored sites with
              scores, scan schedules, and GitHub connections.
            </p>
            <p>
              Export as JSON for programmatic use or CSV for spreadsheet review.
              Evidence packages are timestamped and include full metadata.
            </p>
          </Sec>

          {/* ═══ API REFERENCE ═══ */}

          <Sec id="api-keys" icon={Key} title="API keys">
            <p>
              API keys let you authenticate without a user session. Available on
              Pro and Agency.
            </p>
            <p>
              Create keys in Settings → API Keys. Each key is shown once — copy
              it immediately.
            </p>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/scan-site \\
  -H "Authorization: Bearer xsbl_your_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "your-site-uuid"}'`}
            />
            <p>
              Keys are prefixed with <Mono>xsbl_</Mono>, 45 characters. Max 5
              active keys per org.
            </p>
          </Sec>

          <Sec id="quick-scan-api" icon={Zap} title="Quick scan (public)">
            <p>Scan any URL without authentication.</p>
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
            <p>Trigger a multi-page scan. Returns results synchronously.</p>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/scan-site \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "uuid"}'`}
            />
            <p>Pass specific URLs to scan only certain pages:</p>
            <CodeBlock
              lang="json"
              code={`{ "site_id": "uuid", "urls": ["https://example.com/", "https://example.com/about"] }`}
            />
            <p>
              <strong>Page limits:</strong> Free: 5, Starter: 10, Pro: 25,
              Agency: 50
            </p>
          </Sec>

          <Sec
            id="bulk-fix-api"
            icon={GitBranch}
            title="Bulk fix PR (authenticated)"
          >
            <p>
              Create a single PR fixing multiple issues. Requires GitHub
              connected on the site.
            </p>
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
            <p>
              Generate an HTML compliance report (VPAT format). Print to PDF
              from the browser.
            </p>
            <CodeBlock
              lang="bash"
              code={`curl -X POST ${BASE}/functions/v1/generate-report \\
  -H "Authorization: Bearer YOUR_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"site_id": "uuid", "format": "html"}'`}
            />
            <p>
              Use <Mono>format: "json"</Mono> for raw data export.
            </p>
          </Sec>

          <Sec
            id="alt-text-api"
            icon={Eye}
            title="Alt text generation (authenticated)"
          >
            <p>Send an image URL and get AI-generated alt text.</p>
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
            <p>Supports JPEG, PNG, GIF, WebP, and SVG. Max 5MB.</p>
          </Sec>

          <Sec id="check-usage-api" icon={Code} title="Usage (authenticated)">
            <p>Check current billing period usage:</p>
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
            <p>Embed a dynamic accessibility score badge.</p>
            <CodeBlock
              lang="markdown"
              code={`![accessibility](${BASE}/functions/v1/badge?domain=example.com)`}
            />
            <div className="docs-param-list">
              <div>
                <span className="docs-param-list__key">domain</span> — required
              </div>
              <div>
                <span className="docs-param-list__key">style</span> —{" "}
                <Mono>flat</Mono> (default), <Mono>plastic</Mono>,{" "}
                <Mono>minimal</Mono>
              </div>
              <div>
                <span className="docs-param-list__key">label</span> — left-side
                text (default: "accessibility")
              </div>
            </div>
          </Sec>

          {/* ═══ REFERENCE ═══ */}

          <Sec id="rate-limits" icon={Shield} title="Rate limits">
            <div className="docs-param-list">
              <div>
                Free — 3 scans/month, 1 site, 10 AI suggestions, 1 GitHub PR
              </div>
              <div>
                Starter ($19/mo) — 10 scans/month, 1 site, 50 AI suggestions, 5
                GitHub PRs
              </div>
              <div>
                Pro ($69/mo) — 100 scans/month, unlimited sites, 200 AI
                suggestions, 25 GitHub PRs, API keys, CI/CD
              </div>
              <div>
                Agency ($249/mo) — 999 scans/month, unlimited sites, unlimited
                AI suggestions, unlimited GitHub PRs, white-label reports,
                client dashboards
              </div>
            </div>
            <p>
              Scan limits reset on the 1st of each month. AI suggestion and
              GitHub PR limits also reset monthly.
            </p>
          </Sec>

          <Sec id="webhooks" icon={Zap} title="Realtime events">
            <p>Use Supabase Realtime to listen for scan completions:</p>
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
            <p>
              Slack and email alerts fire automatically after every scan —
              configure in Settings.
            </p>
          </Sec>
        </main>
      </div>
    </div>
  );
}
