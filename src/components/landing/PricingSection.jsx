import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { pricingPlans } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";

function PriceCard({ tier, price, blurb, features, popular, cta, delay }) {
  const { t } = useTheme();
  const [hov, setHov] = useState(false);

  return (
    <FadeIn
      delay={delay}
      style={{
        padding: "2.5rem 2rem",
        border: `1px solid ${popular ? t.accent : t.ink08}`,
        borderRadius: 14,
        background: popular
          ? `linear-gradient(180deg, ${t.accentBg} 0%, ${t.cardBg} 100%)`
          : t.cardBg,
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s",
        position: "relative",
        transform: hov ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hov ? "0 12px 36px rgba(0,0,0,0.07)" : "none",
      }}
    >
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{ position: "absolute", inset: 0, borderRadius: 14 }}
      />

      {popular && (
        <span
          style={{
            position: "absolute",
            top: -11,
            left: "2rem",
            fontFamily: "var(--mono)",
            fontSize: "0.63rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "white",
            background: t.accent,
            padding: "0.25rem 0.7rem",
            borderRadius: 4,
          }}
        >
          Most popular
        </span>
      )}

      <div
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          color: t.ink50,
          marginBottom: "0.5rem",
          fontWeight: 500,
        }}
      >
        {tier}
      </div>

      <div
        style={{
          fontFamily: "var(--serif)",
          fontSize: "3rem",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          lineHeight: 1.1,
          marginBottom: "0.3rem",
          color: t.ink,
        }}
      >
        {price === 0 ? "Free" : `$${price}`}
        {price > 0 && (
          <span
            style={{
              fontFamily: "var(--body)",
              fontSize: "0.9rem",
              fontWeight: 400,
              color: t.ink50,
            }}
          >
            /mo
          </span>
        )}
      </div>

      <p
        style={{
          fontSize: "0.85rem",
          color: t.ink50,
          marginBottom: "2rem",
          minHeight: 40,
          lineHeight: 1.6,
        }}
      >
        {blurb}
      </p>

      <ul
        style={{
          listStyle: "none",
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.55rem",
          marginBottom: "2rem",
          flex: 1,
        }}
      >
        {features.map((f, i) => (
          <li
            key={i}
            style={{
              fontSize: "0.84rem",
              color: t.ink50,
              paddingLeft: "1.4rem",
              position: "relative",
              lineHeight: 1.5,
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                fontFamily: "var(--mono)",
                color: t.ink20,
              }}
            >
              —
            </span>
            {f}
          </li>
        ))}
      </ul>

      <a
        href="/signup"
        style={{
          display: "block",
          width: "100%",
          padding: "0.7rem 1.5rem",
          borderRadius: 8,
          fontSize: "0.88rem",
          fontWeight: 600,
          fontFamily: "var(--body)",
          cursor: "pointer",
          textAlign: "center",
          position: "relative",
          zIndex: 1,
          transition: "all 0.25s",
          background: popular ? t.accent : "transparent",
          color: popular ? "white" : t.ink,
          border: popular ? "none" : `1.5px solid ${t.ink20}`,
          textDecoration: "none",
          boxSizing: "border-box",
        }}
        onMouseEnter={(e) => {
          if (popular) e.currentTarget.style.background = t.accentLight;
          else {
            e.currentTarget.style.borderColor = t.ink;
            e.currentTarget.style.background = t.ink04;
          }
        }}
        onMouseLeave={(e) => {
          if (popular) e.currentTarget.style.background = t.accent;
          else {
            e.currentTarget.style.borderColor = t.ink20;
            e.currentTarget.style.background = "transparent";
          }
        }}
      >
        {cta}
      </a>
    </FadeIn>
  );
}

export default function PricingSection() {
  return (
    <Section id="pricing">
      <FadeIn>
        <Eyebrow>Pricing</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Start free. <Italic>Upgrade&nbsp;when&nbsp;ready.</Italic>
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>Free tier included. Cancel anytime.</SubText>
      </FadeIn>

      <div
        className="grid-1-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.2rem",
        }}
      >
        {pricingPlans.map((plan, i) => (
          <PriceCard key={i} {...plan} delay={i * 0.06} />
        ))}
      </div>
    </Section>
  );
}
