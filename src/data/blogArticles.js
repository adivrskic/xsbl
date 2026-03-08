export var blogArticles = [
  {
    slug: "why-web-accessibility-matters",
    title: "Why Web Accessibility Matters More Than You Think",
    subtitle:
      "1.3 billion people live with disabilities. If your website isn't accessible, you're excluding 16% of the world.",
    date: "2026-02-28",
    readTime: "6 min",
    category: "Accessibility",
    featured: true,
    body: [
      {
        type: "p",
        text: "Web accessibility isn't a nice-to-have. It's a fundamental requirement for any product that serves the public. One in six people globally — 1.3 billion — live with a significant disability. That includes people who are blind, deaf, have motor impairments, cognitive disabilities, or temporary conditions like a broken arm.",
      },
      {
        type: "p",
        text: "When your website isn't accessible, you're not just failing a compliance checkbox. You're actively preventing real people from using your product, buying your services, or accessing information they need.",
      },
      { type: "h2", text: "The business case" },
      {
        type: "p",
        text: "Beyond ethics, the numbers are stark. The disposable income of people with disabilities is estimated at $1.2 trillion annually in the US alone. Inaccessible websites lose customers — and increasingly, face lawsuits. Over 4,000 ADA web accessibility lawsuits were filed in the US in 2023, up from just 814 in 2017.",
      },
      {
        type: "p",
        text: "Companies like Domino's, Beyoncé's Parkwood Entertainment, and Nike have all faced high-profile accessibility lawsuits. The legal landscape is clear: if your website is inaccessible, you're a target.",
      },
      { type: "h2", text: "What makes a website accessible?" },
      {
        type: "p",
        text: "The Web Content Accessibility Guidelines (WCAG) 2.2 define four principles: perceivable, operable, understandable, and robust. In practice, this means things like providing alt text for images so screen readers can describe them, ensuring sufficient color contrast so text is readable, making all functionality available via keyboard for people who can't use a mouse, and using proper heading hierarchy so screen readers can navigate the page structure.",
      },
      {
        type: "p",
        text: "Most accessibility issues are straightforward to fix — they're just easy to overlook if you're not testing for them. That's why automated scanning tools like xsbl exist: to catch the issues your team might miss before they become problems.",
      },
      { type: "h2", text: "Getting started" },
      {
        type: "p",
        text: "The best time to start caring about accessibility was when you built your website. The second best time is now. Start with an automated scan to understand your baseline, fix the critical and serious issues first, and build accessibility checks into your development workflow so new issues don't slip through.",
      },
    ],
  },
  {
    slug: "accessibility-overlays-dont-work",
    title: "Why Accessibility Overlays Don't Work (And What to Do Instead)",
    subtitle:
      "The FTC fined the market leader $1M. Over 600 experts oppose them. Here's what actually works.",
    date: "2026-02-22",
    readTime: "8 min",
    category: "Industry",
    featured: true,
    body: [
      {
        type: "p",
        text: "Accessibility overlays — JavaScript widgets sold by companies like accessiBe, UserWay, and AudioEye — promise to make your website compliant with a single line of code. It sounds too good to be true. That's because it is.",
      },
      { type: "h2", text: "What overlays actually do" },
      {
        type: "p",
        text: "Overlays inject a JavaScript widget into your page that attempts to patch accessibility issues at runtime. They add toolbar buttons for things like font size adjustment, contrast toggles, and reading modes. The pitch is compelling: drop in one script tag, and your website becomes WCAG compliant overnight.",
      },
      {
        type: "p",
        text: "The reality is different. Overlays don't modify your source code. They paper over problems with runtime JavaScript that frequently conflicts with assistive technologies. Screen reader users report that overlays often make sites harder to use, not easier. The National Federation of the Blind has explicitly called out overlay vendors for misleading claims.",
      },
      { type: "h2", text: "The legal reality" },
      {
        type: "p",
        text: "In 2024, the FTC fined accessiBe $1 million for deceptive marketing practices. Over 800 businesses using overlay widgets were sued for ADA violations in 2023 and 2024 — having an overlay installed didn't protect them. Courts have consistently ruled that overlays are not evidence of accessibility compliance.",
      },
      {
        type: "p",
        text: "The Overlay Fact Sheet, signed by over 600 accessibility professionals from organizations including Google, Apple, and Microsoft, states plainly: overlay solutions do not meet the legal requirements for accessibility.",
      },
      { type: "h2", text: "What actually works" },
      {
        type: "p",
        text: "Real accessibility requires fixing your actual source code. There's no shortcut. The good news is that most issues are simple — adding alt text to images, fixing color contrast values, using semantic HTML elements instead of divs, adding proper form labels.",
      },
      {
        type: "p",
        text: "Tools like xsbl scan your codebase, identify the specific issues, and can automatically generate code fixes as pull requests. Instead of masking the problem with a runtime widget, you're improving your actual code. The fixes are permanent, they work with assistive technology instead of against it, and they hold up in court.",
      },
    ],
  },
  {
    slug: "wcag-22-what-developers-need-to-know",
    title: "WCAG 2.2: What Developers Actually Need to Know",
    subtitle:
      "The latest accessibility standard adds 9 new success criteria. Here's what changed and what to fix first.",
    date: "2026-02-15",
    readTime: "7 min",
    category: "Technical",
    body: [
      {
        type: "p",
        text: "WCAG 2.2 was published as a W3C Recommendation in October 2023, replacing WCAG 2.1 as the current standard. It adds 9 new success criteria focused on users with cognitive disabilities, low vision, and mobile devices. If your site targets WCAG 2.1 AA, here's what you need to update.",
      },
      { type: "h2", text: "New in WCAG 2.2" },
      {
        type: "p",
        text: "Focus Not Obscured (2.4.11 AA / 2.4.12 AAA): When an element receives keyboard focus, it must not be entirely hidden behind sticky headers, footers, or modals. At minimum, some part of the focused element must be visible. This is a common issue with sticky navigation bars that cover focused links when tabbing through a page.",
      },
      {
        type: "p",
        text: "Focus Appearance (2.4.13 AAA): Focus indicators must be at least 2px thick and have a contrast ratio of at least 3:1 against the unfocused state. No more barely-visible dotted outlines.",
      },
      {
        type: "p",
        text: "Dragging Movements (2.5.7 AA): Any functionality that uses dragging must also have a single-pointer alternative. Drag-and-drop interfaces need a click-based fallback for users who can't perform drag gestures.",
      },
      {
        type: "p",
        text: "Target Size Minimum (2.5.8 AA): Interactive targets must be at least 24x24 CSS pixels. This replaced the previous AAA-only requirement (44x44px) with a more practical minimum. Inline links in text are exempt.",
      },
      {
        type: "p",
        text: "Consistent Help (3.2.6 A): If your site provides help mechanisms (chat, phone, FAQ links), they must appear in the same relative location across pages. Don't move the help button around.",
      },
      {
        type: "p",
        text: "Redundant Entry (3.3.7 A): Don't ask users to re-enter information they've already provided in the same process. If they typed their address on step 1, auto-fill it on step 3.",
      },
      {
        type: "p",
        text: "Accessible Authentication (3.3.8 AA / 3.3.9 AAA): Login flows can't require cognitive function tests like puzzles or memory tasks. CAPTCHAs that require identifying objects are problematic. Allow password managers and passkeys.",
      },
      { type: "h2", text: "What to do now" },
      {
        type: "p",
        text: "Run a scan of your site against WCAG 2.2 to see where you stand. Focus on the AA criteria first — they're the standard for legal compliance. The most common new violations are target size issues and focus obscured by sticky headers. Both are quick CSS fixes.",
      },
    ],
  },
  {
    slug: "automated-vs-manual-accessibility-testing",
    title: "Automated vs Manual Accessibility Testing: You Need Both",
    subtitle:
      "Automated tools catch about 30-50% of issues. Here's how to cover the other half.",
    date: "2026-02-08",
    readTime: "5 min",
    category: "Technical",
    body: [
      {
        type: "p",
        text: "There's a persistent myth in the accessibility community that automated tools are useless because they can only detect 30% of WCAG violations. While the statistic is directionally correct, the conclusion is wrong. Automated testing is essential — it's just not sufficient on its own.",
      },
      { type: "h2", text: "What automated tools catch well" },
      {
        type: "p",
        text: "Automated scanners like xsbl (powered by axe-core) excel at detecting structural issues: missing alt text, insufficient color contrast, missing form labels, broken ARIA attributes, heading hierarchy violations, missing landmark regions, duplicate IDs, and keyboard trap detection. These are objective, measurable violations that a machine can evaluate definitively.",
      },
      {
        type: "p",
        text: "Critically, these structural issues are often the most impactful. A screen reader user can't navigate a page at all if the heading hierarchy is broken. Missing alt text means images are completely invisible to blind users. These aren't edge cases — they're fundamental barriers.",
      },
      { type: "h2", text: "What requires human judgment" },
      {
        type: "p",
        text: "Automated tools struggle with subjective evaluations: Is this alt text actually meaningful, or is it generic? Does the reading order make logical sense? Is the error message clear enough? Does the focus order follow a logical flow? These require human understanding of context and intent.",
      },
      {
        type: "p",
        text: "Similarly, automated tools can't fully evaluate complex interactions like custom widgets, dynamic content updates, or single-page application navigation patterns without manual testing.",
      },
      { type: "h2", text: "The optimal workflow" },
      {
        type: "p",
        text: "Use automated scanning as your first line of defense. Run it on every PR, catch the easy wins, keep the baseline high. Then layer in manual testing for releases — keyboard-only navigation testing, screen reader testing with NVDA or VoiceOver, and cognitive walkthrough of key user flows. Automated tools handle the 50% that's objective and repeatable. Humans handle the 50% that requires judgment.",
      },
    ],
  },
  {
    slug: "ai-powered-accessibility-fixes",
    title: "How AI Is Changing Accessibility Remediation",
    subtitle:
      "From months of manual fixes to automated pull requests in minutes. Here's what's now possible.",
    date: "2026-02-01",
    readTime: "6 min",
    category: "Product",
    body: [
      {
        type: "p",
        text: "Traditionally, fixing accessibility issues was a slow, expensive process. You'd hire an auditor, wait weeks for a report, then spend months implementing fixes. The backlog grew faster than the fixes. AI is changing that equation fundamentally.",
      },
      { type: "h2", text: "AI that reads your code" },
      {
        type: "p",
        text: "Modern AI models can read your actual source code, understand its structure, and generate targeted fixes. When xsbl identifies a missing alt text violation, it doesn't just tell you about it — it fetches the relevant source file from your GitHub repo, identifies the exact image element, uses Claude's vision API to understand what the image shows, and generates a contextually accurate alt text attribute.",
      },
      {
        type: "p",
        text: "The fix isn't generic. It's specific to your codebase, your component structure, and the actual visual content of the image. The AI understands JSX, Vue, Svelte, HTML — it generates fixes that match your existing code style.",
      },
      { type: "h2", text: "Bulk fixes at scale" },
      {
        type: "p",
        text: "The real power shows at scale. A typical e-commerce site might have 200+ accessibility violations across dozens of pages. Manually fixing each one takes a developer hours of context-switching between the audit report, the codebase, and testing. With xsbl, you select the issues you want fixed, click one button, and get a single pull request with all the fixes applied — proper alt text, corrected ARIA roles, fixed color contrast values, semantic HTML replacements.",
      },
      {
        type: "p",
        text: "The PR includes a detailed description of every change, which WCAG criterion it addresses, and the impact level. Your team reviews and merges it like any other PR. The whole process takes minutes instead of weeks.",
      },
      { type: "h2", text: "What AI can't replace" },
      {
        type: "p",
        text: "AI-generated fixes still need human review. The model might misinterpret an image's context, choose a suboptimal ARIA pattern, or make assumptions about your design intent. That's why xsbl creates pull requests instead of auto-committing — your team stays in control. AI handles the tedious, repetitive work. Humans handle the judgment calls.",
      },
    ],
  },
  {
    slug: "color-contrast-guide",
    title: "The Complete Guide to Color Contrast for Web Accessibility",
    subtitle:
      "WCAG contrast ratios explained, with practical tips for fixing failures without redesigning your site.",
    date: "2026-01-25",
    readTime: "7 min",
    category: "Technical",
    body: [
      {
        type: "p",
        text: "Color contrast failures are the single most common accessibility violation on the web. WebAIM's annual survey of the top million websites consistently finds that over 80% fail contrast requirements. The good news: contrast fixes are among the easiest to implement.",
      },
      { type: "h2", text: "Understanding contrast ratios" },
      {
        type: "p",
        text: "WCAG defines contrast as the luminance ratio between foreground and background colors, expressed as a ratio like 4.5:1. The higher the number, the more readable the text. WCAG 2.2 AA requires 4.5:1 for normal text and 3:1 for large text (18px+ bold or 24px+ regular). AAA pushes this to 7:1 and 4.5:1 respectively.",
      },
      {
        type: "p",
        text: "A contrast ratio of 1:1 means the colors are identical (invisible text). 21:1 is the maximum — pure black on pure white. Most readability problems occur in the 2:1 to 4:1 range: light gray text on white backgrounds, low-saturation colored text, and placeholder text in form inputs.",
      },
      { type: "h2", text: "Common offenders" },
      {
        type: "p",
        text: "Placeholder text is the most frequent violator. The default gray (#999 on #fff) has a contrast ratio of only 2.8:1. Disabled button text, subtle captions, footer links, and light-on-light UI elements are other common failures. Trendy design choices like thin light-gray body text may look elegant but fail users who need readable content.",
      },
      { type: "h2", text: "Fixing without redesigning" },
      {
        type: "p",
        text: "You rarely need to overhaul your design. Most fixes involve nudging a color value by 10-20% toward the darker end. If your gray text is #999, try #595959 (which passes at 7:1 on white). If your accent color is too light, try a slightly darker shade. Tools like xsbl's AI fix suggestions calculate the minimum adjustment needed to meet the ratio while staying close to your original design intent.",
      },
      {
        type: "p",
        text: "For backgrounds that vary (images, gradients), add a semi-transparent overlay or text shadow to guarantee contrast regardless of what's behind the text.",
      },
    ],
  },
  {
    slug: "screen-reader-testing-developers",
    title: "Screen Reader Testing for Developers: A Practical Guide",
    subtitle:
      "You don't need to be an expert. 15 minutes of testing catches issues automation can't.",
    date: "2026-01-18",
    readTime: "8 min",
    category: "Technical",
    body: [
      {
        type: "p",
        text: "Most developers have never used a screen reader. That's understandable — screen readers have steep learning curves and unfamiliar interfaces. But even 15 minutes of testing with a screen reader reveals accessibility issues that no automated tool can catch. Here's how to get started without the overwhelm.",
      },
      { type: "h2", text: "Which screen reader to use" },
      {
        type: "p",
        text: "On Mac, VoiceOver is built in — press Cmd+F5 to toggle it on. On Windows, download NVDA (free) from nvaccess.org. On mobile, both iOS VoiceOver and Android TalkBack are built into the OS. For a quick test, VoiceOver on Mac is the lowest-friction option since there's nothing to install.",
      },
      { type: "h2", text: "The 5-minute test" },
      {
        type: "p",
        text: "With VoiceOver on (Cmd+F5 on Mac), use VO+Right Arrow (Control+Option+Right Arrow) to move through your page element by element. Listen for: Does the page title make sense? Can you understand the navigation without seeing it? Do images have descriptions? Do buttons and links announce their purpose? Can you tell what form fields are for?",
      },
      {
        type: "p",
        text: "Next, press VO+U to open the Rotor — this shows headings, links, landmarks, and form controls on the page. Are the headings in logical order (h1, h2, h3)? Do link texts make sense out of context? Are form fields labeled?",
      },
      { type: "h2", text: "Common surprises" },
      {
        type: "p",
        text: "The first time developers test with a screen reader, they're often shocked by how broken their sites are. Buttons that say 'click here' or just 'submit'. Images announced as 'image_2847.jpg'. Custom dropdowns that are completely invisible. Modal dialogs that trap keyboard focus — or worse, don't trap it, letting users tab behind the modal into content they can't see.",
      },
      {
        type: "p",
        text: "These are the issues that automated tools flag as warnings but that hit different when you hear them spoken aloud. The combination of automated scanning (xsbl catches the structural issues) plus periodic screen reader testing (you catch the contextual issues) covers the vast majority of accessibility problems.",
      },
    ],
  },
  {
    slug: "accessibility-ci-cd-pipeline",
    title: "Adding Accessibility Checks to Your CI/CD Pipeline",
    subtitle:
      "Catch violations before they ship. Here's how to integrate accessibility scanning into GitHub Actions.",
    date: "2026-01-10",
    readTime: "5 min",
    category: "Product",
    body: [
      {
        type: "p",
        text: "The best accessibility bugs are the ones that never ship. By adding accessibility scanning to your CI/CD pipeline, you catch violations at the pull request stage — before they reach production and before they affect real users.",
      },
      { type: "h2", text: "Why CI/CD for accessibility" },
      {
        type: "p",
        text: "Manual testing catches issues, but only when someone remembers to do it. Automated scans on every deploy create a safety net that's always on. Your accessibility score becomes a tracked metric, regressions trigger alerts, and developers get immediate feedback on their changes.",
      },
      { type: "h2", text: "Setting up xsbl with GitHub Actions" },
      {
        type: "p",
        text: "xsbl provides a GitHub Actions workflow that triggers a scan after every push to main or successful deployment. The workflow calls the xsbl API with your site ID, receives the scan results, and writes a summary to the GitHub Step Summary — visible on every workflow run.",
      },
      {
        type: "p",
        text: "You can configure a score threshold (e.g. 70) and optionally fail the build when the score drops below it. This prevents accessibility regressions from shipping. The setup takes about 2 minutes: create an API key in xsbl settings, add two repository secrets, and commit the workflow file.",
      },
      { type: "h2", text: "Going further" },
      {
        type: "p",
        text: "For teams that want tighter integration, xsbl's bulk fix API can be called from CI to automatically create fix PRs when new violations are detected. Combined with Slack alerts, your team gets notified the moment a regression is introduced, along with a ready-to-merge PR that fixes it. The goal is a development workflow where accessibility is not an afterthought but an automated guardrail — like type checking or linting.",
      },
    ],
  },
  {
    slug: "how-xsbl-scanner-works",
    title: "Under the Hood: How xsbl's Scanner Finds What Others Miss",
    subtitle:
      "We don't just run axe-core and call it a day. Here's how xsbl scans your site in a real browser, crawls every page, and scores your accessibility posture.",
    date: "2026-03-05",
    readTime: "8 min",
    category: "Product",
    featured: false,
    body: [
      {
        type: "p",
        text: "Most accessibility scanners fall into one of two camps: browser extensions that check the page you're looking at, or API services that fetch your HTML and parse it statically. Both approaches miss things. Browser extensions require manual work — someone has to click through every page. Static analyzers miss JavaScript-rendered content, single-page app routing, and anything that requires user interaction to appear.",
      },
      {
        type: "p",
        text: "xsbl takes a different approach. Every scan launches a real headless Chromium browser, navigates to your site, waits for JavaScript to execute and the DOM to settle, then runs axe-core against the fully-rendered page. This is the same engine that powers Puppeteer and Playwright — the tools your own E2E tests use.",
      },
      { type: "h2", text: "Multi-page crawling" },
      {
        type: "p",
        text: "When you trigger a scan, xsbl doesn't just check your homepage. It fetches your sitemap (or crawls your internal links), filters out non-scannable URLs like PDFs, XML feeds, and file downloads, then scans each page individually. Free plans scan up to 5 pages, Pro scans 25, and Agency scans 50. Each page gets its own axe-core run, its own score, and its own set of issues.",
      },
      {
        type: "p",
        text: "The final site score is the average across all scanned pages, weighted by issue severity. A single page with 4 critical violations will pull the overall score down more than 10 pages with minor issues. This gives you an honest picture of your site's accessibility posture, not just a cherry-picked best case.",
      },
      { type: "h2", text: "Timeout handling and resilience" },
      {
        type: "p",
        text: "Real-world sites are messy. Some pages take 20 seconds to load. Others have infinite scroll or heavy animations. xsbl handles this with a per-page timeout of 35 seconds and a total scan budget of 120 seconds. If a page doesn't settle in time, we move on to the next one and mark it as timed out — you still get results for the pages that worked, rather than the whole scan failing.",
      },
      {
        type: "p",
        text: "We also filter out URLs that would waste your scan budget: sitemaps, RSS feeds, PDF links, and URLs with query parameters that are likely pagination or tracking variants of the same page.",
      },
      { type: "h2", text: "WCAG AA vs AAA" },
      {
        type: "p",
        text: "The default scan checks against WCAG 2.2 Level AA — the standard that most laws and policies reference. But Pro and Agency plans also include Level AAA checks, which catch subtler issues like insufficient line spacing, text that can't be resized to 200%, and missing pronunciation hints for screen readers. AAA is aspirational for most sites, but having the data helps you prioritize.",
      },
      { type: "h2", text: "Scan profiles for fine-tuning" },
      {
        type: "p",
        text: "Agency users can create custom scan profiles per site. This lets you exclude specific axe-core rules (useful if you've intentionally made a design decision and don't want it flagged every scan), exclude CSS selectors from scanning (like third-party widgets you can't control), and toggle best-practice rules on or off. The profile is saved to the site and applied automatically on every subsequent scan, including scheduled ones.",
      },
      { type: "h2", text: "What happens after the scan" },
      {
        type: "p",
        text: "Every issue is stored with the element's HTML, its CSS selector, the page URL, the axe rule ID, WCAG tags, impact level, and a human-readable fix suggestion. This data powers everything downstream: the issue detail view, the AI fix generation, the GitHub PR creation, and the compliance reports. One scan feeds the entire remediation pipeline.",
      },
    ],
  },
  {
    slug: "why-agencies-need-accessibility-tooling",
    title: "Why Agencies Are Switching to Dedicated Accessibility Platforms",
    subtitle:
      "Manual audits don't scale. Here's how agencies are using xsbl to manage accessibility across dozens of client sites — with white-label reports, client dashboards, and compliance evidence.",
    date: "2026-03-03",
    readTime: "7 min",
    category: "Product",
    featured: false,
    body: [
      {
        type: "p",
        text: "If you run a web agency, accessibility is probably one of the fastest-growing line items in your client conversations. Regulations are tightening, lawsuits are increasing, and clients who never asked about WCAG before are now putting it in their RFPs. The problem: manual audits are expensive, slow, and don't scale when you're managing 20, 50, or 100 client sites.",
      },
      {
        type: "p",
        text: "Most agencies end up cobbling together a workflow from browser extensions, spreadsheets, and manual testing. It works for one or two sites. It falls apart at scale. That's the gap xsbl's Agency plan is designed to fill.",
      },
      { type: "h2", text: "Manage every client from one dashboard" },
      {
        type: "p",
        text: "The Agency plan removes all site limits. Add every client site to your xsbl workspace and see scores, issues, and scan history in one place. Scheduled scans run automatically — weekly or daily — so you always know the current state of every property you manage without logging into each one.",
      },
      {
        type: "p",
        text: "The overview dashboard shows aggregate stats: total sites, average score, issue trends over time, and which sites need attention. When a client asks 'how are we doing on accessibility?', you have a real answer in seconds.",
      },
      { type: "h2", text: "Client-facing read-only dashboards" },
      {
        type: "p",
        text: "One of the most requested Agency features is client access. Instead of exporting PDFs and emailing them, you invite clients directly to xsbl. They get a stripped-down read-only view showing their sites, scores, issues, and reports — but they can't change settings, trigger scans, or see other clients' data. It's like giving each client their own branded portal without building one yourself.",
      },
      {
        type: "p",
        text: "Clients see what they need to see: which issues exist, what their severity is, and whether scores are improving over time. You control what they have access to — assign specific sites to each client and update permissions at any time.",
      },
      { type: "h2", text: "White-label reports and scheduled delivery" },
      {
        type: "p",
        text: "The Agency plan includes white-label PDF reports. Replace xsbl's branding with your own company name and deliver professional accessibility reports under your brand. Reports include the overall score, per-page breakdowns, the top 15 issues with severity and WCAG criteria, and remediation guidance.",
      },
      {
        type: "p",
        text: "Even better, set reports to deliver automatically. Configure weekly or monthly scheduled reports per site, add recipient email addresses, and xsbl generates and sends them on your behalf. Your clients get a consistent, branded accessibility update without you lifting a finger.",
      },
      { type: "h2", text: "Compliance evidence for audits" },
      {
        type: "p",
        text: "When clients need to demonstrate compliance for SOC 2, ISO 27001, or procurement requirements, the evidence export feature pulls together everything: scan history, remediation timelines, vulnerability management data, and access controls. All structured by the relevant compliance framework's control numbers and downloadable as JSON or CSV.",
      },
      {
        type: "p",
        text: "Combined with the audit log — which tracks every scan, fix, settings change, and user action — you can show auditors a complete record of your accessibility program without assembling it manually.",
      },
      { type: "h2", text: "AI-powered fixes at scale" },
      {
        type: "p",
        text: "The Agency plan includes 999 AI fix suggestions and 999 GitHub PRs per month — effectively unlimited. When you connect a client's repo, xsbl can generate fix pull requests that read the actual source code and write targeted patches. For agencies managing ongoing retainers, this turns accessibility remediation from a multi-hour manual task into a one-click operation.",
      },
      {
        type: "p",
        text: "Bulk fix is particularly powerful: select all critical issues on a site, click once, and get a single PR with every fix. The PR includes the issue descriptions, WCAG criteria, and exactly what changed in each file. Your developers review and merge — no manual debugging required.",
      },
      { type: "h2", text: "The bottom line" },
      {
        type: "p",
        text: "Dedicated accessibility tooling isn't a luxury for agencies — it's becoming table stakes. The agencies that invest in scalable workflows now will be the ones winning accessibility-conscious clients in 2027. Manual audits will always have a place for complex edge cases, but the 80% of issues that are automatable should be automated. That's what xsbl is built for.",
      },
    ],
  },
];
