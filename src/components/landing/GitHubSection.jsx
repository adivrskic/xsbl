import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import XsblBull from "./XsblBull";
import { Check, Sparkles, Search, MoveRight } from "lucide-react";
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
    <div style={{ display: "flex", gap: 5 }}>
      {["#ff5f57", "#ffbd2e", "#28ca41"].map(function (c) {
        return (
          <span
            key={c}
            style={{ width: 9, height: 9, borderRadius: "50%", background: c }}
          />
        );
      })}
    </div>
  );
}

function CardShell({ title, children }) {
  return (
    <div
      style={{
        background: "var(--code-bg, #1a1714)",
        borderRadius: 14,
        overflow: "hidden",
        boxShadow:
          "0 2px 4px rgba(0,0,0,0.03), 0 12px 32px rgba(0,0,0,0.1), 0 32px 64px rgba(0,0,0,0.08)",
      }}
    >
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
        <Dots />
        <span
          style={{
            flex: 1,
            textAlign: "center",
            fontFamily: "var(--mono)",
            fontSize: "0.68rem",
            color: "rgba(255,255,255,0.2)",
          }}
        >
          {title}
        </span>
      </div>
      <div style={{ padding: "1.2rem 1.4rem" }}>{children}</div>
    </div>
  );
}

function ImpactBadge({ impact, t }) {
  var bg =
    impact === "critical"
      ? t.red + "20"
      : impact === "serious"
      ? t.red + "15"
      : t.amber + "15";
  var fg = impact === "critical" || impact === "serious" ? "#e05545" : t.amber;
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.52rem",
        fontWeight: 600,
        padding: "0.08rem 0.25rem",
        borderRadius: 3,
        background: bg,
        color: fg,
        textTransform: "uppercase",
      }}
    >
      {impact}
    </span>
  );
}

/* ── Step 0: Scan results ── */
function CardScan({ t }) {
  return (
    <CardShell title="xsbl — scan results">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: t.red + "18",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Search size={16} color="#e05545" strokeWidth={2} />
        </div>
        <div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.82rem",
              color: "#e6edf3",
              fontWeight: 600,
            }}
          >
            12 violations found
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.6rem",
              color: "rgba(255,255,255,0.3)",
            }}
          >
            across 4 pages · scanned just now
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {issues.map(function (item, i) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                padding: "0.35rem 0.5rem",
                borderRadius: 6,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <ImpactBadge impact={item.impact} t={t} />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  color: "#8b949e",
                  flex: 1,
                }}
              >
                {item.rule}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  color: "rgba(255,255,255,0.18)",
                }}
              >
                ×{item.count}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "0.9rem",
          display: "flex",
          gap: "0.5rem",
          fontFamily: "var(--mono)",
          fontSize: "0.58rem",
          color: "rgba(255,255,255,0.25)",
        }}
      >
        <span style={{ color: "#e05545" }}>7 critical</span>
        <span>·</span>
        <span>3 serious</span>
        <span>·</span>
        <span>2 moderate</span>
      </div>
    </CardShell>
  );
}

/* ── Step 1: Select issues ── */
function CardSelect({ t }) {
  var checked = [true, true, false, false];
  return (
    <CardShell title="xsbl — select issues to fix">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.8rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: "#e6edf3",
            fontWeight: 600,
          }}
        >
          Select issues
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.56rem",
            padding: "0.2rem 0.5rem",
            borderRadius: 4,
            background: t.accent + "18",
            color: t.accentLight || t.accent,
            cursor: "default",
          }}
        >
          Select all critical
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {issues.map(function (item, i) {
          var on = checked[i];
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem 0.5rem",
                borderRadius: 6,
                background: on ? t.accent + "0a" : "rgba(255,255,255,0.02)",
                border:
                  "1px solid " +
                  (on ? t.accent + "30" : "rgba(255,255,255,0.04)"),
                transition: "all 0.2s",
              }}
            >
              {/* checkbox */}
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  border:
                    "1.5px solid " + (on ? t.accent : "rgba(255,255,255,0.15)"),
                  background: on ? t.accent : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {on && <Check size={10} color="white" strokeWidth={3} />}
              </span>

              <ImpactBadge impact={item.impact} t={t} />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.66rem",
                  color: on ? "#e6edf3" : "#8b949e",
                  flex: 1,
                }}
              >
                {item.rule}
                <span style={{ color: "rgba(255,255,255,0.15)" }}>
                  {" "}
                  ×{item.count}
                </span>
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "0.9rem",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            fontWeight: 600,
            padding: "0.35rem 0.9rem",
            borderRadius: 6,
            background: t.accent,
            color: "white",
            cursor: "default",
          }}
        >
          Generate fix
        </span>
      </div>
    </CardShell>
  );
}

/* ── Step 2: AI generating ── */
function CardGenerate({ t }) {
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
            display: "inline-flex",
            animation: "spin 1.2s linear infinite",
          }}
        >
          <Sparkles size={15} color={t.accent} strokeWidth={2} />
        </span>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: "#e6edf3",
            fontWeight: 600,
          }}
        >
          Writing fixes…
        </span>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* File tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: "0.5rem",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {["Hero.tsx", "Nav.tsx"].map(function (f, i) {
          return (
            <span
              key={f}
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                padding: "0.35rem 0.7rem",
                color: i === 0 ? "#e6edf3" : "rgba(255,255,255,0.3)",
                borderBottom:
                  i === 0 ? "2px solid " + t.accent : "2px solid transparent",
                cursor: "default",
              }}
            >
              {f}
            </span>
          );
        })}
      </div>

      {/* Diff view */}
      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.62rem",
          lineHeight: 1.85,
          background: "rgba(0,0,0,0.25)",
          borderRadius: 6,
          padding: "0.6rem 0",
          overflow: "hidden",
        }}
      >
        {lines.map(function (l, i) {
          var bg = "transparent";
          var prefix = " ";
          var prefixColor = "rgba(255,255,255,0.12)";
          if (l.type === "remove") {
            bg = "rgba(248,81,73,0.10)";
            prefix = "−";
            prefixColor = "#f85149";
          } else if (l.type === "add") {
            bg = "rgba(63,185,80,0.10)";
            prefix = "+";
            prefixColor = "#3fb950";
          }
          return (
            <div
              key={i}
              style={{
                background: bg,
                padding: "0 0.7rem",
                display: "flex",
                gap: "0.6rem",
                whiteSpace: "pre",
              }}
            >
              <span
                style={{
                  color: prefixColor,
                  width: 10,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {prefix}
              </span>
              <span
                style={{
                  color:
                    l.type === "context"
                      ? "rgba(255,255,255,0.4)"
                      : l.type === "remove"
                      ? "#f85149"
                      : "#3fb950",
                }}
              >
                {l.text}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          marginTop: "0.7rem",
          fontFamily: "var(--mono)",
          fontSize: "0.56rem",
          color: "rgba(255,255,255,0.2)",
        }}
      >
        Fixing 7 issues in 2 files…
      </div>
    </CardShell>
  );
}

/* ── Step 3: PR created ── */
function CardPR({ t }) {
  return (
    <CardShell title="github.com — pull request">
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
          fix(a11y)-xsbl: fix 7 critical issues
        </span>
      </div>

      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.62rem",
          color: "rgba(255,255,255,0.3)",
          marginBottom: "1rem",
        }}
      >
        xsbl-bot wants to merge 2 commits into{" "}
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
          xsbl/fix-7-a11y
        </span>
      </div>

      <div
        style={{
          borderLeft: "2px solid " + t.accent + "40",
          paddingLeft: "0.8rem",
          marginBottom: "0.8rem",
        }}
      >
        {issues.slice(0, 2).map(function (item, i) {
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
              <span style={{ color: "#3fb950", flexShrink: 0 }}>
                <Check size={12} strokeWidth={2.5} />
              </span>
              <ImpactBadge impact={item.impact} t={t} />
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.68rem",
                  color: "#8b949e",
                }}
              >
                {item.rule}{" "}
                <span style={{ color: "rgba(255,255,255,0.2)" }}>
                  ×{item.count}
                </span>
              </span>
            </div>
          );
        })}
      </div>

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
        <span>2 files changed</span>
      </div>

      <div
        style={{
          marginTop: "0.8rem",
          display: "flex",
          gap: "0.5rem",
        }}
      >
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            fontWeight: 600,
            padding: "0.35rem 0.9rem",
            borderRadius: 6,
            background: "#238636",
            color: "white",
            cursor: "default",
          }}
        >
          Merge pull request
        </span>
      </div>
    </CardShell>
  );
}

/* ── Main PR demo ── */
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
      detail: "xsbl AI reads your source code and writes the fix",
    },
    {
      label: "PR created",
      icon: <MoveRight size={20} color={t.accent} strokeWidth={1.8} />,
      detail: "Branch + commit + pull request, ready to merge",
    },
  ];

  var cards = [
    <CardScan t={t} />,
    <CardSelect t={t} />,
    <CardGenerate t={t} />,
    <CardPR t={t} />,
  ];

  return (
    <div style={{ position: "relative" }}>
      {/* Bull mascot peeking */}
      <div
        style={{
          position: "absolute",
          top: -25,
          right: 0,
          zIndex: 3,
          animation: "bullFloat 5s ease-in-out infinite",
        }}
      >
        <XsblBull size={56} />
      </div>
      <style>{`@keyframes bullFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }`}</style>

      {/* Card area with crossfade — fixed height so toggling doesn't shift layout */}
      <div style={{ position: "relative", height: 340 }}>
        {cards.map(function (card, i) {
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                opacity: i === step ? 1 : 0,
                transform: i === step ? "translateY(0)" : "translateY(6px)",
                transition: "opacity 0.35s ease, transform 0.35s ease",
                pointerEvents: i === step ? "auto" : "none",
              }}
            >
              {card}
            </div>
          );
        })}
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
          var active = step === i;
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
                background: active ? t.accentBg : "transparent",
                border: "1px solid " + (active ? t.accent + "30" : t.ink08),
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
                  color: active ? t.accent : t.ink50,
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
                desc: "Not generic suggestions — we write fixes that match your codebase.",
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
