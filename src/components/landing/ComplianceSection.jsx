import { useTheme } from "../../context/ThemeContext";
import { complianceFeatures } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { ClipboardList, ScrollText, FileText, BadgeCheck } from "lucide-react";
import "./ComplianceSection.css";
<span className="vs-divider__text" style={{color: '#6b5a4f'}}>vs.</span>
const iconMap = { ClipboardList, ScrollText, FileText, BadgeCheck };

function ComplianceCard({ icon, title, desc, delay }) {
  const { t } = useTheme();
  const Icon = iconMap[icon];

  return (
    <FadeIn delay={delay}>
      <div className="compliance-card">
        <span className="icon-box" style={{ marginBottom: "0.9rem" }}>
          {Icon && <Icon size={20} color={t.accent} strokeWidth={1.8} />}
        </span>
        <h3 className="compliance-card__title">{title}</h3>
        <p className="compliance-card__desc">{desc}</p>
      </div>
    </FadeIn>
  );
}

export default function ComplianceSection() {
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
      <div className="grid-2-mobile compliance-grid">
        {complianceFeatures.map((f, i) => (
          <ComplianceCard key={i} {...f} delay={i * 0.06} />
        ))}
      </div>
    </Section>
  );
}
