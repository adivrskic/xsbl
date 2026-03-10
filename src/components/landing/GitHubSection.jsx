import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import XsblBull from "./XsblBull";
import {
  Check,
  Sparkles,
  Search,
  MoveRight,
  Zap,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import "./GitHubSection.css";

/* ── shared card data ── */
var issues = [
  {
    rule: "color-contrast",
    impact: "critical",
    count: 6,
    file: "Hero.tsx",
    line: 42,
  },
  {
    rule: "button-name",
    impact: "critical",
    count: 1,
    file: "Nav.tsx",
    line: 18,
  },
  {
    rule: "image-alt",
    impact: "serious",
    count: 3,
    file: "Gallery.tsx",
    line: 91,
  },
  {
    rule: "heading-order",
    impact: "moderate",
    count: 2,
    file: "Blog.tsx",
    line: 7,
  },
];

/* ── tiny components ── */
function Dots() {
  return (
    <div className="gh-card__dots" aria-hidden="true">
      {["#ff5f57", "#ffbd2e", "#28ca41"].map(function (c) {
        return (
          <span key={c} className="gh-card__dot" style={{ background: c }} />
        );
      })}
    </div>
  );
}

function CardShell({ title, children }) {
  return (
    <div className="gh-card" role="img" aria-label={title}>
      <div className="gh-card__bar">
        <Dots />
        <span className="gh-card__bar-title">{title}</span>
      </div>
      <div className="gh-card__body">{children}</div>
    </div>
  );
}

function ImpactBadge({ impact }) {
  return <span className={"gh-impact gh-impact--" + impact}>{impact}</span>;
}

/* ── Step 0: Scan results ── */
function CardScan() {
  return (
    <CardShell title="xsbl — scan results">
      <div className="gh-scan__header">
        <div className="gh-scan__score-icon">
          <Search size={16} color="#e05545" strokeWidth={2} />
        </div>
        <div>
          <div className="gh-scan__title">12 violations found</div>
          <div className="gh-scan__sub">across 4 pages · scanned just now</div>
        </div>
      </div>
      <div className="gh-scan__list">
        {issues.map(function (item, i) {
          return (
            <div key={i} className="gh-scan__row">
              <ImpactBadge impact={item.impact} />
              <span className="gh-scan__rule">{item.rule}</span>
              <span className="gh-scan__count">×{item.count}</span>
            </div>
          );
        })}
      </div>
      <div className="gh-scan__summary">
        <span className="gh-scan__summary-critical">7 critical</span>
        <span>·</span>
        <span>3 serious</span>
        <span>·</span>
        <span>2 moderate</span>
      </div>
    </CardShell>
  );
}

/* ── Step 1: Select issues ── */
function CardSelect() {
  var checked = [true, true, false, false];
  return (
    <CardShell title="xsbl — select issues to fix">
      <div className="gh-select__header">
        <span className="gh-select__title">Select issues</span>
        <span className="gh-select__badge">Select all critical</span>
      </div>
      <div className="gh-select__list">
        {issues.map(function (item, i) {
          var on = checked[i];
          return (
            <div
              key={i}
              className={"gh-select__row" + (on ? " gh-select__row--on" : "")}
            >
              <span
                className={
                  "gh-select__check" + (on ? " gh-select__check--on" : "")
                }
              >
                {on && <Check size={10} color="white" strokeWidth={3} />}
              </span>
              <ImpactBadge impact={item.impact} />
              <span
                className={
                  "gh-select__rule" + (on ? " gh-select__rule--on" : "")
                }
              >
                {item.rule}
                <span className="gh-select__count"> ×{item.count}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="gh-select__footer">
        <span className="gh-select__btn">Generate fix →</span>
      </div>
    </CardShell>
  );
}

/* ── Step 2: AI generating ── */
function CardGenerate() {
  var lines = [
    { type: "context", text: "  <h2 className={styles.title}>" },
    { type: "remove", text: '    <span style={{ color: "#888" }}>' },
    { type: "add", text: '    <span style={{ color: "#2d2d2d" }}>' },
    { type: "context", text: "      {post.headline}" },
    { type: "context", text: "    </span>" },
    { type: "context", text: "  </h2>" },
    { type: "remove", text: "  <button>" },
    { type: "add", text: '  <button aria-label="Close dialog">' },
  ];

  return (
    <CardShell title="xsbl — generating fix">
      <div className="gh-gen__header">
        <span className="gh-gen__spinner">
          <Sparkles size={15} color="var(--accent)" strokeWidth={2} />
        </span>
        <span className="gh-gen__title">Writing fixes…</span>
      </div>
      <div className="gh-gen__tabs">
        {["Hero.tsx", "Nav.tsx"].map(function (f, i) {
          return (
            <span
              key={f}
              className={
                "gh-gen__tab" + (i === 0 ? " gh-gen__tab--active" : "")
              }
            >
              {f}
            </span>
          );
        })}
      </div>
      <div
        className="gh-gen__diff"
        role="img"
        aria-label="Code diff showing accessibility fixes"
      >
        {lines.map(function (l, i) {
          var lineClass = "gh-gen__diff-line";
          if (l.type === "remove") lineClass += " gh-gen__diff-line--remove";
          if (l.type === "add") lineClass += " gh-gen__diff-line--add";
          var prefixClass = "gh-gen__diff-prefix";
          if (l.type === "remove")
            prefixClass += " gh-gen__diff-prefix--remove";
          if (l.type === "add") prefixClass += " gh-gen__diff-prefix--add";
          var prefix = l.type === "remove" ? "−" : l.type === "add" ? "+" : " ";
          return (
            <div key={i} className={lineClass}>
              <span className={prefixClass}>{prefix}</span>
              <span className={"gh-gen__diff-text--" + l.type}>{l.text}</span>
            </div>
          );
        })}
      </div>
      <div className="gh-gen__status">Fixing 7 issues in 2 files…</div>
    </CardShell>
  );
}

/* ── Step 3: PR created ── */
function CardPR() {
  return (
    <CardShell title="github.com — pull request">
      <div className="gh-pr__header">
        <span className="gh-pr__badge">Open</span>
        <span className="gh-pr__title">fix(a11y): fix 7 critical issues</span>
      </div>
      <div className="gh-pr__meta">
        xsbl-bot wants to merge 2 commits into{" "}
        <span className="gh-pr__branch">main</span> from{" "}
        <span className="gh-pr__branch">xsbl/fix-7-a11y</span>
      </div>
      <div className="gh-pr__issues">
        {issues.slice(0, 2).map(function (item, i) {
          return (
            <div key={i} className="gh-pr__issue-row">
              <span className="gh-pr__issue-check">
                <Check size={12} strokeWidth={2.5} />
              </span>
              <ImpactBadge impact={item.impact} />
              <span className="gh-pr__issue-name">
                {item.rule}{" "}
                <span className="gh-pr__issue-count">×{item.count}</span>
              </span>
            </div>
          );
        })}
      </div>
      <div className="gh-pr__files">
        <span>
          <span className="gh-pr__additions">+47</span>{" "}
          <span className="gh-pr__deletions">-12</span>
        </span>
        <span>2 files changed</span>
      </div>
      <div className="gh-pr__actions">
        <span className="gh-pr__merge-btn">Merge pull request</span>
      </div>
    </CardShell>
  );
}

/* ── Main PR demo ── */
function PRDemo() {
  var { t } = useTheme();
  var [step, setStep] = useState(0);

  var steps = [
    {
      label: "Issues found",
      icon: <Search size={20} color={t.accent} strokeWidth={1.8} />,
      detail: "39 violations across 6 pages",
    },
    {
      label: "Select & fix",
      icon: <Check size={20} color={t.accent} strokeWidth={1.8} />,
      detail: "Pick issues or fix all critical at once",
    },
    {
      label: "AI generates fix",
      icon: <Sparkles size={20} color={t.accent} strokeWidth={1.8} />,
      detail: "AI reads your source code and writes the fix",
    },
    {
      label: "PR created",
      icon: <MoveRight size={20} color={t.accent} strokeWidth={1.8} />,
      detail: "Branch + commit + pull request, ready to merge",
    },
  ];

  var cards = [<CardScan />, <CardSelect />, <CardGenerate />, <CardPR />];

  return (
    <div className="gh-demo">
      <div className="gh-demo__bull" aria-hidden="true">
        <XsblBull size={56} />
      </div>
      <div className="gh-demo__cards">
        {cards.map(function (card, i) {
          return (
            <div
              key={i}
              className={
                "gh-demo__card" + (i === step ? " gh-demo__card--active" : "")
              }
            >
              {card}
            </div>
          );
        })}
      </div>
      <div className="gh-steps" role="tablist" aria-label="PR creation steps">
        {steps.map(function (s, i) {
          var active = step === i;
          return (
            <button
              key={i}
              role="tab"
              aria-selected={active}
              aria-label={s.label + ": " + s.detail}
              onClick={function () {
                setStep(i);
              }}
              className={"gh-step" + (active ? " gh-step--active" : "")}
            >
              <div className="gh-step__icon">{s.icon}</div>
              <div className="gh-step__label">{s.label}</div>
            </button>
          );
        })}
      </div>
      <div className="gh-step__detail" aria-live="polite">
        {steps[step].detail}
      </div>
    </div>
  );
}

/* ── CI / Actions card ── */
function CICard() {
  var { t } = useTheme();

  var lines = [
    { type: "header", text: "♿ Accessibility Scan Results" },
    { type: "blank", text: "" },
    { type: "table-header", text: "| Metric | Value   |" },
    { type: "table-sep", text: "|--------|---------|" },
    { type: "table-row", text: "| Score  |", val: "94", good: true },
    { type: "table-row", text: "| Issues |", val: "3", good: false },
    { type: "table-row", text: "| Pages  |", val: "6", good: true },
    { type: "blank", text: "" },
    { type: "success", text: "✅ Score 94 meets threshold 70" },
  ];

  return (
    <div
      className="gh-ci-card"
      role="img"
      aria-label="GitHub Actions workflow run showing accessibility scan results"
    >
      <div className="gh-ci-card__bar">
        <div className="gh-ci-card__status">
          <span className="gh-ci-card__check">
            <Check size={11} color="white" strokeWidth={3} />
          </span>
          <span className="gh-ci-card__workflow">Accessibility Scan</span>
        </div>
        <span className="gh-ci-card__time">32s</span>
      </div>
      <div className="gh-ci-card__body">
        <div className="gh-ci-card__step">
          <span className="gh-ci-card__step-check">
            <Check size={9} color="#28ca41" strokeWidth={3} />
          </span>
          <span className="gh-ci-card__step-name">Trigger xsbl scan</span>
        </div>
        <div className="gh-ci-card__output">
          {lines.map(function (l, i) {
            if (l.type === "blank")
              return <div key={i} style={{ height: 6 }} />;
            if (l.type === "header")
              return (
                <div
                  key={i}
                  className="gh-ci-card__line gh-ci-card__line--header"
                >
                  {l.text}
                </div>
              );
            if (l.type === "table-header" || l.type === "table-sep")
              return (
                <div key={i} className="gh-ci-card__line gh-ci-card__line--dim">
                  {l.text}
                </div>
              );
            if (l.type === "table-row")
              return (
                <div key={i} className="gh-ci-card__line">
                  {l.text}{" "}
                  <span
                    className={
                      l.good ? "gh-ci-card__val--good" : "gh-ci-card__val--warn"
                    }
                  >
                    {l.val}
                  </span>
                  {"     |"}
                </div>
              );
            if (l.type === "success")
              return (
                <div
                  key={i}
                  className="gh-ci-card__line gh-ci-card__line--success"
                >
                  {l.text}
                </div>
              );
            return null;
          })}
        </div>
        <div className="gh-ci-card__step">
          <span className="gh-ci-card__step-check">
            <Check size={9} color="#28ca41" strokeWidth={3} />
          </span>
          <span className="gh-ci-card__step-name">Check score threshold</span>
        </div>
      </div>
    </div>
  );
}

export default function GitHubSection() {
  var { t } = useTheme();

  return (
    <Section id="github">
      <FadeIn>
        <Eyebrow>GitHub integration</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          One click. <Italic>Real PRs.</Italic>
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          Connect your repo. Select the issues you want fixed. xsbl reads your
          source code, generates the fixes with AI, and opens a pull request —
          ready to review and merge.
        </SubText>
      </FadeIn>
      <div className="gh-layout">
        <FadeIn delay={0.15}>
          <div className="gh-features">
            {[
              {
                title: "Single or bulk fixes",
                desc: "Fix one issue at a time, or select 'all critical' and generate a single PR with every fix.",
                icon: <Check size={17} color={t.accent} strokeWidth={1.8} />,
              },
              {
                title: "AI reads your actual code",
                desc: "Not generic suggestions — AI sees your source files and writes fixes that match your codebase.",
                icon: <Sparkles size={17} color={t.accent} strokeWidth={1.8} />,
              },
              {
                title: "Smart file discovery",
                desc: "Automatically finds the right source files by matching page URLs, component names, and CSS selectors.",
                icon: <Search size={17} color={t.accent} strokeWidth={1.8} />,
              },
              {
                title: "Clean PR format",
                desc: "Every PR lists the issues fixed, WCAG criteria, impact level, and exactly what changed — with proper commit messages.",
                icon: (
                  <MoveRight size={17} color={t.accent} strokeWidth={1.8} />
                ),
              },
            ].map(function (feat, i) {
              return (
                <FadeIn key={i} delay={0.2 + i * 0.05}>
                  <div className="gh-feat">
                    <span className="gh-feat__icon">{feat.icon}</span>
                    <div>
                      <h3 className="gh-feat__title">{feat.title}</h3>
                      <p className="gh-feat__desc">{feat.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </FadeIn>
        <FadeIn delay={0.2}>
          <PRDemo />
        </FadeIn>
      </div>

      {/* ── CI / Continuous Scanning ── */}
      <div className="gh-ci-section">
        <FadeIn delay={0.1}>
          <div className="gh-ci-layout">
            <div className="gh-ci-content">
              <div className="gh-ci-eyebrow">
                <Zap size={14} color={t.accent} strokeWidth={2} />
                <span>Continuous scanning</span>
              </div>
              <h3 className="gh-ci-heading">
                Scan on every deploy.{" "}
                <span style={{ color: t.accent }}>Automatically.</span>
              </h3>
              <p className="gh-ci-desc">
                Install a GitHub Actions workflow with one click — no YAML to
                write, no secrets to configure. Every push to main triggers an
                accessibility scan. Regressions get caught before they reach
                production.
              </p>
              <div className="gh-ci-features">
                {[
                  {
                    icon: (
                      <RefreshCw size={14} color={t.accent} strokeWidth={2} />
                    ),
                    title: "One-click install",
                    desc: "xsbl commits the workflow file and sets your secrets automatically.",
                  },
                  {
                    icon: (
                      <ShieldCheck size={14} color={t.accent} strokeWidth={2} />
                    ),
                    title: "Score threshold gate",
                    desc: "Set a minimum score — builds warn or fail if accessibility drops below it.",
                  },
                  {
                    icon: (
                      <Sparkles size={14} color={t.accent} strokeWidth={2} />
                    ),
                    title: "Results in GitHub",
                    desc: "Scan results appear in the Actions summary. No context switching needed.",
                  },
                ].map(function (feat, i) {
                  return (
                    <div key={i} className="gh-ci-feat">
                      <span className="gh-ci-feat__icon">{feat.icon}</span>
                      <div>
                        <div className="gh-ci-feat__title">{feat.title}</div>
                        <div className="gh-ci-feat__desc">{feat.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="gh-ci-card-wrap">
              <CICard />
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
