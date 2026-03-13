import { useState, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { Eye, Lock, ArrowRight, Search, Circle } from "lucide-react";
import SegmentedControl from "./SegmentedControl";
import "./SimulatorSection.css";

var DEMO_MODES = [
  {
    id: "normal",
    name: "Normal vision",
    label: "Normal",
    icon: <Eye size={14} />,
    iconElement: <Eye size={11} />,
    type: "none",
  },

  // Color vision deficiencies
  {
    id: "protanopia",
    name: "Protanopia (no red)",
    label: "No red",
    icon: <Circle size={12} fill="#ef4444" stroke="none" />,
    iconElement: <Circle size={8} fill="#ef4444" stroke="none" />,
    type: "color",
  },
  {
    id: "deuteranopia",
    name: "Deuteranopia (no green)",
    label: "No green",
    icon: <Circle size={12} fill="#22c55e" stroke="none" />,
    iconElement: <Circle size={8} fill="#22c55e" stroke="none" />,
    type: "color",
  },
  {
    id: "tritanopia",
    name: "Tritanopia (no blue)",
    label: "No blue",
    icon: <Circle size={12} fill="#3b82f6" stroke="none" />,
    iconElement: <Circle size={8} fill="#3b82f6" stroke="none" />,
    type: "color",
  },
  {
    id: "achromatopsia",
    name: "Achromatopsia (no color)",
    label: "No color",
    icon: <Circle size={12} fill="#374151" stroke="none" />,
    iconElement: <Circle size={8} fill="#374151" stroke="none" />,
    type: "color",
  },
  // Low-vision / blur
  {
    id: "low-vision",
    name: "Low vision (blur)",
    label: "Blur",
    icon: <Search size={14} />,
    iconElement: <Search size={11} />,
    type: "blur",
  },
  {
    id: "cataracts",
    name: "Cataracts (cloudy)",
    label: "Cataracts",
    icon: <Search size={14} />,
    iconElement: <Search size={11} />,
    type: "contrast",
  },
];

/**
 * Fixed intensity = 1 for each mode
 */
function getFilterForMode(modeId) {
  var i = 1; // Fixed at full strength

  switch (modeId) {
    case "protanopia":
      return "grayscale(0.7) sepia(0.8) hue-rotate(-25deg) saturate(0.7) contrast(0.9)";
    case "deuteranopia":
      return "grayscale(0.5) sepia(0.6) hue-rotate(-40deg) saturate(0.75) contrast(0.95)";
    case "tritanopia":
      return "grayscale(0.5) sepia(0.7) hue-rotate(35deg) saturate(0.8) contrast(0.95)";
    case "achromatopsia":
      return "grayscale(0.9) contrast(0.8)";
    case "low-vision":
      return "blur(3px) contrast(0.75)";
    case "cataracts":
      return "blur(2px) contrast(0.6) brightness(1.1) sepia(0.2)";

    case "normal":
    default:
      return "none";
  }
}

function DemoSite(props) {
  var t = props.t;
  return (
    <div className="sim-site" role="img" aria-label="Website preview">
      <div className="sim-site__nav">
        <div className="sim-site__dot" />
        <span className="sim-site__brand">acme.com</span>
        <div className="sim-site__spacer" />
        <div className="sim-site__links">
          {["Products", "Pricing", "Status", "Docs"].map(function (l) {
            return (
              <span key={l} className="sim-site__link">
                {l}
              </span>
            );
          })}
        </div>
      </div>

      <div className="sim-site__hero">
        <div className="sim-site__eyebrow">For product teams</div>
        <div className="sim-site__title">Ship accessible UIs faster</div>
        <div className="sim-site__text">
          The platform for modern teams to ship faster and build better
          products, without leaving accessibility to chance.
        </div>
        <div className="sim-site__btns">
          <div className="sim-site__btn-primary">Get started</div>
          <div className="sim-site__btn-secondary">View contrast report</div>
        </div>
      </div>

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

export default function SimulatorSection({ bare }) {
  var { t } = useTheme();
  var { user } = useAuth();

  var [active, setActive] = useState("normal");

  var activeMode =
    DEMO_MODES.find(function (m) {
      return m.id === active;
    }) || DEMO_MODES[0];

  var filter = useMemo(
    function () {
      return getFilterForMode(activeMode.id);
    },
    [activeMode.id]
  );

  var sectionFilterStyle =
    filter && filter !== "none"
      ? { filter: filter, transition: "filter 0.4s ease" }
      : { transition: "filter 0.4s ease" };

  var isNormal = activeMode.id === "normal";

  return (
    <div
      className="sim-wrapper"
      style={sectionFilterStyle}
      aria-label={
        !isNormal
          ? "Section simulating " + activeMode.name + " vision"
          : undefined
      }
    >
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

      <Section id={bare ? undefined : "simulator"}>
        {!bare && (
          <>
            <FadeIn>
              <Eyebrow>Accessibility simulator</Eyebrow>
            </FadeIn>
            <FadeIn delay={0.05}>
              <H2>
                See through your <Italic>users&apos; eyes.</Italic>
              </H2>
            </FadeIn>
            <FadeIn delay={0.1}>
              <SubText>
                Preview how your site looks to people with different types of
                color blindness and low vision. Catch contrast issues before
                your users do.
              </SubText>
            </FadeIn>
          </>
        )}

        <div className="sim-layout">
          <FadeIn delay={0.15}>
            <div className="sim-features">
              {[
                {
                  title: "Common vision conditions",
                  desc: "Simulate protanopia, deuteranopia, tritanopia, achromatopsia, low vision blur, and cataracts.",
                },
                {
                  title: "Real browser rendering",
                  desc: "See exactly what your users see — not just a mockup. Real typography, anti-aliasing, and spacing preserved.",
                },
                {
                  title: "Spot issues instantly",
                  desc: "Quickly identify where color is doing too much work and where contrast needs improvement.",
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

          <FadeIn delay={0.2}>
            <div className="sim-demo">
              <div
                className="sim-modes-wrap"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginBottom: "0.8rem",
                }}
              >
                <SegmentedControl
                  items={DEMO_MODES.map(function (m) {
                    return {
                      id: m.id,
                      label: m.label,
                      iconElement: m.iconElement,
                    };
                  })}
                  value={active}
                  onChange={setActive}
                  size="sm"
                />
              </div>

              <DemoSite t={t} />

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
