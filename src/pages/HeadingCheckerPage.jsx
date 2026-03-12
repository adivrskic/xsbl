import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  ListTree,
  AlertTriangle,
  Check,
  Clipboard,
  Trash2,
} from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

function analyzeHeadings(html) {
  var headings = [];
  var regex = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    var level = parseInt(match[1], 10);
    var text = match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .trim();
    headings.push({ level: level, text: text || "(empty)" });
  }
  return headings;
}

function getIssues(headings) {
  var issues = [];

  if (headings.length === 0) {
    issues.push({
      type: "error",
      text: "No headings found. Every page should have at least one heading.",
    });
    return issues;
  }

  // Check for H1
  var h1Count = headings.filter(function (h) {
    return h.level === 1;
  }).length;
  if (h1Count === 0) {
    issues.push({
      type: "error",
      text: "Missing <h1>. Each page should have exactly one H1 as the main heading.",
    });
  } else if (h1Count > 1) {
    issues.push({
      type: "warning",
      text:
        "Multiple <h1> tags found (" +
        h1Count +
        "). Best practice is to have exactly one H1 per page.",
    });
  }

  // Check first heading is H1
  if (headings.length > 0 && headings[0].level !== 1) {
    issues.push({
      type: "warning",
      text:
        "First heading is <h" +
        headings[0].level +
        ">, not <h1>. The first heading on the page should typically be the H1.",
    });
  }

  // Check for skipped levels
  for (var i = 1; i < headings.length; i++) {
    var prev = headings[i - 1].level;
    var curr = headings[i].level;
    if (curr > prev + 1) {
      issues.push({
        type: "error",
        text:
          "Skipped heading level: <h" +
          prev +
          "> → <h" +
          curr +
          '> ("' +
          headings[i].text.substring(0, 40) +
          "\"). Don't skip levels in the heading hierarchy.",
      });
    }
  }

  // Check for empty headings
  for (var j = 0; j < headings.length; j++) {
    if (headings[j].text === "(empty)") {
      issues.push({
        type: "warning",
        text:
          "Empty <h" +
          headings[j].level +
          "> found. Headings should have descriptive text content.",
      });
    }
  }

  if (issues.length === 0) {
    issues.push({
      type: "pass",
      text: "Heading structure looks good. No skipped levels and exactly one H1.",
    });
  }

  return issues;
}

var LEVEL_COLORS = {
  1: "#4338f0",
  2: "#1a8754",
  3: "#b45309",
  4: "#c0392b",
  5: "#6e40c9",
  6: "#999",
};

export default function HeadingCheckerPage() {
  var { t } = useTheme();
  var [html, setHtml] = useState("");
  var [results, setResults] = useState(null);

  var handleAnalyze = function () {
    var headings = analyzeHeadings(html);
    var issues = getIssues(headings);
    setResults({ headings: headings, issues: issues });
  };

  var handleClear = function () {
    setHtml("");
    setResults(null);
  };

  var handlePaste = async function () {
    try {
      var text = await navigator.clipboard.readText();
      setHtml(text);
    } catch (e) {}
  };

  return (
    <div className="legal-page" style={{ maxWidth: 640 }}>
      <FadeIn>
        <Link
          to="/tools"
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
          ← All tools
        </Link>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <ListTree size={18} color="#1a8754" strokeWidth={2} />
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Heading Structure Analyzer
          </h1>
        </div>
        <p
          style={{
            fontSize: "0.92rem",
            color: "var(--ink50)",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Paste your page HTML to visualize the heading hierarchy and catch
          structural issues. No data is sent anywhere.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        <div style={{ marginBottom: "0.4rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.3rem",
            }}
          >
            <label
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                fontWeight: 600,
                color: "var(--ink50)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Page HTML source
            </label>
            <div style={{ display: "flex", gap: "0.3rem" }}>
              <button
                onClick={handlePaste}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.25rem 0.5rem",
                  borderRadius: 5,
                  border: "1px solid var(--ink08)",
                  background: "none",
                  color: "var(--ink50)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  cursor: "pointer",
                }}
              >
                <Clipboard size={10} /> Paste
              </button>
              {html && (
                <button
                  onClick={handleClear}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    padding: "0.25rem 0.5rem",
                    borderRadius: 5,
                    border: "1px solid var(--ink08)",
                    background: "none",
                    color: "var(--ink50)",
                    fontFamily: "var(--mono)",
                    fontSize: "0.58rem",
                    cursor: "pointer",
                  }}
                >
                  <Trash2 size={10} /> Clear
                </button>
              )}
            </div>
          </div>
          <textarea
            value={html}
            onChange={function (e) {
              setHtml(e.target.value);
            }}
            placeholder={
              "Paste your page's HTML here...\n\nTip: In Chrome, right-click your page → View Page Source → Select All → Copy → Paste here."
            }
            rows={8}
            style={{
              width: "100%",
              padding: "0.6rem 0.8rem",
              borderRadius: 8,
              border: "1.5px solid var(--ink08)",
              background: "var(--card-bg)",
              color: "var(--ink)",
              fontFamily: "var(--mono)",
              fontSize: "0.76rem",
              lineHeight: 1.6,
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={!html.trim()}
          style={{
            padding: "0.55rem 1.2rem",
            borderRadius: 8,
            border: "none",
            background: !html.trim() ? "var(--ink08)" : "#1a8754",
            color: !html.trim() ? "var(--ink50)" : "white",
            fontFamily: "var(--body)",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: !html.trim() ? "not-allowed" : "pointer",
            marginBottom: "1.5rem",
          }}
        >
          Analyze headings
        </button>
      </FadeIn>

      {results && (
        <FadeIn delay={0}>
          {/* Issues */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              marginBottom: "1.2rem",
            }}
          >
            {results.issues.map(function (issue, i) {
              var isPass = issue.type === "pass";
              var isError = issue.type === "error";
              var color = isPass ? "#1a8754" : isError ? "#c0392b" : "#b45309";
              var Icon = isPass ? Check : AlertTriangle;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.5rem 0.8rem",
                    borderRadius: 7,
                    background: color + "08",
                    border: "1px solid " + color + "20",
                  }}
                >
                  <Icon
                    size={14}
                    color={color}
                    strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    style={{
                      fontSize: "0.82rem",
                      color: "var(--ink)",
                      lineHeight: 1.5,
                    }}
                  >
                    {issue.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Heading tree */}
          {results.headings.length > 0 && (
            <div
              style={{
                padding: "1rem",
                borderRadius: 10,
                border: "1px solid var(--ink08)",
                background: "var(--card-bg)",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.58rem",
                  fontWeight: 600,
                  color: "var(--ink50)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.5rem",
                }}
              >
                Heading tree ({results.headings.length} heading
                {results.headings.length !== 1 ? "s" : ""})
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.15rem",
                }}
              >
                {results.headings.map(function (h, i) {
                  var indent = (h.level - 1) * 20;
                  var color = LEVEL_COLORS[h.level] || "#999";
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        paddingLeft: indent,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          color: color,
                          width: 22,
                          flexShrink: 0,
                        }}
                      >
                        H{h.level}
                      </span>
                      <div
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: color + "30",
                          border: "2px solid " + color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: "0.82rem",
                          color:
                            h.text === "(empty)"
                              ? "var(--ink50)"
                              : "var(--ink)",
                          fontStyle: h.text === "(empty)" ? "italic" : "normal",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h.text}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <div className="legal-page__body">
          <h2>Why heading structure matters</h2>
          <p>
            Screen readers use headings to build a table of contents for the
            page. Users navigate by jumping between headings — if levels are
            skipped (H1 → H3), the structure becomes confusing. Each page should
            have exactly one H1, and heading levels should only increase by one
            step at a time.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.18}>
        <div
          style={{
            marginTop: "2rem",
            padding: "1.2rem",
            borderRadius: 12,
            background: "var(--accent-bg)",
            border:
              "1px solid color-mix(in srgb, var(--accent) 10%, transparent)",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "0.88rem",
              color: "var(--ink50)",
              margin: "0 0 0.7rem",
            }}
          >
            xsbl detects heading issues across your entire site automatically.
          </p>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "0.55rem 1.2rem",
              borderRadius: 8,
              background: "var(--accent)",
              color: "white",
              fontWeight: 600,
              fontSize: "0.84rem",
              textDecoration: "none",
            }}
          >
            Scan your site free
          </Link>
        </div>
      </FadeIn>
    </div>
  );
}
