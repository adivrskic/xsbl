import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { complianceFeatures } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { ClipboardList, ScrollText, FileText, BadgeCheck } from "lucide-react";

const iconMap = { ClipboardList, ScrollText, FileText, BadgeCheck };

function ComplianceCard({ icon, title, desc, delay }) {
  const { t } = useTheme();
  const [hov, setHov] = useState(false);
  const Icon = iconMap[icon];

  return (
    <FadeIn delay={delay}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          padding: "1.6rem 1.4rem",
          background: hov ? t.paperWarm : t.paper,
          transition: "background 0.3s",
          height: "100%",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: 8,
            background: t.accentBg,
            marginBottom: "0.9rem",
          }}
        >
          {Icon && <Icon size={20} color={t.accent} strokeWidth={1.8} />}
        </span>
        <h4
          style={{
            fontSize: "0.95rem",
            fontWeight: 600,
            color: t.ink,
            marginBottom: "0.35rem",
          }}
        >
          {title}
        </h4>
        <p
          style={{
            fontSize: "0.8rem",
            color: t.ink50,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          {desc}
        </p>
      </div>
    </FadeIn>
  );
}

export default function ComplianceSection() {
  const { t } = useTheme();

  return (
    <Section>
      <FadeIn>
        <Eyebrow>Trust & compliance</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Built for <Italic>audits</Italic>, not just developers
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          When procurement teams ask for proof of accessibility compliance,
          you'll have it. Exportable evidence, generated automatically.
        </SubText>
      </FadeIn>
      <div
        className="grid-2-mobile"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: t.ink08,
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {complianceFeatures.map((f, i) => (
          <ComplianceCard key={i} {...f} delay={i * 0.06} />
        ))}
      </div>
    </Section>
  );
}
