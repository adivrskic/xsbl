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
import "./AgentSection.css";

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
  const Icon = iconMap[icon];

  return (
    <FadeIn delay={delay}>
      <div className="feature-card">
        <div className="feature-card__header">
          <span className="feature-card__icon">
            {Icon && <Icon size={16} color={t.accent} strokeWidth={2} />}
          </span>
          <h4 className="feature-card__title">{title}</h4>
        </div>
        <p className="feature-card__desc">{desc}</p>
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
          Everything you need to <Italic>fix accessibility</Italic>
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          Real browser scanning. AI-powered suggestions. Continuous monitoring.
          Not another overlay widget.
        </SubText>
      </FadeIn>
      <div className="grid-2-mobile agent-grid">
        {scanFeatures.map((f, i) => (
          <FeatureCard key={i} {...f} delay={0.1 + i * 0.04} />
        ))}
      </div>
    </Section>
  );
}
