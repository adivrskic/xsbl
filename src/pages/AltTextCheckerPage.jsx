import { useState } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  Image,
  AlertTriangle,
  Check,
  Info,
  Clipboard,
  Trash2,
} from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

function analyzeImages(html) {
  var images = [];
  // Match <img> tags (self-closing or not)
  var regex = /<img\b([^>]*)\/?\s*>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    var attrs = match[1];

    // Extract src
    var srcMatch = attrs.match(/src\s*=\s*["']([^"']*?)["']/i);
    var src = srcMatch ? srcMatch[1] : "(no src)";

    // Extract alt
    var altMatch = attrs.match(/alt\s*=\s*["']([\s\S]*?)["']/i);
    var hasAlt = altMatch !== null;
    var altText = hasAlt ? altMatch[1] : null;

    // Check for role="presentation" or aria-hidden="true"
    var isDecorative =
      /role\s*=\s*["']presentation["']/i.test(attrs) ||
      /aria-hidden\s*=\s*["']true["']/i.test(attrs);

    // Determine status
    var status;
    if (!hasAlt) {
      status = "missing";
    } else if (altText === "" && !isDecorative) {
      status = "empty";
    } else if (altText === "" && isDecorative) {
      status = "decorative-ok";
    } else if (
      altText &&
      /^(image|photo|picture|img|icon|logo|banner|graphic|screenshot|untitled)$/i.test(
        altText.trim()
      )
    ) {
      status = "generic";
    } else if (altText && altText.length > 125) {
      status = "long";
    } else if (altText) {
      status = "good";
    } else {
      status = "unknown";
    }

    images.push({
      src: src,
      alt: altText,
      hasAlt: hasAlt,
      isDecorative: isDecorative,
      status: status,
      raw: match[0].substring(0, 200),
    });
  }
  return images;
}

function getSummary(images) {
  var counts = {
    missing: 0,
    empty: 0,
    generic: 0,
    long: 0,
    good: 0,
    decorative: 0,
  };
  var issues = [];

  for (var i = 0; i < images.length; i++) {
    var img = images[i];
    if (img.status === "missing") counts.missing++;
    else if (img.status === "empty") counts.empty++;
    else if (img.status === "generic") counts.generic++;
    else if (img.status === "long") counts.long++;
    else if (img.status === "decorative-ok") counts.decorative++;
    else if (img.status === "good") counts.good++;
  }

  if (counts.missing > 0) {
    issues.push({
      type: "error",
      text:
        counts.missing +
        " image" +
        (counts.missing !== 1 ? "s" : "") +
        " missing alt attribute entirely. Screen readers cannot describe these images.",
    });
  }
  if (counts.empty > 0) {
    issues.push({
      type: "warning",
      text:
        counts.empty +
        " image" +
        (counts.empty !== 1 ? "s" : "") +
        ' with empty alt but not marked as decorative. If the image conveys meaning, add descriptive alt text. If decorative, add role="presentation".',
    });
  }
  if (counts.generic > 0) {
    issues.push({
      type: "warning",
      text:
        counts.generic +
        " image" +
        (counts.generic !== 1 ? "s" : "") +
        ' with generic alt text (e.g. "image", "photo"). Alt text should describe the content or purpose of the image.',
    });
  }
  if (counts.long > 0) {
    issues.push({
      type: "info",
      text:
        counts.long +
        " image" +
        (counts.long !== 1 ? "s" : "") +
        " with alt text longer than 125 characters. Consider shortening or using a figcaption for complex descriptions.",
    });
  }
  if (issues.length === 0 && images.length > 0) {
    issues.push({
      type: "pass",
      text:
        "All " +
        images.length +
        " images have appropriate alt text. Nice work!",
    });
  }

  return { counts: counts, issues: issues };
}

var STATUS_CONFIG = {
  missing: { label: "Missing alt", color: "#c0392b", icon: AlertTriangle },
  empty: {
    label: "Empty alt (not decorative)",
    color: "#b45309",
    icon: AlertTriangle,
  },
  generic: { label: "Generic alt text", color: "#b45309", icon: AlertTriangle },
  long: { label: "Alt text too long", color: "#6e40c9", icon: Info },
  good: { label: "Good", color: "#1a8754", icon: Check },
  "decorative-ok": { label: "Decorative (OK)", color: "#999", icon: Check },
};

export default function AltTextCheckerPage() {
  var { t } = useTheme();
  var [html, setHtml] = useState("");
  var [results, setResults] = useState(null);

  var handleAnalyze = function () {
    var images = analyzeImages(html);
    var summary = getSummary(images);
    setResults({ images: images, summary: summary });
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

  function getSrcLabel(src) {
    if (!src || src === "(no src)") return "(no src)";
    try {
      var parts = src.split("/");
      return parts[parts.length - 1].split("?")[0] || src;
    } catch (e) {
      return src;
    }
  }

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
          <Image size={18} color="#b45309" strokeWidth={2} />
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Alt Text Checker
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
          Paste HTML to find images with missing, empty, or generic alt text.
          Runs entirely in your browser — no data leaves your machine.
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
              "Paste your page's HTML here...\n\nTip: In Chrome, right-click → View Page Source → Select All → Copy → Paste here."
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
            background: !html.trim() ? "var(--ink08)" : "#b45309",
            color: !html.trim() ? "var(--ink50)" : "white",
            fontFamily: "var(--body)",
            fontSize: "0.88rem",
            fontWeight: 600,
            cursor: !html.trim() ? "not-allowed" : "pointer",
            marginBottom: "1.5rem",
          }}
        >
          Check alt text
        </button>
      </FadeIn>

      {results && (
        <FadeIn delay={0}>
          {/* Summary issues */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              marginBottom: "1.2rem",
            }}
          >
            {results.summary.issues.map(function (issue, i) {
              var isPass = issue.type === "pass";
              var isError = issue.type === "error";
              var isInfo = issue.type === "info";
              var color = isPass
                ? "#1a8754"
                : isError
                ? "#c0392b"
                : isInfo
                ? "#6e40c9"
                : "#b45309";
              var Icon = isPass ? Check : isInfo ? Info : AlertTriangle;
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

          {/* Image list */}
          {results.images.length > 0 && (
            <div
              style={{
                borderRadius: 10,
                border: "1px solid var(--ink08)",
                background: "var(--card-bg)",
                marginBottom: "1.5rem",
                overflow: "hidden",
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
                  padding: "0.6rem 0.8rem",
                  borderBottom: "1px solid var(--ink08)",
                }}
              >
                {results.images.length} image
                {results.images.length !== 1 ? "s" : ""} found
              </div>
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {results.images.map(function (img, i) {
                  var config = STATUS_CONFIG[img.status] || STATUS_CONFIG.good;
                  var StatusIcon = config.icon;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "0.6rem 0.8rem",
                        borderBottom:
                          i < results.images.length - 1
                            ? "1px solid var(--ink04)"
                            : "none",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.5rem",
                      }}
                    >
                      <StatusIcon
                        size={13}
                        color={config.color}
                        strokeWidth={2}
                        style={{ flexShrink: 0, marginTop: 3 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            marginBottom: "0.15rem",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.7rem",
                              fontWeight: 500,
                              color: "var(--ink)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 300,
                            }}
                          >
                            {getSrcLabel(img.src)}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.5rem",
                              fontWeight: 700,
                              padding: "0.05rem 0.3rem",
                              borderRadius: 3,
                              background: config.color + "12",
                              color: config.color,
                              flexShrink: 0,
                              textTransform: "uppercase",
                              letterSpacing: "0.03em",
                            }}
                          >
                            {config.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.64rem",
                            color: "var(--ink50)",
                          }}
                        >
                          {img.hasAlt
                            ? img.alt === ""
                              ? 'alt=""'
                              : 'alt="' +
                                (img.alt.length > 80
                                  ? img.alt.substring(0, 80) + "…"
                                  : img.alt) +
                                '"'
                            : "No alt attribute"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {results.images.length === 0 && (
            <div
              style={{
                padding: "1.5rem",
                textAlign: "center",
                color: "var(--ink50)",
                fontSize: "0.88rem",
                borderRadius: 10,
                border: "1px solid var(--ink08)",
                marginBottom: "1.5rem",
              }}
            >
              No &lt;img&gt; tags found in the provided HTML.
            </div>
          )}
        </FadeIn>
      )}

      <FadeIn delay={0.15}>
        <div className="legal-page__body">
          <h2>Why alt text matters</h2>
          <p>
            WCAG 1.1.1 requires all non-text content to have a text alternative.
            Screen readers announce the alt text to blind users — without it,
            images are invisible. Decorative images should use empty alt
            (alt="") with role="presentation" to be skipped by screen readers.
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
            xsbl detects missing alt text across all your pages automatically.
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
