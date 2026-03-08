import { pricingPlans } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import "./PricingSection.css";

function PriceCard({ tier, price, blurb, features, popular, cta, delay }) {
  var isAgency = tier.toLowerCase() === "agency";
  var href = isAgency ? "/agency" : "/signup";
  return (
    <FadeIn delay={delay}>
      <div className={"price-card" + (popular ? " price-card--popular" : "")}>
        {popular && (
          <span className="price-card__popular-badge">Most popular</span>
        )}

        <h3 className="price-card__tier">{tier}</h3>

        <div className="price-card__price">
          {price === 0 ? "Free" : `$${price}`}
          {price > 0 && <span className="price-card__period">/mo</span>}
        </div>

        <p className="price-card__blurb">{blurb}</p>

        <ul className="price-card__features">
          {features.map((f, i) => (
            <li key={i} className="price-card__feature">
              {f}
            </li>
          ))}
        </ul>

        <a href={href} className="price-card__cta">
          {cta}
        </a>
      </div>
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

      <div className="grid-1-mobile pricing-grid">
        {pricingPlans.map((plan, i) => (
          <PriceCard key={i} {...plan} delay={i * 0.06} />
        ))}
      </div>
    </Section>
  );
}
