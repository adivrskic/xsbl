import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { howSteps } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";

function GridCell({ children }) {
  const { t } = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? t.paperWarm : t.paper,
        padding: "2.3rem 2rem",
        transition: "background 0.3s",
        height: "100%",
      }}
    >
      {children}
    </div>
  );
}

export default function HowSection() {
  const { t } = useTheme();

  return (
    <Section id="how">
      <FadeIn>
        <Eyebrow>How it works</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Three steps to <Italic>actually</Italic> accessible&nbsp;code
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          Paste a URL. See every issue. Get code fixes you can copy and paste.
          Or scan and generate PRs on every deploy.
        </SubText>
      </FadeIn>

      <div
        className="grid-1-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1,
          background: t.ink08,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {howSteps.map((step, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <GridCell>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "2.6rem",
                  fontStyle: "italic",
                  color: t.accent,
                  opacity: 0.25,
                  lineHeight: 1,
                  marginBottom: "1.1rem",
                }}
              >
                {step.n}
              </div>
              <h3
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.3rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  color: t.ink,
                  letterSpacing: "-0.01em",
                }}
              >
                {step.title}
              </h3>
              <p
                style={{ fontSize: "0.88rem", color: t.ink50, lineHeight: 1.7 }}
              >
                {step.desc}
              </p>
              <span
                style={{
                  display: "inline-block",
                  marginTop: "1rem",
                  fontFamily: "var(--mono)",
                  fontSize: "0.66rem",
                  padding: "0.22rem 0.6rem",
                  borderRadius: 4,
                  background: t.accentBg,
                  color: t.accent,
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                }}
              >
                {step.tag}
              </span>
            </GridCell>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
