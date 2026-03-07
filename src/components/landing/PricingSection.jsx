import { pricingPlans } from "../../data/content";
import { useAuth } from "../../context/AuthContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import "./PricingSection.css";

var PLAN_ORDER = ["free", "starter", "pro", "agency"];

function PriceCard({
  tier,
  price,
  blurb,
  features,
  popular,
  cta,
  delay,
  user,
  currentPlan,
}) {
  var planKey = tier.toLowerCase();
  var isCurrent = user && currentPlan === planKey;
  var currentIdx = PLAN_ORDER.indexOf(currentPlan);
  var targetIdx = PLAN_ORDER.indexOf(planKey);
  var isUpgrade = targetIdx > currentIdx;
  var isDowngrade = targetIdx < currentIdx;

  var href = "/signup";
  var label = cta;

  if (user) {
    if (isCurrent) {
      href = "/dashboard";
      label = "Current plan";
    } else if (isUpgrade) {
      href = "/dashboard/billing";
      label = "Upgrade to " + tier;
    } else if (isDowngrade) {
      href = "/dashboard/billing";
      label = "Manage plan";
    }
  }

  return (
    <FadeIn delay={delay}>
      <div className={"price-card" + (popular ? " price-card--popular" : "")}>
        {popular && (
          <span className="price-card__popular-badge">Most popular</span>
        )}

        <div className="price-card__tier">{tier}</div>

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

        <a
          href={href}
          className={
            "price-card__cta" + (isCurrent ? " price-card__cta--current" : "")
          }
          style={
            isCurrent
              ? { opacity: 0.6, pointerEvents: "none" }
              : isDowngrade
              ? { opacity: 0.5 }
              : undefined
          }
        >
          {label}
        </a>
      </div>
    </FadeIn>
  );
}

export default function PricingSection() {
  var { user, org } = useAuth();
  var currentPlan = org?.plan || "free";

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
          <PriceCard
            key={i}
            {...plan}
            delay={i * 0.06}
            user={user}
            currentPlan={currentPlan}
          />
        ))}
      </div>
    </Section>
  );
}
