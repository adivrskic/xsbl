import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import XsblBull from "./XsblBull";
import { Check, Sparkles, Search, MoveRight } from "lucide-react";
import "./GitHubSection.css";

function PRDemo() {
  const { t } = useTheme();
  const [step, setStep] = useState(0);

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
      detail: "Claude reads your source code and writes the fix",
    },
    {
      label: "PR created",
      icon: <MoveRight size={20} color={t.accent} strokeWidth={1.8} />,
      detail: "Branch + commit + pull request, ready to merge",
    },
  ];

  return (
    <div className="pr-demo">
      {/* Bull mascot peeking */}
      <div className="pr-demo__bull">
        <XsblBull size={56} />
      </div>

      {/* PR mockup card */}
      <div className="pr-card">
        {/* Header bar */}
        <div className="pr-card__bar">
          {["#ff5f57", "#ffbd2e", "#28ca41"].map(function (c) {
            return (
              <span
                key={c}
                className="pr-card__dot"
                style={{ background: c }}
              />
            );
          })}
          <span className="pr-card__bar-title">github.com — pull request</span>
        </div>

        {/* PR content */}
        <div className="pr-card__body">
          {/* PR title */}
          <div className="pr-card__title-row">
            <span className="pr-card__badge-open">Open</span>
            <span className="pr-card__pr-name">
              fix(a11y): fix 12 accessibility issues
            </span>
          </div>

          {/* PR meta */}
          <div className="pr-card__meta">
            xsbl-bot wants to merge 3 commits into{" "}
            <span className="pr-card__branch">main</span> from{" "}
            <span className="pr-card__branch">xsbl/fix-12-a11y</span>
          </div>

          {/* Issue list in PR */}
          <div className="pr-card__issues">
            {[
              { rule: "color-contrast", impact: "serious", count: 6 },
              { rule: "button-name", impact: "critical", count: 1 },
              { rule: "image-alt", impact: "serious", count: 3 },
              { rule: "heading-order", impact: "moderate", count: 2 },
            ].map(function (item, i) {
              return (
                <div key={i} className="pr-card__issue-row">
                  <span
                    className={
                      "pr-card__impact-badge pr-card__impact-badge--" +
                      item.impact
                    }
                  >
                    {item.impact}
                  </span>
                  <span className="pr-card__issue-name">
                    {item.rule}{" "}
                    <span className="pr-card__issue-count">× {item.count}</span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Files changed */}
          <div className="pr-card__files">
            <span>
              <span style={{ color: "#3fb950" }}>+47</span>{" "}
              <span style={{ color: "#f85149" }}>-12</span>
            </span>
            <span>3 files changed</span>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div className="pr-steps">
        {steps.map(function (s, i) {
          return (
            <div
              key={i}
              onClick={function () {
                setStep(i);
              }}
              className={"pr-step" + (step === i ? " pr-step--active" : "")}
            >
              <div style={{ fontSize: "1rem", marginBottom: "0.15rem" }}>
                {s.icon}
              </div>
              <div className="pr-step__label">{s.label}</div>
            </div>
          );
        })}
      </div>
      <div className="pr-step__detail">{steps[step].detail}</div>
    </div>
  );
}

export default function GitHubSection() {
  const { t } = useTheme();

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

      <div className="hero-layout gh-layout">
        {/* Left — feature list */}
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
                desc: "Not generic suggestions — Claude sees your source files and writes fixes that match your codebase.",
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
                      <h4 className="gh-feat__title">{feat.title}</h4>
                      <p className="gh-feat__desc">{feat.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </FadeIn>

        {/* Right — PR mockup */}
        <FadeIn delay={0.2}>
          <PRDemo />
        </FadeIn>
      </div>
    </Section>
  );
}
