import { howSteps } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import "./HowSection.css";

export default function HowSection() {
  return (
    <Section id="how">
      <FadeIn>
        <Eyebrow>How it works</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Three steps to <Italic>truly</Italic> accessible code
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          Paste a URL. See every issue. Get code fixes you can copy and paste.
          Or scan and generate PRs on every deploy.
        </SubText>
      </FadeIn>

      <div className="grid-1-mobile how-grid">
        {howSteps.map((step, i) => (
          <FadeIn key={i} delay={i * 0.08}>
            <div className="how-cell">
              <div className="how-cell__number">{step.n}</div>
              <h3 className="how-cell__title">{step.title}</h3>
              <p className="how-cell__desc">{step.desc}</p>
              <span className="how-cell__tag">{step.tag}</span>
            </div>
          </FadeIn>
        ))}
      </div>
    </Section>
  );
}
