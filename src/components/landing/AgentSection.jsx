import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { scanFeatures } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import {
  Globe,
  ShieldCheck,
  Lightbulb,
  Clock,
  BarChart3,
  FileText,
  Image,
  Bell,
} from "lucide-react";

const iconMap = {
  Globe,
  ShieldCheck,
  Lightbulb,
  Clock,
  BarChart3,
  FileText,
  Image,
  Bell,
};

function FeatureCard({ icon, title, desc, delay }) {
  const { t } = useTheme();
  const [hov, setHov] = useState(false);
  const Icon = iconMap[icon];

  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: "1.4rem 1.3rem",
          borderRadius: 10,
          border: `1px solid ${hov ? t.accent : t.ink08}`,
          background: hov ? t.cardBg : "transparent",
          transition: "all 0.25s",
          cursor: "default",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            marginBottom: "0.5rem",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 7,
              background: t.accentBg,
              flexShrink: 0,
            }}
          >
            {Icon && <Icon size={16} color={t.accent} strokeWidth={2} />}
          </span>
          <h4
            style={{
              fontSize: "0.88rem",
              fontWeight: 600,
              color: t.ink,
              lineHeight: 1.25,
              margin: 0,
            }}
          >
            {title}
          </h4>
        </div>
        <p
          style={{
            fontSize: "0.8rem",
            color: t.ink50,
            lineHeight: 1.6,
            margin: 0,
            marginTop: "0.2rem",
          }}
        >
          {desc}
        </p>
      </div>
    </FadeIn>
  );
}

export default function AgentSection() {
  return (
    <Section id="features">
      <FadeIn>
        <Eyebrow>Features</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Everything you need to <Italic>actually</Italic> fix accessibility
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          Real browser scanning. AI-powered suggestions. Continuous monitoring.
          Not another overlay widget.
        </SubText>
      </FadeIn>
      <div
        className="grid-2-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.7rem",
        }}
      >
        {scanFeatures.map((f, i) => (
          <FeatureCard key={i} {...f} delay={0.1 + i * 0.04} />
        ))}
      </div>
    </Section>
  );
}
