import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { Palette, Check, X, ArrowLeftRight, RotateCcw } from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

// ── Color math (WCAG 2.x relative luminance) ──
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
  var lighter = Math.max(l1, l2);
  var darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function PassFail({ pass, label }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.55rem 0.8rem",
        borderRadius: 7,
        background: pass ? "#1a875408" : "#c0392b08",
        border: "1px solid " + (pass ? "#1a875420" : "#c0392b20"),
      }}
    >
      <span style={{ fontSize: "0.84rem", color: "var(--ink)" }}>{label}</span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
          fontFamily: "var(--mono)",
          fontSize: "0.72rem",
          fontWeight: 700,
          color: pass ? "#1a8754" : "#c0392b",
        }}
      >
        {pass ? (
          <Check size={14} strokeWidth={2.5} />
        ) : (
          <X size={14} strokeWidth={2.5} />
        )}
        {pass ? "Pass" : "Fail"}
      </div>
    </div>
  );
}

export default function ContrastCheckerPage() {
  var { t } = useTheme();
  var [fg, setFg] = useState("#333333");
  var [bg, setBg] = useState("#ffffff");

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
  var aaLarge = ratio >= 3;
  var aaNormal = ratio >= 4.5;
  var aaaLarge = ratio >= 4.5;
  var aaaNormal = ratio >= 7;

  var ratingLabel =
    ratio >= 7
      ? "Excellent"
      : ratio >= 4.5
      ? "Good"
      : ratio >= 3
      ? "Acceptable for large text"
      : "Insufficient";
  var ratingColor =
    ratio >= 7
      ? "#1a8754"
      : ratio >= 4.5
      ? "#1a8754"
      : ratio >= 3
      ? "#b45309"
      : "#c0392b";

  var handleSwap = function () {
    var tmp = fg;
    setFg(bg);
    setBg(tmp);
  };

  var handleReset = function () {
    setFg("#333333");
    setBg("#ffffff");
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
          <Palette size={18} color="#4338f0" strokeWidth={2} />
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "clamp(1.4rem, 3vw, 1.8rem)",
              fontWeight: 700,
              color: "var(--ink)",
              margin: 0,
            }}
          >
            Color Contrast Checker
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
          Test foreground and background colors against WCAG 2.2 contrast
          requirements. Runs entirely in your browser.
        </p>
      </FadeIn>

      <FadeIn delay={0.08}>
        {/* Preview */}
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            border: "1px solid var(--ink08)",
            marginBottom: "1.2rem",
          }}
        >
          <div
            style={{
              padding: "2.5rem 2rem",
              background: bg,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "2rem",
                fontWeight: 700,
                color: fg,
                fontFamily: "var(--serif)",
                lineHeight: 1.3,
                marginBottom: "0.4rem",
              }}
            >
              The quick brown fox
            </div>
            <div
              style={{
                fontSize: "0.92rem",
                color: fg,
                fontFamily: "var(--body)",
                lineHeight: 1.6,
              }}
            >
              jumps over the lazy dog. 0123456789
            </div>
          </div>

          {/* Ratio bar */}
          <div
            style={{
              padding: "0.8rem 1.2rem",
              background: "var(--card-bg)",
              borderTop: "1px solid var(--ink08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.8rem",
            }}
          >
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "1.8rem",
                fontWeight: 700,
                color: ratingColor,
              }}
            >
              {ratioStr}
            </span>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                fontWeight: 600,
                color: ratingColor,
                padding: "0.15rem 0.5rem",
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
            gap: "0.6rem",
            alignItems: "center",
            marginBottom: "1.2rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <label
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                fontWeight: 600,
                color: "var(--ink50)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Foreground (text)
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                border: "1.5px solid var(--ink08)",
                borderRadius: 8,
                padding: "0.3rem 0.5rem",
                background: "var(--card-bg)",
              }}
            >
              <input
                type="color"
                value={fg}
                onChange={function (e) {
                  setFg(e.target.value);
                }}
                style={{
                  width: 32,
                  height: 32,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: 0,
                  background: "none",
                }}
              />
              <input
                type="text"
                value={fg}
                onChange={function (e) {
                  var v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setFg(v);
                }}
                style={{
                  flex: 1,
                  border: "none",
                  background: "none",
                  color: "var(--ink)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.2rem",
              alignSelf: "flex-end",
              paddingBottom: "0.3rem",
            }}
          >
            <button
              onClick={handleSwap}
              title="Swap colors"
              style={{
                padding: "0.4rem",
                borderRadius: 6,
                border: "1.5px solid var(--ink08)",
                background: "none",
                color: "var(--ink50)",
                cursor: "pointer",
                display: "flex",
              }}
            >
              <ArrowLeftRight size={14} strokeWidth={2} />
            </button>
          </div>

          <div style={{ flex: 1 }}>
            <label
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.58rem",
                fontWeight: 600,
                color: "var(--ink50)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: "0.25rem",
              }}
            >
              Background
            </label>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                border: "1.5px solid var(--ink08)",
                borderRadius: 8,
                padding: "0.3rem 0.5rem",
                background: "var(--card-bg)",
              }}
            >
              <input
                type="color"
                value={bg}
                onChange={function (e) {
                  setBg(e.target.value);
                }}
                style={{
                  width: 32,
                  height: 32,
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer",
                  padding: 0,
                  background: "none",
                }}
              />
              <input
                type="text"
                value={bg}
                onChange={function (e) {
                  var v = e.target.value;
                  if (/^#[0-9a-fA-F]{0,6}$/.test(v)) setBg(v);
                }}
                style={{
                  flex: 1,
                  border: "none",
                  background: "none",
                  color: "var(--ink)",
                  fontFamily: "var(--mono)",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  outline: "none",
                  textTransform: "uppercase",
                }}
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.4rem",
            marginBottom: "1.5rem",
          }}
        >
          <PassFail pass={aaNormal} label="AA Normal text (4.5:1)" />
          <PassFail pass={aaLarge} label="AA Large text (3:1)" />
          <PassFail pass={aaaNormal} label="AAA Normal text (7:1)" />
          <PassFail pass={aaaLarge} label="AAA Large text (4.5:1)" />
        </div>

        <button
          onClick={handleReset}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            padding: "0.35rem 0.7rem",
            borderRadius: 6,
            border: "1.5px solid var(--ink08)",
            background: "none",
            color: "var(--ink50)",
            fontFamily: "var(--body)",
            fontSize: "0.76rem",
            cursor: "pointer",
            marginBottom: "2rem",
          }}
        >
          <RotateCcw size={12} /> Reset
        </button>
      </FadeIn>

      <FadeIn delay={0.15}>
        <div className="legal-page__body">
          <h2>About WCAG contrast requirements</h2>
          <p>
            WCAG 2.2 Success Criterion 1.4.3 requires a minimum contrast ratio
            of 4.5:1 for normal text and 3:1 for large text (18px+ or 14px+
            bold) at Level AA. Level AAA raises this to 7:1 for normal text and
            4.5:1 for large text.
          </p>
          <p>
            Low contrast affects roughly 1 in 12 men and 1 in 200 women who have
            color vision deficiency, plus anyone viewing screens in bright
            environments or using low-quality displays.
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
            xsbl checks contrast across your entire site automatically.
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
