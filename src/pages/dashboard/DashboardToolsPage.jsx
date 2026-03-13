import { useState, useMemo } from "react";
import { useTheme } from "../../context/ThemeContext";
import SegmentedControl from "../../components/landing/SegmentedControl";
import ElementTester from "./ElementTester";
import {
  Palette,
  ListTree,
  Image,
  Code,
  Check,
  X,
  ArrowLeftRight,
  RotateCcw,
  AlertTriangle,
  Info,
  Clipboard,
  Trash2,
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";

// ═══════════════════════════════════════════
// CONTRAST CHECKER
// ═══════════════════════════════════════════

function hexToRgb(hex) {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3)
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  var n = parseInt(hex, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function luminance(r, g, b) {
  var a = [r, g, b].map(function (v) {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function contrastRatio(hex1, hex2) {
  var c1 = hexToRgb(hex1);
  var c2 = hexToRgb(hex2);
  var l1 = luminance(c1.r, c1.g, c1.b);
  var l2 = luminance(c2.r, c2.g, c2.b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function PassFail({ pass, label, t }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.5rem 0.7rem",
        borderRadius: 6,
        background: pass ? t.green + "08" : t.red + "08",
        border: "1px solid " + (pass ? t.green + "20" : t.red + "20"),
      }}
    >
      <span style={{ fontSize: "0.8rem", color: t.ink }}>{label}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.25rem",
          fontFamily: "var(--mono)",
          fontSize: "0.68rem",
          fontWeight: 700,
          color: pass ? t.green : t.red,
        }}
      >
        {pass ? (
          <Check size={13} strokeWidth={2.5} />
        ) : (
          <X size={13} strokeWidth={2.5} />
        )}
        {pass ? "Pass" : "Fail"}
      </div>
    </div>
  );
}

function ContrastChecker({ t, dark }) {
  var lightFg = "#333333";
  var lightBg = "#ffffff";
  var darkFg = "#e0e0e0";
  var darkBg = "#1a1a2e";
  var defaultFg = dark ? darkFg : lightFg;
  var defaultBg = dark ? darkBg : lightBg;

  var [fg, setFg] = useState(defaultFg);
  var [bg, setBg] = useState(defaultBg);
  var [prevDark, setPrevDark] = useState(dark);

  // When theme toggles, update colors to match new defaults
  if (dark !== prevDark) {
    setPrevDark(dark);
    setFg(dark ? darkFg : lightFg);
    setBg(dark ? darkBg : lightBg);
  }

  var ratio = useMemo(
    function () {
      try {
        return contrastRatio(fg, bg);
      } catch (e) {
        return 1;
      }
    },
    [fg, bg]
  );

  var ratioStr = ratio.toFixed(2) + ":1";
  var ratingLabel =
    ratio >= 7
      ? "Excellent"
      : ratio >= 4.5
      ? "Good"
      : ratio >= 3
      ? "Large text only"
      : "Insufficient";
  var ratingColor = ratio >= 4.5 ? t.green : ratio >= 3 ? t.amber : t.red;

  var inputStyle = {
    flex: 1,
    border: "none",
    background: "none",
    color: t.ink,
    fontFamily: "var(--mono)",
    fontSize: "0.84rem",
    fontWeight: 600,
    outline: "none",
    textTransform: "uppercase",
  };

  return (
    <div>
      {/* Preview */}
      <div
        style={{
          borderRadius: 10,
          overflow: "hidden",
          border: "1px solid " + t.ink08,
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            padding: "2rem 1.5rem",
            background: bg,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "1.6rem",
              fontWeight: 700,
              color: fg,
              fontFamily: "var(--serif)",
              lineHeight: 1.3,
              marginBottom: "0.3rem",
            }}
          >
            The quick brown fox
          </div>
          <div style={{ fontSize: "0.88rem", color: fg, lineHeight: 1.6 }}>
            jumps over the lazy dog. 0123456789
          </div>
        </div>
        <div
          style={{
            padding: "0.65rem 1rem",
            background: t.cardBg,
            borderTop: "1px solid " + t.ink08,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: ratingColor,
            }}
          >
            {ratioStr}
          </span>
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.66rem",
              fontWeight: 600,
              color: ratingColor,
              padding: "0.12rem 0.45rem",
              borderRadius: 4,
              background: ratingColor + "12",
            }}
          >
            {ratingLabel}
          </span>
        </div>
      </div>

      {/* Color inputs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "0.2rem",
            }}
          >
            Foreground
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              border: "1.5px solid " + t.ink08,
              borderRadius: 7,
              padding: "0.25rem 0.4rem",
              background: t.cardBg,
            }}
          >
            <input
              type="color"
              value={fg}
              onChange={function (e) {
                setFg(e.target.value);
              }}
              style={{
                width: 28,
                height: 28,
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                padding: 0,
                background: "none",
              }}
            />
            <input
              type="text"
              value={fg}
              onChange={function (e) {
                if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                  setFg(e.target.value);
              }}
              style={inputStyle}
            />
          </div>
        </div>
        <button
          onClick={function () {
            var tmp = fg;
            setFg(bg);
            setBg(tmp);
          }}
          title="Swap colors"
          style={{
            padding: "0.35rem",
            borderRadius: 5,
            border: "1.5px solid " + t.ink08,
            background: "none",
            color: t.ink50,
            cursor: "pointer",
            display: "flex",
            alignSelf: "flex-end",
            marginBottom: "0.25rem",
          }}
        >
          <ArrowLeftRight size={13} />
        </button>
        <div style={{ flex: 1 }}>
          <label
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              display: "block",
              marginBottom: "0.2rem",
            }}
          >
            Background
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              border: "1.5px solid " + t.ink08,
              borderRadius: 7,
              padding: "0.25rem 0.4rem",
              background: t.cardBg,
            }}
          >
            <input
              type="color"
              value={bg}
              onChange={function (e) {
                setBg(e.target.value);
              }}
              style={{
                width: 28,
                height: 28,
                border: "none",
                borderRadius: 5,
                cursor: "pointer",
                padding: 0,
                background: "none",
              }}
            />
            <input
              type="text"
              value={bg}
              onChange={function (e) {
                if (/^#[0-9a-fA-F]{0,6}$/.test(e.target.value))
                  setBg(e.target.value);
              }}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Results grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.35rem",
          marginBottom: "1rem",
        }}
      >
        <PassFail pass={ratio >= 4.5} label="AA Normal (4.5:1)" t={t} />
        <PassFail pass={ratio >= 3} label="AA Large (3:1)" t={t} />
        <PassFail pass={ratio >= 7} label="AAA Normal (7:1)" t={t} />
        <PassFail pass={ratio >= 4.5} label="AAA Large (4.5:1)" t={t} />
      </div>

      <button
        onClick={function () {
          setFg(defaultFg);
          setBg(defaultBg);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "0.25rem",
          padding: "0.3rem 0.6rem",
          borderRadius: 5,
          border: "1.5px solid " + t.ink08,
          background: "none",
          color: t.ink50,
          fontFamily: "var(--body)",
          fontSize: "0.72rem",
          cursor: "pointer",
        }}
      >
        <RotateCcw size={11} /> Reset
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════
// HEADING CHECKER
// ═══════════════════════════════════════════

var LEVEL_COLORS = {
  1: "#4338f0",
  2: "#1a8754",
  3: "#b45309",
  4: "#c0392b",
  5: "#6e40c9",
  6: "#999",
};

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
      .trim();
    headings.push({ level: level, text: text || "(empty)" });
  }
  return headings;
}

function getHeadingIssues(headings) {
  var issues = [];
  if (headings.length === 0) {
    issues.push({ type: "error", text: "No headings found." });
    return issues;
  }
  var h1Count = headings.filter(function (h) {
    return h.level === 1;
  }).length;
  if (h1Count === 0)
    issues.push({
      type: "error",
      text: "Missing <h1>. Each page should have one.",
    });
  else if (h1Count > 1)
    issues.push({
      type: "warning",
      text:
        "Multiple <h1> tags (" + h1Count + "). Best practice is exactly one.",
    });
  if (headings[0].level !== 1)
    issues.push({
      type: "warning",
      text: "First heading is <h" + headings[0].level + ">, not <h1>.",
    });
  for (var i = 1; i < headings.length; i++) {
    if (headings[i].level > headings[i - 1].level + 1) {
      issues.push({
        type: "error",
        text:
          "Skipped level: <h" +
          headings[i - 1].level +
          "> → <h" +
          headings[i].level +
          '> ("' +
          headings[i].text.substring(0, 30) +
          '")',
      });
    }
  }
  for (var j = 0; j < headings.length; j++) {
    if (headings[j].text === "(empty)")
      issues.push({
        type: "warning",
        text: "Empty <h" + headings[j].level + "> found.",
      });
  }
  if (issues.length === 0)
    issues.push({ type: "pass", text: "Heading structure looks good." });
  return issues;
}

function HeadingChecker({ t }) {
  var [html, setHtml] = useState("");
  var [results, setResults] = useState(null);

  var handleAnalyze = function () {
    var h = analyzeHeadings(html);
    setResults({ headings: h, issues: getHeadingIssues(h) });
  };

  return (
    <div>
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
            fontSize: "0.55rem",
            fontWeight: 600,
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Page HTML
        </label>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            onClick={async function () {
              try {
                setHtml(await navigator.clipboard.readText());
              } catch (e) {}
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid " + t.ink08,
              background: "none",
              color: t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              cursor: "pointer",
            }}
          >
            <Clipboard size={9} /> Paste
          </button>
          {html && (
            <button
              onClick={function () {
                setHtml("");
                setResults(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                padding: "0.2rem 0.4rem",
                borderRadius: 4,
                border: "1px solid " + t.ink08,
                background: "none",
                color: t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                cursor: "pointer",
              }}
            >
              <Trash2 size={9} /> Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={html}
        onChange={function (e) {
          setHtml(e.target.value);
        }}
        placeholder="Paste your page's HTML source here..."
        rows={6}
        style={{
          width: "100%",
          padding: "0.5rem 0.7rem",
          borderRadius: 7,
          border: "1.5px solid " + t.ink08,
          background: t.paper,
          color: t.ink,
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: "0.4rem",
        }}
      />
      <button
        onClick={handleAnalyze}
        disabled={!html.trim()}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: 7,
          border: "none",
          background: !html.trim() ? t.ink08 : "#1a8754",
          color: !html.trim() ? t.ink50 : "white",
          fontFamily: "var(--body)",
          fontSize: "0.84rem",
          fontWeight: 600,
          cursor: !html.trim() ? "not-allowed" : "pointer",
          marginBottom: "1rem",
        }}
      >
        Analyze headings
      </button>

      {results && (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginBottom: "0.8rem",
            }}
          >
            {results.issues.map(function (issue, i) {
              var color =
                issue.type === "pass"
                  ? t.green
                  : issue.type === "error"
                  ? t.red
                  : t.amber;
              var Icon = issue.type === "pass" ? Check : AlertTriangle;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.4rem",
                    padding: "0.4rem 0.7rem",
                    borderRadius: 6,
                    background: color + "08",
                    border: "1px solid " + color + "18",
                  }}
                >
                  <Icon
                    size={13}
                    color={color}
                    strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: t.ink,
                      lineHeight: 1.5,
                    }}
                  >
                    {issue.text}
                  </span>
                </div>
              );
            })}
          </div>

          {results.headings.length > 0 && (
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                border: "1px solid " + t.ink08,
                background: t.cardBg,
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  fontWeight: 600,
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.4rem",
                }}
              >
                Heading tree ({results.headings.length})
              </div>
              {results.headings.map(function (h, i) {
                var color = LEVEL_COLORS[h.level] || "#999";
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      paddingLeft: (h.level - 1) * 18,
                      marginBottom: "0.1rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--mono)",
                        fontSize: "0.56rem",
                        fontWeight: 700,
                        color: color,
                        width: 20,
                        flexShrink: 0,
                      }}
                    >
                      H{h.level}
                    </span>
                    <div
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: color + "30",
                        border: "2px solid " + color,
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontSize: "0.78rem",
                        color: h.text === "(empty)" ? t.ink50 : t.ink,
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
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// ALT TEXT CHECKER
// ═══════════════════════════════════════════

function analyzeImages(html) {
  var images = [];
  var regex = /<img\b([^>]*)\/?\s*>/gi;
  var match;
  while ((match = regex.exec(html)) !== null) {
    var attrs = match[1];
    var srcMatch = attrs.match(/src\s*=\s*["']([^"']*?)["']/i);
    var src = srcMatch ? srcMatch[1] : "(no src)";
    var altMatch = attrs.match(/alt\s*=\s*["']([\s\S]*?)["']/i);
    var hasAlt = altMatch !== null;
    var altText = hasAlt ? altMatch[1] : null;
    var isDecorative =
      /role\s*=\s*["']presentation["']/i.test(attrs) ||
      /aria-hidden\s*=\s*["']true["']/i.test(attrs);

    var status;
    if (!hasAlt) status = "missing";
    else if (altText === "" && !isDecorative) status = "empty";
    else if (altText === "" && isDecorative) status = "decorative-ok";
    else if (
      altText &&
      /^(image|photo|picture|img|icon|logo|banner|graphic|screenshot|untitled)$/i.test(
        altText.trim()
      )
    )
      status = "generic";
    else if (altText && altText.length > 125) status = "long";
    else if (altText) status = "good";
    else status = "unknown";

    images.push({ src: src, alt: altText, hasAlt: hasAlt, status: status });
  }
  return images;
}

function getAltIssues(images) {
  var issues = [];
  var counts = {
    missing: 0,
    empty: 0,
    generic: 0,
    long: 0,
    good: 0,
    decorative: 0,
  };
  images.forEach(function (img) {
    if (img.status === "missing") counts.missing++;
    else if (img.status === "empty") counts.empty++;
    else if (img.status === "generic") counts.generic++;
    else if (img.status === "long") counts.long++;
    else if (img.status === "decorative-ok") counts.decorative++;
    else counts.good++;
  });
  if (counts.missing > 0)
    issues.push({
      type: "error",
      text:
        counts.missing +
        " image" +
        (counts.missing !== 1 ? "s" : "") +
        " missing alt attribute.",
    });
  if (counts.empty > 0)
    issues.push({
      type: "warning",
      text:
        counts.empty +
        " image" +
        (counts.empty !== 1 ? "s" : "") +
        " with empty alt but not marked as decorative.",
    });
  if (counts.generic > 0)
    issues.push({
      type: "warning",
      text:
        counts.generic +
        " image" +
        (counts.generic !== 1 ? "s" : "") +
        " with generic alt text.",
    });
  if (counts.long > 0)
    issues.push({
      type: "info",
      text:
        counts.long +
        " image" +
        (counts.long !== 1 ? "s" : "") +
        " with alt text over 125 characters.",
    });
  if (issues.length === 0 && images.length > 0)
    issues.push({
      type: "pass",
      text: "All " + images.length + " images have appropriate alt text.",
    });
  return issues;
}

var STATUS_CONF = {
  missing: { label: "Missing", color: "#c0392b" },
  empty: { label: "Empty alt", color: "#b45309" },
  generic: { label: "Generic", color: "#b45309" },
  long: { label: "Too long", color: "#6e40c9" },
  good: { label: "Good", color: "#1a8754" },
  "decorative-ok": { label: "Decorative", color: "#999" },
};

function AltTextChecker({ t }) {
  var [html, setHtml] = useState("");
  var [results, setResults] = useState(null);

  var handleAnalyze = function () {
    var images = analyzeImages(html);
    setResults({ images: images, issues: getAltIssues(images) });
  };

  return (
    <div>
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
            fontSize: "0.55rem",
            fontWeight: 600,
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Page HTML
        </label>
        <div style={{ display: "flex", gap: "0.25rem" }}>
          <button
            onClick={async function () {
              try {
                setHtml(await navigator.clipboard.readText());
              } catch (e) {}
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
              padding: "0.2rem 0.4rem",
              borderRadius: 4,
              border: "1px solid " + t.ink08,
              background: "none",
              color: t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              cursor: "pointer",
            }}
          >
            <Clipboard size={9} /> Paste
          </button>
          {html && (
            <button
              onClick={function () {
                setHtml("");
                setResults(null);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                padding: "0.2rem 0.4rem",
                borderRadius: 4,
                border: "1px solid " + t.ink08,
                background: "none",
                color: t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.55rem",
                cursor: "pointer",
              }}
            >
              <Trash2 size={9} /> Clear
            </button>
          )}
        </div>
      </div>
      <textarea
        value={html}
        onChange={function (e) {
          setHtml(e.target.value);
        }}
        placeholder="Paste your page's HTML source here..."
        rows={6}
        style={{
          width: "100%",
          padding: "0.5rem 0.7rem",
          borderRadius: 7,
          border: "1.5px solid " + t.ink08,
          background: t.paper,
          color: t.ink,
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          lineHeight: 1.6,
          resize: "vertical",
          outline: "none",
          boxSizing: "border-box",
          marginBottom: "0.4rem",
        }}
      />
      <button
        onClick={handleAnalyze}
        disabled={!html.trim()}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: 7,
          border: "none",
          background: !html.trim() ? t.ink08 : "#b45309",
          color: !html.trim() ? t.ink50 : "white",
          fontFamily: "var(--body)",
          fontSize: "0.84rem",
          fontWeight: 600,
          cursor: !html.trim() ? "not-allowed" : "pointer",
          marginBottom: "1rem",
        }}
      >
        Check alt text
      </button>

      {results && (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              marginBottom: "0.8rem",
            }}
          >
            {results.issues.map(function (issue, i) {
              var isPass = issue.type === "pass";
              var isInfo = issue.type === "info";
              var color = isPass
                ? t.green
                : issue.type === "error"
                ? t.red
                : isInfo
                ? "#6e40c9"
                : t.amber;
              var Icon = isPass ? Check : isInfo ? Info : AlertTriangle;
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.4rem",
                    padding: "0.4rem 0.7rem",
                    borderRadius: 6,
                    background: color + "08",
                    border: "1px solid " + color + "18",
                  }}
                >
                  <Icon
                    size={13}
                    color={color}
                    strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: 2 }}
                  />
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: t.ink,
                      lineHeight: 1.5,
                    }}
                  >
                    {issue.text}
                  </span>
                </div>
              );
            })}
          </div>

          {results.images.length > 0 && (
            <div
              style={{
                borderRadius: 8,
                border: "1px solid " + t.ink08,
                background: t.cardBg,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  fontWeight: 600,
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "0.5rem 0.7rem",
                  borderBottom: "1px solid " + t.ink08,
                }}
              >
                {results.images.length} image
                {results.images.length !== 1 ? "s" : ""}
              </div>
              <div style={{ maxHeight: 300, overflowY: "auto" }}>
                {results.images.map(function (img, i) {
                  var conf = STATUS_CONF[img.status] || STATUS_CONF.good;
                  var Icon2 =
                    img.status === "good" || img.status === "decorative-ok"
                      ? Check
                      : img.status === "long"
                      ? Info
                      : AlertTriangle;
                  var srcLabel =
                    img.src === "(no src)"
                      ? "(no src)"
                      : (img.src.split("/").pop() || "").split("?")[0] ||
                        img.src;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "0.45rem 0.7rem",
                        borderBottom:
                          i < results.images.length - 1
                            ? "1px solid " + t.ink04
                            : "none",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "0.4rem",
                      }}
                    >
                      <Icon2
                        size={12}
                        color={conf.color}
                        strokeWidth={2}
                        style={{ flexShrink: 0, marginTop: 3 }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            marginBottom: "0.1rem",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.66rem",
                              fontWeight: 500,
                              color: t.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: 250,
                            }}
                          >
                            {srcLabel}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--mono)",
                              fontSize: "0.48rem",
                              fontWeight: 700,
                              padding: "0.04rem 0.25rem",
                              borderRadius: 3,
                              background: conf.color + "12",
                              color: conf.color,
                              textTransform: "uppercase",
                              flexShrink: 0,
                            }}
                          >
                            {conf.label}
                          </span>
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--mono)",
                            fontSize: "0.6rem",
                            color: t.ink50,
                          }}
                        >
                          {img.hasAlt
                            ? img.alt === ""
                              ? 'alt=""'
                              : 'alt="' +
                                (img.alt.length > 60
                                  ? img.alt.substring(0, 60) + "…"
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
                padding: "1.2rem",
                textAlign: "center",
                color: t.ink50,
                fontSize: "0.82rem",
                borderRadius: 8,
                border: "1px solid " + t.ink08,
              }}
            >
              No &lt;img&gt; tags found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════

var TOOLS = [
  { id: "tester", label: "Element Tester", icon: Code },
  { id: "contrast", label: "Contrast", icon: Palette },
  { id: "headings", label: "Headings", icon: ListTree },
  { id: "alt-text", label: "Alt Text", icon: Image },
];

export default function DashboardToolsPage() {
  var { t, dark } = useTheme();
  var [activeTool, setActiveTool] = useState("tester");

  return (
    <div>
      <div className="dash-page-header">
        <div>
          <h1 className="dash-page-title">Tools</h1>
          <p className="dash-page-subtitle">
            Test elements, check contrast, analyze headings, and validate alt
            text.
          </p>
        </div>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <SegmentedControl
          items={TOOLS}
          value={activeTool}
          onChange={setActiveTool}
        />
      </div>

      {/* Tool body */}
      <div
        style={{
          padding: activeTool === "tester" ? 0 : "1.5rem",
          borderRadius: 12,
          border: activeTool === "tester" ? "none" : "1px solid " + t.ink08,
          background: activeTool === "tester" ? "transparent" : t.cardBg,
        }}
      >
        {activeTool === "tester" && <ElementTester />}
        {activeTool === "contrast" && <ContrastChecker t={t} dark={dark} />}
        {activeTool === "headings" && <HeadingChecker t={t} />}
        {activeTool === "alt-text" && <AltTextChecker t={t} />}
      </div>
    </div>
  );
}
