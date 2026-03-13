import { useTheme } from "../../context/ThemeContext";
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
  ClipboardList,
  ScrollText,
  GitPullRequest,
  Wrench,
  Users,
  AlertTriangle,
} from "lucide-react";
import "./FeatureGrid.css";

var features = [
  {
    title: "Real browser scanning",
    desc: "Full Chromium render — catches issues in SPAs, lazy-loaded content, and dynamic UI that static analyzers miss.",
    icon: Globe,
  },
  {
    title: "WCAG 2.2 AA + AAA",
    desc: "90+ axe-core rules covering contrast, alt text, ARIA, keyboard, forms, headings, landmarks, and more.",
    icon: ShieldCheck,
  },
  {
    title: "AI fix suggestions",
    desc: "Contextual code snippets generated from your actual markup. Not generic advice — real fixes you can paste.",
    icon: Lightbulb,
  },
  {
    title: "GitHub PRs",
    desc: "One-click pull requests with fixes. Bulk-fix up to 20 issues in a single PR. Review and merge.",
    icon: GitPullRequest,
  },
  {
    title: "Scheduled scans",
    desc: "Daily or weekly. Full multi-page crawl. Catch regressions before your users do.",
    icon: Clock,
  },
  {
    title: "Score tracking",
    desc: "Track your accessibility score over time. See trends, regressions, and improvements per page.",
    icon: BarChart3,
  },
  {
    title: "Smart alerts",
    desc: "Email + Slack when scans complete, critical issues appear, or your score drops below a threshold.",
    icon: Bell,
  },
  {
    title: "AI alt text",
    desc: "Vision AI describes your images in context — descriptions that make sense for your specific product.",
    icon: Image,
  },
  {
    title: "Compliance reports",
    desc: "PDF exports, VPAT generation, accessibility statements. White-label for agencies.",
    icon: ClipboardList,
  },
  {
    title: "Audit log",
    desc: "Timestamped history of every scan, fix, and status change. Exportable evidence for audits.",
    icon: ScrollText,
  },
  {
    title: "Free tools",
    desc: "Contrast checker, heading analyzer, alt text validator — no signup required.",
    icon: Wrench,
  },
  {
    title: "Team & agency",
    desc: "Multi-user workspaces, client dashboards, role-based access, scheduled reports.",
    icon: Users,
  },
];

function FeatureCard({ feature, delay }) {
  var { t } = useTheme();
  var Icon = feature.icon;

  return (
    <FadeIn delay={delay}>
      <div className="fg-card">
        <div className="fg-card__icon">
          <Icon size={18} color={t.accent} strokeWidth={1.8} />
        </div>
        <h3 className="fg-card__title">{feature.title}</h3>
        <p className="fg-card__desc">{feature.desc}</p>
      </div>
    </FadeIn>
  );
}

export default function FeatureGrid() {
  return (
    <Section id="features">
      <FadeIn>
        <Eyebrow>Everything you need</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          One tool to <Italic>find</Italic>, <Italic>fix</Italic>, and{" "}
          <Italic>prove</Italic> accessibility
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          From first scan to full compliance — replace your patchwork of tools
          with one platform that handles the entire workflow.
        </SubText>
      </FadeIn>
      <div className="fg-grid">
        {features.map(function (f, i) {
          return <FeatureCard key={i} feature={f} delay={0.08 + i * 0.03} />;
        })}
      </div>
    </Section>
  );
}
