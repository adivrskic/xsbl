import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import GitHubDemo from "./GitHubDemo";
import SimulatorSection from "./SimulatorSection";
import ScoreTimeline from "./ScoreTimeline";
import { GitPullRequest, Eye, TrendingUp } from "lucide-react";
import "./DemoSection.css";

var TABS = [
  {
    id: "timeline",
    label: "Score timeline",
    icon: TrendingUp,
    desc: "Watch a site go from 42 to 98 in 12 weeks",
  },
  {
    id: "github",
    label: "GitHub PRs",
    icon: GitPullRequest,
    desc: "See how fixes become pull requests",
  },
  {
    id: "simulator",
    label: "Vision simulator",
    icon: Eye,
    desc: "Preview through different impairments",
  },
];

export default function DemoSection() {
  var { t } = useTheme();
  var [activeTab, setActiveTab] = useState("timeline");

  var currentTab = TABS.find(function (tab) {
    return tab.id === activeTab;
  });

  return (
    <Section id="demos">
      <FadeIn>
        <Eyebrow>See it in action</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Interactive <Italic>demos</Italic> — no signup needed
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          {currentTab ? currentTab.desc : "Try the demos below."}
        </SubText>
      </FadeIn>

      {/* Tab bar */}
      <FadeIn delay={0.12}>
        <div className="demo-tabs">
          {TABS.map(function (tab) {
            var Icon = tab.icon;
            var active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={function () {
                  setActiveTab(tab.id);
                }}
                className={
                  "demo-tabs__btn" + (active ? " demo-tabs__btn--active" : "")
                }
              >
                <Icon size={15} strokeWidth={active ? 2 : 1.5} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Tab content — full width */}
      <div className="demo-body">
        <div className="demo-panel">
          {activeTab === "timeline" && <ScoreTimeline />}
          {activeTab === "github" && <GitHubDemo />}
          {activeTab === "simulator" && <SimulatorSection bare />}
        </div>
      </div>
    </Section>
  );
}
