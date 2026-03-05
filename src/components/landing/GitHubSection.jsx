import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import XsblBull from "./XsblBull";
import { Check, Sparkles, Search, MoveRight } from "lucide-react";
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
    <div style={{ position: "relative" }}>
      {/* Bull mascot peeking */}
      <div
        style={{
          position: "absolute",
          top: -40,
          right: 20,
          zIndex: 3,
          animation: "bullFloat 3s ease-in-out infinite",
        }}
      >
        <XsblBull size={56} />
      </div>
      <style>{`@keyframes bullFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>

      {/* PR mockup card */}
      <div
        style={{
          background: t.codeBg,
          borderRadius: 14,
          overflow: "hidden",
          boxShadow:
            "0 2px 4px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.08)",
        }}
      >
        {/* Header bar */}
        <div
          style={{
            padding: "0.75rem 1rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
          }}
        >
          {["#ff5f57", "#ffbd2e", "#28ca41"].map(function (c) {
            return (
              <span
                key={c}
                style={{
                  width: 9,
                  height: 9,
                  borderRadius: "50%",
                  background: c,
                }}
              />
            );
          })}
          <span
            style={{
              flex: 1,
              textAlign: "center",
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              color: "rgba(255,255,255,0.2)",
            }}
          >
            github.com — pull request
          </span>
        </div>

        {/* PR content */}
        <div style={{ padding: "1.2rem 1.4rem" }}>
          {/* PR title */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.8rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                padding: "0.15rem 0.4rem",
                borderRadius: 10,
                background: "#238636",
                color: "white",
              }}
            >
              Open
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.82rem",
                color: "#e6edf3",
                fontWeight: 600,
              }}
            >
              fix(a11y): fix 12 accessibility issues
            </span>
          </div>

          {/* PR meta */}
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: "rgba(255,255,255,0.3)",
              marginBottom: "1rem",
            }}
          >
            xsbl-bot wants to merge 3 commits into{" "}
            <span
              style={{
                padding: "0.1rem 0.3rem",
                borderRadius: 3,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              main
            </span>{" "}
            from{" "}
            <span
              style={{
                padding: "0.1rem 0.3rem",
                borderRadius: 3,
                background: "rgba(255,255,255,0.06)",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              xsbl/fix-12-a11y
            </span>
          </div>

          {/* Issue list in PR */}
          <div
            style={{
              borderLeft: "2px solid " + t.accent + "40",
              paddingLeft: "0.8rem",
              marginBottom: "0.8rem",
            }}
          >
            {[
              { rule: "color-contrast", impact: "serious", count: 6 },
              { rule: "button-name", impact: "critical", count: 1 },
              { rule: "image-alt", impact: "serious", count: 3 },
              { rule: "heading-order", impact: "moderate", count: 2 },
            ].map(function (item, i) {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.52rem",
                      fontWeight: 600,
                      padding: "0.08rem 0.25rem",
                      borderRadius: 3,
                      background:
                        item.impact === "critical"
                          ? t.red + "20"
                          : item.impact === "serious"
                          ? t.red + "15"
                          : t.amber + "15",
                      color:
                        item.impact === "critical" || item.impact === "serious"
                          ? "#e05545"
                          : t.amber,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.impact}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.68rem",
                      color: "#8b949e",
                    }}
                  >
                    {item.rule}{" "}
                    <span style={{ color: "rgba(255,255,255,0.2)" }}>
                      × {item.count}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Files changed */}
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: "rgba(255,255,255,0.25)",
              display: "flex",
              gap: "1rem",
            }}
          >
            <span>
              <span style={{ color: "#3fb950" }}>+47</span>{" "}
              <span style={{ color: "#f85149" }}>-12</span>
            </span>
            <span>3 files changed</span>
          </div>
        </div>
      </div>

      {/* Step indicators */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "0.4rem",
          marginTop: "1rem",
        }}
      >
        {steps.map(function (s, i) {
          return (
            <div
              key={i}
              onClick={function () {
                setStep(i);
              }}
              style={{
                padding: "0.6rem 0.5rem",
                borderRadius: 8,
                cursor: "pointer",
                background: step === i ? t.accentBg : "transparent",
                border: "1px solid " + (step === i ? t.accent + "30" : t.ink08),
                transition: "all 0.2s",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: "1rem", marginBottom: "0.15rem" }}>
                {s.icon}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  fontWeight: 600,
                  color: step === i ? t.accent : t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: "0.5rem",
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          color: t.ink50,
          textAlign: "center",
          lineHeight: 1.6,
        }}
      >
        {steps[step].detail}
      </div>
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

      <div
        className="hero-layout"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: "3.5rem",
          alignItems: "center",
        }}
      >
        {/* Left — feature list */}
        <FadeIn delay={0.15}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}
          >
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
                  <div
                    style={{
                      display: "flex",
                      gap: "0.8rem",
                      alignItems: "flex-start",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.9rem",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: 8,
                        background: t.accentBg,
                        flexShrink: 0,
                      }}
                    >
                      {feat.icon}
                    </span>
                    <div>
                      <h4
                        style={{
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          color: t.ink,
                          margin: "0 0 0.2rem 0",
                        }}
                      >
                        {feat.title}
                      </h4>
                      <p
                        style={{
                          fontSize: "0.82rem",
                          color: t.ink50,
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {feat.desc}
                      </p>
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
