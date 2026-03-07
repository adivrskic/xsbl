// Icons are referenced by lucide-react component name strings.
// Components import the actual icons from lucide-react and map these strings.

export const howSteps = [
  {
    n: "1",
    title: "Enter your URL",
    desc: "Paste any live URL — we scan the rendered page in a real browser, analyzing every element against WCAG 2.2. No install, no code access needed.",
    tag: "Free to try",
  },
  {
    n: "2",
    title: "See every issue",
    desc: "Get a detailed breakdown of accessibility violations — missing alt text, contrast failures, broken ARIA, keyboard traps — organized by severity and WCAG criterion.",
    tag: "Powered by axe-core + AI",
  },
  {
    n: "3",
    title: "Get fix suggestions",
    desc: "Each issue comes with an AI-generated code fix specific to your markup. Copy the snippet, paste it in your code, and the issue is resolved. No guesswork.",
    tag: "Contextual fixes",
  },
];

export const scanFeatures = [
  {
    title: "Full-page rendering",
    desc: "We scan the actual rendered DOM in a real Chromium browser — catching issues in SPAs, lazy-loaded content, and dynamic UI that static analyzers miss.",
    icon: "Globe",
  },
  {
    title: "WCAG 2.2 AA + AAA",
    desc: "90+ rules covering contrast, alt text, ARIA, keyboard navigation, forms, headings, landmarks, and more. Mapped to specific WCAG success criteria.",
    icon: "ShieldCheck",
  },
  {
    title: "AI fix suggestions",
    desc: "Not just 'add an alt attribute' — contextual code snippets that fit your actual markup. Copy, paste, done.",
    icon: "Lightbulb",
  },
  {
    title: "Continuous monitoring",
    desc: "Verify your domain, set a schedule, and we rescan daily or weekly. Get alerted when new issues appear after a deploy.",
    icon: "Clock",
  },
  {
    title: "Score tracking",
    desc: "Track your accessibility score over time. See trends per page and per site. Know if you're getting better or worse.",
    icon: "BarChart3",
  },
  {
    title: "Per-page breakdown",
    desc: "Don't just see a site-wide number — drill into each page to find exactly where the worst issues live.",
    icon: "FileText",
  },
  {
    title: "AI-generated alt text",
    desc: "Vision AI describes your images in context — not generic labels, but descriptions that make sense for your specific product.",
    icon: "Image",
  },
  {
    title: "Slack & email alerts",
    desc: "Get notified when scans complete, new critical issues are found, or your score changes significantly.",
    icon: "Bell",
  },
];

export const complianceFeatures = [
  {
    title: "VPAT generation",
    desc: "Auto-generate Voluntary Product Accessibility Templates from scan results — ready for procurement teams.",
    icon: "ClipboardList",
  },
  {
    title: "Audit log",
    desc: "Timestamped history of every scan, fix, and review. Exportable evidence of ongoing accessibility compliance.",
    icon: "ScrollText",
  },
  {
    title: "White-label reports",
    desc: "Branded PDF reports for client deliverables. Your logo, your colors, professional compliance documentation.",
    icon: "FileText",
  },
  {
    title: "SOC 2 / ISO evidence",
    desc: "Exportable artifacts proving continuous accessibility monitoring — ready for your next compliance audit.",
    icon: "BadgeCheck",
  },
];

export const pricingPlans = [
  {
    tier: "Free",
    price: 0,
    blurb: "Try it out. No credit card needed.",
    popular: false,
    features: [
      "1 site monitored",
      "3 scans per month",
      "Basic issue list",
      "WCAG 2.2 AA scanning",
      "10 AI fix suggestions / mo",
      "1 GitHub PR / mo",
      "Community support",
    ],
    cta: "Get started",
  },
  {
    tier: "Starter",
    price: 19,
    blurb: "For indie devs and personal projects.",
    popular: false,
    features: [
      "1 site monitored",
      "10 scans per month",
      "50 AI fix suggestions / mo",
      "5 GitHub PRs / mo (5 issues/PR)",
      "Accessibility score badge",
      "Simulator preview",
      "Email support",
    ],
    cta: "Start trial",
  },
  {
    tier: "Pro",
    price: 69,
    blurb: "For teams shipping accessible products.",
    popular: true,
    features: [
      "Unlimited sites",
      "100 scans per month",
      "200 AI suggestions / mo",
      "25 GitHub PRs / mo (10 issues/PR)",
      "Accessibility simulator",
      "Scheduled daily/weekly scans",
      "AI alt text generation",
      "Score trends & per-page breakdown",
      "Slack & email alerts",
      "PDF compliance reports",
      "WCAG 2.2 AA + AAA",
    ],
    cta: "Start trial",
  },
  {
    tier: "Agency",
    price: 249,
    blurb: "For agencies managing client accessibility.",
    popular: false,
    features: [
      "Everything in Pro",
      "Unlimited AI suggestions",
      "Unlimited GitHub PRs (20 issues/PR)",
      "Accessibility simulator",
      "Client-facing read-only dashboards",
      "Scheduled PDF reports to clients",
      "Custom scan profiles per client",
      "Multi-org client dashboard",
      "White-label PDF reports",
      "VPAT document generation",
      "Compliance audit log",
      "SOC 2 / ISO evidence export",
      "API access",
      "Dedicated account manager",
    ],
    cta: "Contact sales",
  },
];

export const vsOverlay = {
  bad: [
    "JavaScript injection — never touches the real problem",
    "Automated overlays detect only ~30% of WCAG issues",
    "Actively breaks screen readers and assistive tech",
    "Courts reject overlays as compliance evidence",
    "$490–$3,990/yr and you still get sued",
    "FTC fined the market leader $1M for misleading claims",
  ],
  good: [
    "Scans your actual rendered pages in a real browser",
    "90+ rules covering WCAG 2.2 AA and AAA criteria",
    "AI-generated fix suggestions specific to your markup",
    "Dashboard tracks scores and issues over time",
    "Works with screen readers, not against them",
    "Exportable compliance evidence for audits and procurement",
  ],
};

export const codeLines = [
  { type: "comment", text: "{/* before: inaccessible */}" },
  { type: "del", text: "<img src={product.img} />" },
  { type: "add", text: "<img src={product.img}" },
  { type: "add", text: "     alt={`${product.name} — ${product.color}`}" },
  { type: "add", text: '     loading="lazy" />' },
  { type: "blank" },
  { type: "del", text: "<div onClick={handleBuy}>Buy</div>" },
  { type: "add", text: "<button" },
  { type: "add", text: "  onClick={handleBuy}" },
  { type: "add", text: "  aria-label={`Add ${product.name} to cart`}" },
  { type: "add", text: ">Buy</button>" },
  { type: "blank" },
  { type: "del", text: "<p style={{color: '#bbb'}}>In stock</p>" },
  { type: "add", text: "<p style={{color: '#595959'}}>In stock</p>" },
  { type: "comment", text: "{/* contrast 4.56:1 → WCAG AA ✓ */}" },
];

export const marqueeItems = [
  "No bull, just fixes",
  "Keep it xsbl",
  "WCAG 2.2 AA + AAA",
  "Bulk fix issues in one PR",
  "AI reads your actual source code",
  "Not an overlay",
  "Real fixes, not band-aids",
  "Overlays got fined $1M by the FTC",
];

export const navLinks = [
  { label: "How it works", id: "how" },
  { label: "Features", id: "agent" },
  { label: "GitHub PRs", id: "github" },
  { label: "Pricing", id: "pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
];

export const footerLinks = [
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "GitHub", href: "https://github.com/adivrskic/xsbl" },
  { label: "Contact", href: "/contact" },
];
