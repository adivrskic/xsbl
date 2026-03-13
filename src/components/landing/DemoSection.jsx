import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import SegmentedControl from "./SegmentedControl";
import GitHubDemo from "./GitHubDemo";
import SimulatorSection from "./SimulatorSection";
import ScoreTimeline from "./ScoreTimeline";
import { GitPullRequest, Eye, TrendingUp } from "lucide-react";
import "./DemoSection.css";

var TABS = [
  { id: "github", label: "GitHub PRs", icon: GitPullRequest },
  { id: "simulator", label: "Vision simulator", icon: Eye },
  { id: "timeline", label: "Score timeline", icon: TrendingUp },
];

export default function DemoSection() {
  var { t } = useTheme();
  var [activeTab, setActiveTab] = useState("github");

  return (
    <Section id="demos">
      <FadeIn>
        <Eyebrow>Try it yourself</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          From scanned to <Italic>shipped</Italic> in minutes
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          Every feature below works on your real codebase. No demo accounts, no
          fake data.
        </SubText>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div className="demo-tabs-wrap">
          <SegmentedControl
            items={TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>
      </FadeIn>

      <div className="demo-body">
        <div className="demo-panel" key={activeTab}>
          {activeTab === "github" && <GitHubDemo />}
          {activeTab === "simulator" && <SimulatorSection bare />}
          {activeTab === "timeline" && <ScoreTimeline />}
        </div>
      </div>
    </Section>
  );
}
