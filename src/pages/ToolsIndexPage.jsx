import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Palette, ListTree, Image, ArrowRight } from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

var tools = [
  {
    slug: "contrast-checker",
    title: "Color Contrast Checker",
    description:
      "Test any two colors against WCAG 2.2 contrast requirements. See if your text passes Level AA and AAA for normal and large text.",
    icon: Palette,
    color: "#4338f0",
    keywords: "WCAG 1.4.3 · WCAG 1.4.6 · Contrast ratio",
  },
  {
    slug: "heading-checker",
    title: "Heading Structure Analyzer",
    description:
      "Paste your page HTML and see the heading hierarchy. Catches skipped levels, missing H1s, and structural issues.",
    icon: ListTree,
    color: "#1a8754",
    keywords: "WCAG 1.3.1 · Semantic structure · H1–H6",
  },
  {
    slug: "alt-text-checker",
    title: "Alt Text Checker",
    description:
      "Paste HTML to find images missing alt text, empty alts on informational images, and decorative images that should be hidden.",
    icon: Image,
    color: "#b45309",
    keywords: "WCAG 1.1.1 · Non-text content · Screen readers",
  },
];

export default function ToolsIndexPage() {
  var { t } = useTheme();

  return (
    <div className="legal-page" style={{ maxWidth: 700 }}>
      <FadeIn>
        <div className="legal-page__eyebrow">
          <span className="legal-page__eyebrow-line" />
          Free tools
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="legal-page__title">Accessibility Tools</h1>
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
          Free, instant, no-signup tools to check your site's accessibility.
          Each tool runs entirely in your browser — no data is sent to any
          server.
        </p>
      </FadeIn>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.8rem",
          marginBottom: "3rem",
        }}
      >
        {tools.map(function (tool, i) {
          var Icon = tool.icon;
          return (
            <FadeIn key={tool.slug} delay={0.12 + i * 0.04}>
              <Link
                to={"/tools/" + tool.slug}
                style={{
                  display: "flex",
                  gap: "1rem",
                  padding: "1.4rem 1.3rem",
                  borderRadius: 12,
                  border: "1px solid var(--ink08)",
                  background: "var(--card-bg)",
                  textDecoration: "none",
                  transition: "border-color 0.15s, box-shadow 0.15s",
                  alignItems: "flex-start",
                }}
                onMouseEnter={function (e) {
                  e.currentTarget.style.borderColor = tool.color + "40";
                  e.currentTarget.style.boxShadow =
                    "0 4px 16px " + tool.color + "08";
                }}
                onMouseLeave={function (e) {
                  e.currentTarget.style.borderColor = "var(--ink08)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 10,
                    background: tool.color + "10",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={20} color={tool.color} strokeWidth={1.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: 600,
                      color: "var(--ink)",
                      marginBottom: "0.25rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                    }}
                  >
                    {tool.title}
                    <ArrowRight size={14} color={tool.color} strokeWidth={2} />
                  </div>
                  <p
                    style={{
                      fontSize: "0.86rem",
                      color: "var(--ink50)",
                      margin: "0 0 0.4rem",
                      lineHeight: 1.6,
                    }}
                  >
                    {tool.description}
                  </p>
                  <span
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.6rem",
                      color: tool.color,
                      fontWeight: 600,
                    }}
                  >
                    {tool.keywords}
                  </span>
                </div>
              </Link>
            </FadeIn>
          );
        })}
      </div>

      <FadeIn delay={0.25}>
        <div
          style={{
            padding: "1.5rem",
            borderRadius: 12,
            background: "var(--accent-bg)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 10%, transparent)",
            textAlign: "center",
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
            Want automated scanning?
          </h3>
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--ink50)",
              margin: "0 0 1rem",
              lineHeight: 1.6,
            }}
          >
            xsbl scans your entire site automatically in a real browser, tracks
            issues over time, and generates fix PRs.
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
            Try xsbl free
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
