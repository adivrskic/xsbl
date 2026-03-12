/**
 * changelog.js — Product release notes for /changelog.
 *
 * Each entry: { version, date, title, type, items[] }
 * type: "major" | "minor" | "patch"
 * items[]: { text, tag? } where tag is "new" | "improved" | "fixed" | "breaking"
 */

export var changelog = [
  {
    version: "1.8.0",
    date: "2026-03-10",
    title: "Bulk scan, command palette & scan diffs",
    type: "major",
    items: [
      {
        text: "Bulk scan import from CSV, sitemap URL, or pasted list",
        tag: "new",
      },
      {
        text: "Command palette (⌘K) — search sites, navigate pages, trigger scans",
        tag: "new",
      },
      {
        text: "Scan diff badges in the issues tab — see which issues are new since last scan",
        tag: "new",
      },
      {
        text: "Team comments on issues — threaded annotations with @-mentions",
        tag: "new",
      },
      {
        text: "Custom ignore rules — suppress recurring false positives per site",
        tag: "new",
      },
      {
        text: "Score regression alerts — email when any site drops below a threshold",
        tag: "new",
      },
      {
        text: "Accessibility statement generator with live preview and markdown export",
        tag: "new",
      },
      { text: "Quick actions banner after scan completes", tag: "improved" },
      {
        text: "Relative timestamps throughout the dashboard with absolute tooltips",
        tag: "improved",
      },
      {
        text: "Issue count in browser tab title when viewing the issues tab",
        tag: "improved",
      },
      { text: "Score badge embed is now free on all plans", tag: "improved" },
    ],
  },
  {
    version: "1.7.0",
    date: "2026-02-24",
    title: "WCAG reference pages & SEO infrastructure",
    type: "major",
    items: [
      {
        text: "13 programmatic WCAG 2.2 criterion pages with educational content, common failures, and fix guidance",
        tag: "new",
      },
      {
        text: "Sitemap.xml and RSS feed auto-generated at build time",
        tag: "new",
      },
      { text: "Structured data (ld+json) on blog and WCAG pages", tag: "new" },
      {
        text: "Weekly digest email preview in notification settings",
        tag: "new",
      },
      { text: "Dashboard activity feed on the overview page", tag: "new" },
      {
        text: "Per-route meta tags and Open Graph images via useDocumentMeta",
        tag: "improved",
      },
    ],
  },
  {
    version: "1.6.0",
    date: "2026-02-10",
    title: "Multi-page scanning & GitHub integration",
    type: "major",
    items: [
      {
        text: "Full multi-page scanning: sitemap discovery → link crawling → per-page axe-core analysis",
        tag: "new",
      },
      {
        text: "Scheduled scans now run the same multi-page flow as manual scans",
        tag: "fixed",
      },
      {
        text: "Create GitHub Issues directly from accessibility findings (single or bulk)",
        tag: "new",
      },
      {
        text: "Scan comparison modal — diff two scans side-by-side with categorized changes",
        tag: "new",
      },
      {
        text: "Page breakdown component showing per-URL scores and issue counts",
        tag: "new",
      },
      {
        text: "CI/CD workflow integration panel for GitHub Actions",
        tag: "new",
      },
      {
        text: "Real-time scan progress with pages scanned and issues found counters",
        tag: "improved",
      },
    ],
  },
  {
    version: "1.5.0",
    date: "2026-01-27",
    title: "AI fix suggestions & accessibility simulator",
    type: "major",
    items: [
      {
        text: "AI-powered fix suggestions for every issue using Claude",
        tag: "new",
      },
      {
        text: "Accessibility simulator — preview your site through different impairments",
        tag: "new",
      },
      {
        text: "Alt text generator for images missing alt attributes",
        tag: "new",
      },
      {
        text: "Quick-wins sort mode — prioritizes fixable high-impact issues",
        tag: "new",
      },
      {
        text: "Agency plan with custom scan profiles, client dashboards, and scheduled reports",
        tag: "new",
      },
      {
        text: "Score explainer modal showing how the score is calculated",
        tag: "improved",
      },
    ],
  },
  {
    version: "1.4.0",
    date: "2026-01-13",
    title: "Email alerts & dark mode",
    type: "major",
    items: [
      {
        text: "Scan complete email notifications with score card and issue breakdown",
        tag: "new",
      },
      {
        text: "Critical issues alert emails with separate recipient targeting",
        tag: "new",
      },
      { text: "Weekly digest emails with site overview table", tag: "new" },
      { text: "Dark mode with OS detection and manual toggle", tag: "new" },
      {
        text: "Notification preferences per user (scan complete, critical issues, weekly digest)",
        tag: "new",
      },
      { text: "Slack webhook integration for scan alerts", tag: "new" },
    ],
  },
  {
    version: "1.3.0",
    date: "2025-12-30",
    title: "Dashboard & issue management",
    type: "major",
    items: [
      {
        text: "Full dashboard with sites, scans, and issue management",
        tag: "new",
      },
      {
        text: "Issue detail modal with selector, element HTML, WCAG tags, and status management",
        tag: "new",
      },
      {
        text: "Create fix PRs from accessibility issues via Browserless + GitHub API",
        tag: "new",
      },
      {
        text: "Grouped issue views (by rule, by page, flat) with severity sorting",
        tag: "new",
      },
      {
        text: "Audit log tracking all actions across the workspace",
        tag: "new",
      },
      { text: "Team member invites with role-based access", tag: "new" },
    ],
  },
  {
    version: "1.2.0",
    date: "2025-12-16",
    title: "Scan scheduling & verification",
    type: "minor",
    items: [
      {
        text: "Daily and weekly scan scheduling with configurable hour (UTC)",
        tag: "new",
      },
      { text: "Site verification via DNS TXT record or meta tag", tag: "new" },
      {
        text: "Auto-resolve: issues not found in latest scan are automatically marked as removed",
        tag: "new",
      },
      {
        text: "Public status pages at /status/{slug} showing live score and issue breakdown",
        tag: "new",
      },
      { text: "Plan-based scan limits with usage tracking", tag: "improved" },
    ],
  },
  {
    version: "1.1.0",
    date: "2025-12-02",
    title: "Free quick scan & lead capture",
    type: "minor",
    items: [
      {
        text: "Homepage quick scan — enter any URL, get a score and issue preview without signing up",
        tag: "new",
      },
      {
        text: "Email capture with full accessibility report delivered via Resend",
        tag: "new",
      },
      {
        text: "Pre-flight URL validation (DNS, HTTP, Cloudflare detection) before browser launch",
        tag: "improved",
      },
      {
        text: "Chrome error page detection to avoid false scan results",
        tag: "fixed",
      },
    ],
  },
  {
    version: "1.0.0",
    date: "2025-11-18",
    title: "Initial launch",
    type: "major",
    items: [
      {
        text: "axe-core scanning in a real Chromium browser via Browserless",
        tag: "new",
      },
      {
        text: "WCAG 2.2 Level AA + AAA testing with all success criteria",
        tag: "new",
      },
      {
        text: "Supabase auth with email/password and OAuth (Google, GitHub)",
        tag: "new",
      },
      {
        text: "Four pricing tiers: Free, Starter ($19), Pro ($69), Agency ($249)",
        tag: "new",
      },
      {
        text: "Landing page with hero scanner, feature sections, pricing, and FAQ",
        tag: "new",
      },
    ],
  },
];
