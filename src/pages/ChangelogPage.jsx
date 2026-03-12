import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { changelog } from "../data/changelog";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

var TAG_CONFIG = {
  new: { label: "New", bg: "#4338f015", color: "#4338f0" },
  improved: { label: "Improved", bg: "#1a875415", color: "#1a8754" },
  fixed: { label: "Fixed", bg: "#b4530915", color: "#b45309" },
  breaking: { label: "Breaking", bg: "#c0392b15", color: "#c0392b" },
};

var TYPE_CONFIG = {
  major: { label: "Major", color: "#4338f0" },
  minor: { label: "Minor", color: "#1a8754" },
  patch: { label: "Patch", color: "#999" },
};

function formatDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function Tag({ tag }) {
  var config = TAG_CONFIG[tag];
  if (!config) return null;
  return (
    <span
      style={{
        fontFamily: "var(--mono)",
        fontSize: "0.52rem",
        fontWeight: 700,
        padding: "0.1rem 0.35rem",
        borderRadius: 3,
        background: config.bg,
        color: config.color,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        flexShrink: 0,
      }}
    >
      {config.label}
    </span>
  );
}

export default function ChangelogPage() {
  var { t } = useTheme();
  var [filter, setFilter] = useState("all");

  var filters = [
    { id: "all", label: "All" },
    { id: "new", label: "New" },
    { id: "improved", label: "Improved" },
    { id: "fixed", label: "Fixed" },
  ];

  return (
    <div className="legal-page" style={{ maxWidth: 700 }}>
      <FadeIn>
        <div className="legal-page__eyebrow">
          <span className="legal-page__eyebrow-line" />
          Product updates
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="legal-page__title">Changelog</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p
          style={{
            fontSize: "1rem",
            color: "var(--ink50)",
            lineHeight: 1.7,
            marginBottom: "1.5rem",
          }}
        >
          New features, improvements, and fixes to xsbl. We ship continuously —
          this page tracks every notable change.
        </p>
      </FadeIn>

      {/* Filter pills */}
      <FadeIn delay={0.12}>
        <div
          style={{
            display: "flex",
            gap: "0.3rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          {filters.map(function (f) {
            var active = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={function () {
                  setFilter(f.id);
                }}
                style={{
                  padding: "0.35rem 0.8rem",
                  borderRadius: 6,
                  border:
                    "1.5px solid " +
                    (active ? "var(--accent)" : "var(--ink08)"),
                  background: active ? "var(--accent-bg)" : "none",
                  color: active ? "var(--accent)" : "var(--ink50)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.66rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </FadeIn>

      {/* Timeline */}
      <div style={{ position: "relative" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: 11,
            top: 8,
            bottom: 8,
            width: 2,
            background: "var(--ink08)",
            borderRadius: 1,
          }}
        />

        {changelog.map(function (release, ri) {
          var typeConfig = TYPE_CONFIG[release.type] || TYPE_CONFIG.minor;

          // Filter items
          var visibleItems =
            filter === "all"
              ? release.items
              : release.items.filter(function (item) {
                  return item.tag === filter;
                });

          if (visibleItems.length === 0) return null;

          return (
            <FadeIn key={release.version} delay={0.14 + ri * 0.03}>
              <div
                style={{
                  position: "relative",
                  paddingLeft: 36,
                  paddingBottom: ri < changelog.length - 1 ? "2rem" : "0.5rem",
                }}
              >
                {/* Timeline dot */}
                <div
                  style={{
                    position: "absolute",
                    left: 4,
                    top: 6,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: "var(--paper)",
                    border: "3px solid " + typeConfig.color,
                    zIndex: 1,
                  }}
                />

                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    marginBottom: "0.35rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: typeConfig.color,
                    }}
                  >
                    v{release.version}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.62rem",
                      color: "var(--ink50)",
                    }}
                  >
                    {formatDate(release.date)}
                  </span>
                </div>

                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: "var(--ink)",
                    margin: "0 0 0.6rem",
                    lineHeight: 1.3,
                  }}
                >
                  {release.title}
                </h2>

                {/* Items */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.3rem",
                  }}
                >
                  {visibleItems.map(function (item, ii) {
                    return (
                      <div
                        key={ii}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                          padding: "0.4rem 0.6rem",
                          borderRadius: 6,
                          background: "var(--card-bg)",
                          border: "1px solid var(--ink04)",
                        }}
                      >
                        {item.tag && <Tag tag={item.tag} />}
                        <span
                          style={{
                            fontSize: "0.84rem",
                            color: "var(--ink)",
                            lineHeight: 1.5,
                          }}
                        >
                          {item.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <FadeIn delay={0.3}>
        <div
          style={{
            marginTop: "3rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--ink08)",
            textAlign: "center",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.15rem",
              fontWeight: 700,
              color: "var(--ink)",
              margin: "0 0 0.5rem",
            }}
          >
            Ship accessible products
          </h3>
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--ink50)",
              margin: "0 0 1rem",
              lineHeight: 1.6,
            }}
          >
            Start scanning your site for WCAG 2.2 violations in under 30
            seconds. Free tier included.
          </p>
          <Link
            to="/signup"
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
            Get started free
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
