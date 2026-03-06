import FadeIn from "./FadeIn";
import { Italic } from "./Typography";
import "./CtaSection.css";

export default function CtaSection() {
  return (
    <section className="cta-section">
      <div className="cta-section__glow" />

      <FadeIn>
        <div className="eyebrow">
          <span className="eyebrow-line" />
          Get started
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h2 className="cta-section__heading">
          Your users deserve a web that <Italic>works.</Italic>
        </h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="cta-section__sub">
          Connect your repo. Scan your site. Merge the fix PR. Accessible in
          minutes.
        </p>
      </FadeIn>

      <FadeIn delay={0.15} className="cta-section__buttons">
        <a href="/signup" className="cta-section__btn-primary">
          Start scanning free
        </a>
        <a href="/login" className="cta-section__btn-secondary">
          Log in to dashboard
        </a>
      </FadeIn>
    </section>
  );
}
