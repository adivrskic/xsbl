import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { Eye, Lock, ArrowRight, Search, Circle, Minus } from "lucide-react";
import "./SimulatorSection.css";

/* Static demo of vision modes — no real screenshot needed */
var DEMO_MODES = [
  { id: "normal", name: "Normal vision", icon: <Eye size={14} />, color: null },
  {
    id: "protanopia",
    name: "Protanopia",
    icon: <Circle size={12} fill="#ef4444" stroke="none" />,
    color: "grayscale(0.3) sepia(0.4) hue-rotate(-20deg) saturate(0.7)",
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia",
    icon: <Circle size={12} fill="#22c55e" stroke="none" />,
    color: "grayscale(0.2) sepia(0.3) hue-rotate(-40deg) saturate(0.8)",
  },
  {
    id: "tritanopia",
    name: "Tritanopia",
    icon: <Circle size={12} fill="#3b82f6" stroke="none" />,
    color: "grayscale(0.2) sepia(0.5) hue-rotate(30deg) saturate(0.7)",
  },
  {
    id: "achromatopsia",
    name: "Achromatopsia",
    icon: <Circle size={12} fill="#374151" stroke="none" />,
    color: "grayscale(1)",
  },
  {
    id: "blurred",
    name: "Low vision",
    icon: <Search size={14} />,
    color: "blur(2px)",
  },
];

/* A fake "website" card to apply filters to */
function DemoSite({ t }) {
  return (
    <div className="sim-site" role="img" aria-label="Website preview">
      {/* Nav bar */}
      <div className="sim-site__nav">
        <div className="sim-site__dot" />
        <span className="sim-site__brand">acme.com</span>
        <div className="sim-site__spacer" />
        <div className="sim-site__links">
          {["Products", "About", "Contact"].map(function (l) {
            return (
              <span key={l} className="sim-site__link">
                {l}
              </span>
            );
          })}
        </div>
      </div>
      {/* Hero area */}
      <div className="sim-site__hero">
        <div className="sim-site__title">Build something beautiful</div>
        <div className="sim-site__text">
          The platform for modern teams to ship faster and build better
          products.
        </div>
        <div className="sim-site__btns">
          <div className="sim-site__btn-primary">Get started</div>
          <div className="sim-site__btn-secondary">Learn more</div>
        </div>
      </div>
      {/* Feature cards — colors are dynamic so stay inline */}
      <div className="sim-site__cards">
        {[
          { label: "Analytics", color: t.accent },
          { label: "Security", color: t.green },
          { label: "Speed", color: t.amber },
        ].map(function (card) {
          return (
            <div
              key={card.label}
              className="sim-site__card"
              style={{
                background: card.color + "08",
                border: "1px solid " + card.color + "15",
              }}
            >
              <div
                className="sim-site__card-icon"
                style={{ background: card.color + "20" }}
              />
              <div className="sim-site__card-label">{card.label}</div>
              <div className="sim-site__card-sub">Real-time data</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SimulatorSection() {
  var { t } = useTheme();
  var { user } = useAuth();
  var [active, setActive] = useState("normal");

  var activeMode =
    DEMO_MODES.find(function (m) {
      return m.id === active;
    }) || DEMO_MODES[0];
  var sectionFilter = activeMode.color
    ? { filter: activeMode.color, transition: "filter 0.4s ease" }
    : { transition: "filter 0.4s ease" };

  return (
    <div
      className="sim-wrapper"
      style={sectionFilter}
      aria-label={
        activeMode.color
          ? "Section simulating " + activeMode.name + " vision"
          : undefined
      }
    >
      {/* Glow background — colors need theme vars inline */}
      <div
        className="sim-glow"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, " +
            t.accent +
            "12 0%, transparent 70%)",
        }}
      />
      <div
        className="sim-glow-orb sim-glow-orb--primary"
        style={{
          background:
            "radial-gradient(circle, " + t.accent + "22 0%, transparent 70%)",
        }}
      />
      <div
        className="sim-glow-orb sim-glow-orb--secondary"
        style={{
          background:
            "radial-gradient(circle, " +
            (t.accentLight || t.accent) +
            "15 0%, transparent 70%)",
        }}
      />

      <Section id="simulator">
        <FadeIn>
          <Eyebrow>Accessibility simulator</Eyebrow>
        </FadeIn>
        <FadeIn delay={0.05}>
          <H2>
            See through your <Italic>users' eyes.</Italic>
          </H2>
        </FadeIn>
        <FadeIn delay={0.1}>
          <SubText>
            Preview how your site looks to people with color blindness, low
            vision, and other visual conditions. Catch contrast issues before
            your users do.
          </SubText>
        </FadeIn>

        <div className="sim-layout">
          {/* Left — feature description */}
          <FadeIn delay={0.15}>
            <div className="sim-features">
              {[
                {
                  title: "8 vision conditions",
                  desc: "Protanopia, deuteranopia, tritanopia, achromatopsia, cataracts, low vision blur, and more — scientifically accurate simulation matrices.",
                },
                {
                  title: "Real screenshot rendering",
                  desc: "We capture your actual site in a real browser, then apply vision filters. See exactly what your users see — not a mockup.",
                },
                {
                  title: "Issue overlay",
                  desc: "Toggle accessibility issues on top of the simulation. See which contrast failures actually affect users under different conditions.",
                },
              ].map(function (feat, i) {
                return (
                  <FadeIn key={i} delay={0.2 + i * 0.05}>
                    <div className="sim-feat">
                      <span className="sim-feat__icon">
                        <Eye size={17} color={t.accent} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h3 className="sim-feat__title">{feat.title}</h3>
                        <p className="sim-feat__desc">{feat.desc}</p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}

              {/* CTA */}
              <FadeIn delay={0.4}>
                <div className="sim-cta">
                  <a
                    href={user ? "/dashboard/sites" : "/signup"}
                    className="sim-cta__btn"
                  >
                    {user ? "Open simulator" : "Try the simulator"}{" "}
                    <ArrowRight size={14} />
                  </a>
                  {!user && (
                    <span className="sim-cta__badge">
                      <Lock size={10} /> Pro & Agency plans
                    </span>
                  )}
                </div>
              </FadeIn>
            </div>
          </FadeIn>

          {/* Right — interactive demo */}
          <FadeIn delay={0.2}>
            <div className="sim-demo">
              {/* Mode selector pills */}
              <div
                className="sim-modes"
                role="radiogroup"
                aria-label="Vision simulation mode"
              >
                {DEMO_MODES.map(function (mode) {
                  var isActive = active === mode.id;
                  return (
                    <button
                      key={mode.id}
                      role="radio"
                      aria-checked={isActive}
                      onClick={function () {
                        setActive(mode.id);
                      }}
                      className={
                        "sim-mode-btn" +
                        (isActive ? " sim-mode-btn--active" : "")
                      }
                    >
                      <span className="sim-mode-btn__icon">{mode.icon}</span>
                      {mode.name}
                    </button>
                  );
                })}
              </div>

              {/* Demo site with filter */}
              <DemoSite t={t} />

              {/* Active mode label */}
              <div className="sim-active-label" aria-live="polite">
                Viewing as:{" "}
                <span className="sim-active-label__name">
                  {activeMode.name}
                </span>
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>
    </div>
  );
}
