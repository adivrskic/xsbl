import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { wcagCriteria, getCriteriaByPrinciple } from "../data/wcagCriteria";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

var PRINCIPLE_META = {
  Perceivable: {
    number: "1",
    description:
      "Information and user interface components must be presentable to users in ways they can perceive.",
    color: "#4338f0",
  },
  Operable: {
    number: "2",
    description: "User interface components and navigation must be operable.",
    color: "#1a8754",
  },
  Understandable: {
    number: "3",
    description:
      "Information and the operation of user interface must be understandable.",
    color: "#b45309",
  },
  Robust: {
    number: "4",
    description:
      "Content must be robust enough that it can be interpreted by a wide variety of user agents, including assistive technologies.",
    color: "#c0392b",
  },
};

function LevelBadge({ level }) {
  var bg =
    level === "A" ? "#4338f015" : level === "AA" ? "#1a875415" : "#b4530915";
  var color =
    level === "A" ? "#4338f0" : level === "AA" ? "#1a8754" : "#b45309";
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.56rem",
        fontWeight: 700,
        padding: "0.1rem 0.4rem",
        borderRadius: 3,
        background: bg,
        color: color,
        letterSpacing: "0.04em",
      }}
    >
      Level {level}
    </span>
  );
}

export default function WcagIndexPage() {
  var { t } = useTheme();
  var grouped = getCriteriaByPrinciple();
  var principles = ["Perceivable", "Operable", "Understandable", "Robust"];

  return (
    <div className="legal-page" style={{ maxWidth: 740 }}>
      <FadeIn>
        <div className="legal-page__eyebrow">
          <span className="legal-page__eyebrow-line" />
          WCAG 2.2 Reference
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="legal-page__title">WCAG 2.2 Success Criteria</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--ink50)",
            lineHeight: 1.7,
            marginBottom: "2rem",
          }}
        >
          Each page below explains a WCAG 2.2 success criterion, why it matters,
          common failures, and how to fix them. These are the criteria xsbl
          scans for automatically using axe-core in a real browser.
        </p>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div style={{ marginBottom: "1rem" }}>
          <Link
            to="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.4rem",
              padding: "0.55rem 1.2rem",
              borderRadius: 8,
              background: "var(--accent)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.88rem",
              textDecoration: "none",
            }}
          >
            Scan your site for these issues
          </Link>
        </div>
      </FadeIn>

      {principles.map(function (principle, pi) {
        var meta = PRINCIPLE_META[principle];
        var criteria = grouped[principle] || [];
        if (criteria.length === 0) return null;

        return (
          <FadeIn key={principle} delay={0.15 + pi * 0.04}>
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.4rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.66rem",
                    fontWeight: 700,
                    width: 22,
                    height: 22,
                    borderRadius: 5,
                    background: meta.color + "12",
                    color: meta.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {meta.number}
                </span>
                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.15rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: 0,
                  }}
                >
                  {principle}
                </h2>
              </div>
              <p
                style={{
                  fontSize: "0.82rem",
                  color: "var(--ink50)",
                  margin: "0 0 0.7rem",
                  lineHeight: 1.6,
                }}
              >
                {meta.description}
              </p>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.35rem",
                }}
              >
                {criteria.map(function (c) {
                  return (
                    <Link
                      key={c.slug}
                      to={"/wcag/" + c.slug}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.65rem 0.9rem",
                        borderRadius: 8,
                        border: "1px solid var(--ink08)",
                        background: "var(--card-bg)",
                        textDecoration: "none",
                        transition: "border-color 0.15s",
                      }}
                      onMouseEnter={function (e) {
                        e.currentTarget.style.borderColor = meta.color + "40";
                      }}
                      onMouseLeave={function (e) {
                        e.currentTarget.style.borderColor = "var(--ink08)";
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: meta.color,
                          width: 44,
                          flexShrink: 0,
                        }}
                      >
                        {c.id}
                      </span>
                      <span
                        style={{
                          flex: 1,
                          fontSize: "0.84rem",
                          fontWeight: 500,
                          color: "var(--ink)",
                        }}
                      >
                        {c.title}
                      </span>
                      <LevelBadge level={c.level} />
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        );
      })}
    </div>
  );
}
