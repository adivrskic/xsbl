import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { getCriterionBySlug, wcagCriteria } from "../data/wcagCriteria";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

export default function WcagCriterionPage() {
  var { slug } = useParams();
  var { t } = useTheme();
  var criterion = getCriterionBySlug(slug);

  var criterionIndex = wcagCriteria.findIndex(function (c) {
    return c.slug === slug;
  });
  var prev = criterionIndex > 0 ? wcagCriteria[criterionIndex - 1] : null;
  var next =
    criterionIndex < wcagCriteria.length - 1
      ? wcagCriteria[criterionIndex + 1]
      : null;

  useEffect(
    function () {
      window.scrollTo(0, 0);
    },
    [slug]
  );

  // Inject structured data
  useEffect(
    function () {
      if (!criterion) return;
      var ld = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: "WCAG " + criterion.id + ": " + criterion.title,
        description: criterion.description,
        author: {
          "@type": "Organization",
          name: "xsbl",
          url: "https://xsbl.io",
        },
        publisher: {
          "@type": "Organization",
          name: "xsbl",
          url: "https://xsbl.io",
        },
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": "https://xsbl.io/wcag/" + criterion.slug,
        },
        proficiencyLevel: "Beginner",
        inLanguage: "en-US",
      };
      var script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = "wcag-structured-data";
      script.textContent = JSON.stringify(ld);
      var existing = document.getElementById("wcag-structured-data");
      if (existing) existing.remove();
      document.head.appendChild(script);
      return function () {
        var el = document.getElementById("wcag-structured-data");
        if (el) el.remove();
      };
    },
    [criterion, slug]
  );

  if (!criterion) {
    return (
      <div
        className="legal-page"
        style={{ textAlign: "center", paddingTop: "8rem" }}
      >
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          Criterion not found
        </h1>
        <Link
          to="/wcag"
          style={{ color: "var(--accent)", textDecoration: "none" }}
        >
          ← View all WCAG criteria
        </Link>
      </div>
    );
  }

  var levelColor =
    criterion.level === "A"
      ? "#4338f0"
      : criterion.level === "AA"
      ? "#1a8754"
      : "#b45309";

  var principleColor =
    criterion.principle === "Perceivable"
      ? "#4338f0"
      : criterion.principle === "Operable"
      ? "#1a8754"
      : criterion.principle === "Understandable"
      ? "#b45309"
      : "#c0392b";

  return (
    <div className="legal-page" style={{ maxWidth: 700 }}>
      <FadeIn>
        <Link
          to="/wcag"
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: "var(--ink50)",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            marginBottom: "1.5rem",
          }}
        >
          ← All WCAG criteria
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.72rem",
              fontWeight: 700,
              padding: "0.15rem 0.5rem",
              borderRadius: 4,
              background: principleColor + "12",
              color: principleColor,
            }}
          >
            {criterion.principle}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.66rem",
              color: "var(--ink50)",
            }}
          >
            {criterion.guideline}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.56rem",
              fontWeight: 700,
              padding: "0.1rem 0.4rem",
              borderRadius: 3,
              background: levelColor + "15",
              color: levelColor,
            }}
          >
            Level {criterion.level}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.56rem",
              color: "var(--ink50)",
            }}
          >
            WCAG {criterion.version}
          </span>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.2rem)",
            fontWeight: 700,
            color: "var(--ink)",
            lineHeight: 1.2,
            marginBottom: "0.4rem",
            letterSpacing: "-0.02em",
          }}
        >
          {criterion.id}: {criterion.title}
        </h1>
      </FadeIn>

      <FadeIn delay={0.08}>
        <p
          style={{
            fontSize: "1.05rem",
            color: "var(--ink50)",
            lineHeight: 1.75,
            marginBottom: "2rem",
            paddingBottom: "1.5rem",
            borderBottom: "1px solid var(--ink08)",
          }}
        >
          {criterion.description}
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="legal-page__body">
          {/* Why it matters */}
          <h2>Why this matters</h2>
          <p>{criterion.why}</p>

          {/* Common failures */}
          <h2>Common failures</h2>
          <p>
            These are the most frequent ways this criterion is violated in
            real-world websites:
          </p>
          <ul>
            {criterion.commonFailures.map(function (f, i) {
              return <li key={i}>{f}</li>;
            })}
          </ul>

          {/* How to fix */}
          <h2>How to fix</h2>
          <ul>
            {criterion.howToFix.map(function (f, i) {
              return <li key={i}>{f}</li>;
            })}
          </ul>

          {/* axe rules */}
          <h2>Related axe-core rules</h2>
          <p>
            xsbl uses axe-core to automatically detect violations of this
            criterion. The following rules are checked:
          </p>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.3rem",
              marginBottom: "1.2rem",
            }}
          >
            {criterion.axeRules.map(function (rule) {
              return (
                <span
                  key={rule}
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.68rem",
                    fontWeight: 600,
                    padding: "0.2rem 0.5rem",
                    borderRadius: 4,
                    background: "var(--accent-bg)",
                    color: "var(--accent)",
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 12%, transparent)",
                  }}
                >
                  {rule}
                </span>
              );
            })}
          </div>

          {/* CTA */}
          <div
            style={{
              padding: "1.5rem",
              borderRadius: 12,
              background: "var(--accent-bg)",
              border:
                "1px solid color-mix(in srgb, var(--accent) 10%, transparent)",
              textAlign: "center",
              marginTop: "2rem",
              marginBottom: "2rem",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1.1rem",
                fontWeight: 700,
                margin: "0 0 0.4rem",
                color: "var(--ink)",
              }}
            >
              Check your site for {criterion.id} violations
            </h3>
            <p
              style={{
                fontSize: "0.88rem",
                color: "var(--ink50)",
                margin: "0 0 1rem",
                lineHeight: 1.6,
              }}
            >
              xsbl scans your rendered pages in a real browser and finds
              violations of this criterion automatically.
            </p>
            <Link
              to="/"
              style={{
                display: "inline-block",
                padding: "0.65rem 1.5rem",
                borderRadius: 8,
                background: "var(--accent)",
                color: "white",
                fontWeight: 600,
                fontSize: "0.88rem",
                textDecoration: "none",
              }}
            >
              Scan your site free
            </Link>
          </div>

          {/* W3C reference */}
          <p style={{ fontSize: "0.82rem" }}>
            <strong>Official reference:</strong>{" "}
            <a
              href={
                "https://www.w3.org/WAI/WCAG22/Understanding/" +
                criterion.title
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")
                  .replace(/-+$/, "") +
                ".html"
              }
              target="_blank"
              rel="noopener noreferrer"
            >
              Understanding WCAG {criterion.id}: {criterion.title}
            </a>{" "}
            (W3C)
          </p>
        </div>
      </FadeIn>

      {/* Prev/Next navigation */}
      <FadeIn delay={0.15}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "2.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid var(--ink08)",
            gap: "1rem",
          }}
        >
          {prev ? (
            <Link
              to={"/wcag/" + prev.slug}
              style={{
                textDecoration: "none",
                fontSize: "0.82rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: "var(--ink50)",
                  marginBottom: "0.2rem",
                }}
              >
                ← Previous
              </div>
              <div style={{ color: "var(--accent)", fontWeight: 500 }}>
                {prev.id}: {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to={"/wcag/" + next.slug}
              style={{
                textDecoration: "none",
                fontSize: "0.82rem",
                textAlign: "right",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: "var(--ink50)",
                  marginBottom: "0.2rem",
                }}
              >
                Next →
              </div>
              <div style={{ color: "var(--accent)", fontWeight: 500 }}>
                {next.id}: {next.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
        </div>
      </FadeIn>
    </div>
  );
}
