import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { Eye, Lock, ArrowRight, Search, Circle, Minus } from "lucide-react";

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
function DemoSite({ filter, t }) {
  var style = {};
  if (filter) {
    if (filter.indexOf("blur") !== -1) {
      style.filter = filter;
    } else {
      style.filter = filter;
    }
  }

  return (
    <div
      style={{
        borderRadius: 10,
        overflow: "hidden",
        background: t.cardBg,
        border: "1px solid " + t.ink08,
        transition: "filter 0.4s ease",
        ...style,
      }}
    >
      {/* Nav bar */}
      <div
        style={{
          padding: "0.6rem 1rem",
          display: "flex",
          alignItems: "center",
          gap: "0.6rem",
          borderBottom: "1px solid " + t.ink08,
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: t.accent,
          }}
        />
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.65rem",
            fontWeight: 600,
            color: t.ink,
          }}
        >
          acme.com
        </span>
        <div style={{ flex: 1 }} />
        <div style={{ display: "flex", gap: "0.8rem" }}>
          {["Products", "About", "Contact"].map(function (l) {
            return (
              <span
                key={l}
                style={{
                  fontFamily: "var(--body)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                }}
              >
                {l}
              </span>
            );
          })}
        </div>
      </div>
      {/* Hero area */}
      <div style={{ padding: "1.5rem 1.2rem 1rem" }}>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: t.ink,
            marginBottom: "0.4rem",
            lineHeight: 1.3,
          }}
        >
          Build something beautiful
        </div>
        <div
          style={{
            fontSize: "0.72rem",
            color: t.ink50,
            lineHeight: 1.6,
            marginBottom: "0.8rem",
          }}
        >
          The platform for modern teams to ship faster and build better
          products.
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <div
            style={{
              padding: "0.35rem 0.8rem",
              borderRadius: 6,
              background: t.accent,
              color: "white",
              fontSize: "0.62rem",
              fontWeight: 600,
            }}
          >
            Get started
          </div>
          <div
            style={{
              padding: "0.35rem 0.8rem",
              borderRadius: 6,
              border: "1px solid " + t.ink20,
              color: t.ink50,
              fontSize: "0.62rem",
              fontWeight: 600,
            }}
          >
            Learn more
          </div>
        </div>
      </div>
      {/* Feature cards */}
      <div
        style={{
          padding: "0 1.2rem 1.2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.5rem",
        }}
      >
        {[
          { label: "Analytics", color: t.accent },
          { label: "Security", color: t.green },
          { label: "Speed", color: t.amber },
        ].map(function (card) {
          return (
            <div
              key={card.label}
              style={{
                padding: "0.6rem",
                borderRadius: 6,
                background: card.color + "08",
                border: "1px solid " + card.color + "15",
              }}
            >
              <div
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 4,
                  background: card.color + "20",
                  marginBottom: "0.3rem",
                }}
              />
              <div
                style={{ fontSize: "0.58rem", fontWeight: 600, color: t.ink }}
              >
                {card.label}
              </div>
              <div
                style={{
                  fontSize: "0.5rem",
                  color: t.ink50,
                  marginTop: "0.15rem",
                }}
              >
                Real-time data
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SimulatorSection() {
  const { t } = useTheme();
  const { user } = useAuth();
  const [active, setActive] = useState("normal");

  var activeMode =
    DEMO_MODES.find(function (m) {
      return m.id === active;
    }) || DEMO_MODES[0];

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow background — full width */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${t.accent}12 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "15%",
          left: "30%",
          width: "40vw",
          height: "40vw",
          maxWidth: 600,
          maxHeight: 600,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`,
          filter: "blur(30px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "30%",
          right: "30%",
          width: "35vw",
          height: "35vw",
          maxWidth: 400,
          maxHeight: 400,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${t.accentLight}15 0%, transparent 70%)`,
          filter: "blur(30px)",
          pointerEvents: "none",
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

        <div
          className="hero-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 460px",
            gap: "3rem",
            alignItems: "center",
          }}
        >
          {/* Left — feature description */}
          <FadeIn delay={0.15}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
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
                    <div
                      style={{
                        display: "flex",
                        gap: "0.8rem",
                        alignItems: "flex-start",
                      }}
                    >
                      <span
                        style={{
                          width: 32,
                          height: 32,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: 8,
                          background: t.accentBg,
                          flexShrink: 0,
                        }}
                      >
                        <Eye size={17} color={t.accent} strokeWidth={1.8} />
                      </span>
                      <div>
                        <h4
                          style={{
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: t.ink,
                            margin: "0 0 0.2rem 0",
                          }}
                        >
                          {feat.title}
                        </h4>
                        <p
                          style={{
                            fontSize: "0.82rem",
                            color: t.ink50,
                            lineHeight: 1.6,
                            margin: 0,
                          }}
                        >
                          {feat.desc}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                );
              })}

              {/* CTA */}
              <FadeIn delay={0.4}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <a
                    href={user ? "/dashboard/sites" : "/signup"}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      padding: "0.55rem 1.2rem",
                      borderRadius: 8,
                      background: t.accent,
                      color: "white",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {user ? "Open simulator" : "Try the simulator"}{" "}
                    <ArrowRight size={14} />
                  </a>
                  {!user && (
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.6rem",
                        color: t.ink50,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Lock size={10} /> Pro & Agency plans
                    </span>
                  )}
                </div>
              </FadeIn>
            </div>
          </FadeIn>

          {/* Right — interactive demo */}
          <FadeIn delay={0.2}>
            <div style={{ position: "relative" }}>
              {/* Mode selector pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.3rem",
                  marginBottom: "0.8rem",
                }}
              >
                {DEMO_MODES.map(function (mode) {
                  var isActive = active === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={function () {
                        setActive(mode.id);
                      }}
                      style={{
                        padding: "0.35rem 0.6rem",
                        borderRadius: 6,
                        border:
                          "1px solid " + (isActive ? t.accent + "40" : t.ink08),
                        background: isActive ? t.accentBg : "transparent",
                        color: isActive ? t.accent : t.ink50,
                        fontFamily: "var(--mono)",
                        fontSize: "0.58rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        transition: "all 0.2s",
                      }}
                    >
                      <span
                        style={{ display: "inline-flex", alignItems: "center" }}
                      >
                        {mode.icon}
                      </span>
                      {mode.name}
                    </button>
                  );
                })}
              </div>

              {/* Demo site with filter */}
              <DemoSite filter={activeMode.color} t={t} />

              {/* Active mode label */}
              <div
                style={{
                  marginTop: "0.6rem",
                  textAlign: "center",
                  fontFamily: "var(--mono)",
                  fontSize: "0.66rem",
                  color: t.ink50,
                }}
              >
                {activeMode.icon} Viewing as:{" "}
                <span style={{ color: t.accent, fontWeight: 600 }}>
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
