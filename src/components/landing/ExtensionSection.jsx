import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import { Eyebrow, H2, Italic } from "./Typography";
import {
  Chrome,
  SunMoon,
  Image,
  Keyboard,
  BookOpen,
  Sparkles,
  Check,
  Lock,
  ToggleLeft,
  ToggleRight,
  Minus,
  Plus,
  ArrowRight,
  Eye,
  PenLine,
  Pause,
  Subtitles,
  Volume2,
  BookMarked,
  Palette,
  Type,
} from "lucide-react";
import "./ExtensionSection.css";

/* ═══════════════════════════════════════════
   MOCK EXTENSION POPUP
   A realistic Chrome extension popup preview.
   All interactive — toggles animate, slider
   moves — but nothing leaves the component.
   ═══════════════════════════════════════════ */

function MockPopup({ t }) {
  var [contrastOn, setContrastOn] = useState(true);
  var [dyslexiaOn, setDyslexiaOn] = useState(false);
  var [keyboardOn, setKeyboardOn] = useState(true);
  var [altTextOn, setAltTextOn] = useState(true);
  var [colorblind, setColorblind] = useState("off");
  var [ariaOn, setAriaOn] = useState(true);
  var [textSize, setTextSize] = useState(120);

  var toggleStyle = function (on) {
    return {
      cursor: "pointer",
      color: on ? t.accent : t.ink50,
      transition: "color 0.2s",
      flexShrink: 0,
    };
  };

  return (
    <div className="ext-popup">
      {/* Chrome bar */}
      <div className="ext-popup__chrome-bar">
        <div className="ext-popup__dots">
          <span className="ext-popup__dot ext-popup__dot--red" />
          <span className="ext-popup__dot ext-popup__dot--yellow" />
          <span className="ext-popup__dot ext-popup__dot--green" />
        </div>
        <div className="ext-popup__url-bar">
          <Lock size={9} strokeWidth={2.5} style={{ opacity: 0.4 }} />
          <span>example.com</span>
        </div>
        <div style={{ width: 44 }} />
      </div>

      {/* Extension popup body */}
      <div className="ext-popup__body">
        {/* Header */}
        <div className="ext-popup__header">
          <div className="ext-popup__logo">
            <span className="ext-popup__logo-text">xsbl</span>
            <span className="ext-popup__logo-badge">extension</span>
          </div>
          <div className="ext-popup__site-label">Active on this page</div>
        </div>

        {/* Text size control */}
        <div className="ext-popup__control">
          <div className="ext-popup__control-row">
            <SunMoon
              size={14}
              strokeWidth={2}
              style={{ color: t.accent, flexShrink: 0 }}
            />
            <span className="ext-popup__control-label">
              Text &amp; Contrast
            </span>
            <span
              onClick={function () {
                setContrastOn(!contrastOn);
              }}
              style={toggleStyle(contrastOn)}
              role="button"
              tabIndex={0}
              aria-label="Toggle contrast"
            >
              {contrastOn ? (
                <ToggleRight size={22} strokeWidth={1.8} />
              ) : (
                <ToggleLeft size={22} strokeWidth={1.8} />
              )}
            </span>
          </div>
          {contrastOn && (
            <div className="ext-popup__slider-row">
              <button
                className="ext-popup__size-btn"
                onClick={function () {
                  setTextSize(Math.max(100, textSize - 10));
                }}
                aria-label="Decrease text size"
              >
                <Minus size={10} strokeWidth={2.5} />
              </button>
              <div className="ext-popup__slider-track">
                <div
                  className="ext-popup__slider-fill"
                  style={{ width: ((textSize - 100) / 60) * 100 + "%" }}
                />
              </div>
              <button
                className="ext-popup__size-btn"
                onClick={function () {
                  setTextSize(Math.min(160, textSize + 10));
                }}
                aria-label="Increase text size"
              >
                <Plus size={10} strokeWidth={2.5} />
              </button>
              <span className="ext-popup__size-value">{textSize}%</span>
            </div>
          )}
        </div>

        {/* AI Alt Text */}
        <div className="ext-popup__control">
          <div className="ext-popup__control-row">
            <Image
              size={14}
              strokeWidth={2}
              style={{ color: t.accent, flexShrink: 0 }}
            />
            <span className="ext-popup__control-label">
              AI alt text
              <Sparkles
                size={9}
                strokeWidth={2}
                style={{ color: t.accent, marginLeft: 3 }}
              />
            </span>
            <span
              onClick={function () {
                setAltTextOn(!altTextOn);
              }}
              style={toggleStyle(altTextOn)}
              role="button"
              tabIndex={0}
              aria-label="Toggle AI alt text"
            >
              {altTextOn ? (
                <ToggleRight size={22} strokeWidth={1.8} />
              ) : (
                <ToggleLeft size={22} strokeWidth={1.8} />
              )}
            </span>
          </div>
          {altTextOn && (
            <div className="ext-popup__hint">
              4 images on this page missing alt text — descriptions generated
            </div>
          )}
        </div>

        {/* Keyboard nav */}
        <div className="ext-popup__control">
          <div className="ext-popup__control-row">
            <Keyboard
              size={14}
              strokeWidth={2}
              style={{ color: t.accent, flexShrink: 0 }}
            />
            <span className="ext-popup__control-label">
              Keyboard navigation
            </span>
            <span
              onClick={function () {
                setKeyboardOn(!keyboardOn);
              }}
              style={toggleStyle(keyboardOn)}
              role="button"
              tabIndex={0}
              aria-label="Toggle keyboard navigation"
            >
              {keyboardOn ? (
                <ToggleRight size={22} strokeWidth={1.8} />
              ) : (
                <ToggleLeft size={22} strokeWidth={1.8} />
              )}
            </span>
          </div>
        </div>

        {/* Dyslexia mode */}
        <div className="ext-popup__control">
          <div className="ext-popup__control-row">
            <BookOpen
              size={14}
              strokeWidth={2}
              style={{ color: t.accent, flexShrink: 0 }}
            />
            <span className="ext-popup__control-label">
              Dyslexia-friendly mode
            </span>
            <span
              onClick={function () {
                setDyslexiaOn(!dyslexiaOn);
              }}
              style={toggleStyle(dyslexiaOn)}
              role="button"
              tabIndex={0}
              aria-label="Toggle dyslexia mode"
            >
              {dyslexiaOn ? (
                <ToggleRight size={22} strokeWidth={1.8} />
              ) : (
                <ToggleLeft size={22} strokeWidth={1.8} />
              )}
            </span>
          </div>
          {dyslexiaOn && (
            <div className="ext-popup__hint">
              OpenDyslexic font · 1.8× line spacing · reading ruler active
            </div>
          )}
        </div>

        {/* Color blindness */}
        <div className="ext-popup__control">
          <div className="ext-popup__control-row">
            <Eye
              size={14}
              strokeWidth={2}
              style={{ color: t.accent, flexShrink: 0 }}
            />
            <span className="ext-popup__control-label">Color blindness</span>
          </div>
          <div style={{ marginTop: "0.3rem", paddingLeft: 18 }}>
            <select
              value={colorblind}
              onChange={function (e) {
                setColorblind(e.target.value);
              }}
              style={{
                width: "100%",
                padding: "0.2rem 0.4rem",
                borderRadius: 4,
                border: "1px solid " + t.ink08,
                background: t.paper,
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.58rem",
                fontWeight: 500,
                outline: "none",
              }}
            >
              <option value="off">Off</option>
              <option value="protanopia">Protanopia (red-weak)</option>
              <option value="deuteranopia">Deuteranopia (green-weak)</option>
              <option value="tritanopia">Tritanopia (blue-weak)</option>
            </select>
          </div>
        </div>

        {/* ARIA auto-fix */}
        <div className="ext-popup__control">
          <div className="ext-popup__control-row">
            <PenLine
              size={14}
              strokeWidth={2}
              style={{ color: t.accent, flexShrink: 0 }}
            />
            <span className="ext-popup__control-label">
              ARIA &amp; heading fix
            </span>
            <span
              onClick={function () {
                setAriaOn(!ariaOn);
              }}
              style={toggleStyle(ariaOn)}
              role="button"
              tabIndex={0}
              aria-label="Toggle ARIA auto-fix"
            >
              {ariaOn ? (
                <ToggleRight size={22} strokeWidth={1.8} />
              ) : (
                <ToggleLeft size={22} strokeWidth={1.8} />
              )}
            </span>
          </div>
          {ariaOn && (
            <div className="ext-popup__hint">
              2 heading skips fixed · 3 landmarks added
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="ext-popup__footer">
          <span>Settings saved for example.com</span>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   FEATURE CARDS
   ═══════════════════════════════════════════ */

var FEATURES = [
  {
    icon: SunMoon,
    title: "Contrast & text scaling",
    desc: "Boost contrast ratios and scale text up to 160% on any site. WCAG AA/AAA compliant rendering in one click.",
    tier: "free",
  },
  {
    icon: Keyboard,
    title: "Keyboard navigation overlay",
    desc: "Visible focus rings, skip-nav links, and a tab-order map overlaid on any page. Navigate without a mouse.",
    tier: "free",
  },
  {
    icon: Pause,
    title: "Stop motion & media",
    desc: "Pause all videos, freeze animated GIFs, kill CSS animations and transitions, stop carousels. One toggle for calm.",
    tier: "free",
  },
  {
    icon: BookOpen,
    title: "Dyslexia-friendly mode",
    desc: "Switches to OpenDyslexic, widens letter and line spacing, and adds a reading ruler that follows your cursor.",
    tier: "pro",
  },
  {
    icon: Eye,
    title: "Color blindness correction",
    desc: "Perceptual color filters for protanopia, deuteranopia, and tritanopia. Shifts colors into distinguishable ranges without distorting images.",
    tier: "pro",
  },
  {
    icon: PenLine,
    title: "ARIA & heading auto-fix",
    desc: "Injects missing landmarks, corrects heading skip-levels, labels icon-only buttons, and associates orphaned form inputs.",
    tier: "pro",
  },
  {
    icon: Subtitles,
    title: "Caption detection",
    desc: "Flags uncaptioned videos and audio elements. Shows warnings with instructions to enable captions on YouTube and Vimeo.",
    tier: "pro",
  },
  {
    icon: Image,
    title: "AI alt text generation",
    desc: "Automatically describes undescribed images using vision AI. Injected live into the page so screen readers just work.",
    tier: "pro",
  },
  {
    icon: Volume2,
    title: "Read aloud (TTS)",
    desc: "Text-to-speech reads page content paragraph by paragraph with highlighted tracking. Uses the Web Speech API.",
    tier: "pro",
  },
  {
    icon: BookMarked,
    title: "Reading mode",
    desc: "Strips ads, nav, and clutter. Shows just the article text in a clean, distraction-free view.",
    tier: "pro",
  },
  {
    icon: Palette,
    title: "Color tint overlays",
    desc: "12 tint colors for visual stress and Irlen syndrome. Peach, lemon, mint, lavender, and more.",
    tier: "pro",
  },
  {
    icon: Type,
    title: "Accessible fonts",
    desc: "Switch any site to Lexend, Atkinson Hyperlegible, or OpenDyslexic — fonts designed for readability.",
    tier: "pro",
  },
];

/* ═══════════════════════════════════════════
   MAIN SECTION
   ═══════════════════════════════════════════ */

export default function ExtensionSection() {
  var { t } = useTheme();

  return (
    <section className="ext-section">
      <div className="ext-section__inner">
        {/* Text side */}
        <div className="ext-section__text">
          <FadeIn>
            <Eyebrow>Chrome extension</Eyebrow>
          </FadeIn>
          <FadeIn delay={0.05}>
            <H2>
              Make <Italic>any</Italic> site accessible — right now
            </H2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="ext-section__sub">
              xsbl helps developers fix their sites. But billions of pages
              haven't been fixed yet. The extension gives{" "}
              <strong>everyone</strong> — users with low vision, motor
              impairments, dyslexia, or anyone who wants a better web — instant
              accessibility on every page they visit.
            </p>
          </FadeIn>

          <FadeIn delay={0.14}>
            <div className="ext-features">
              {FEATURES.map(function (f, i) {
                var Icon = f.icon;
                return (
                  <div key={i} className="ext-feature">
                    <div className="ext-feature__icon">
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div className="ext-feature__body">
                      <div className="ext-feature__title-row">
                        <span className="ext-feature__title">{f.title}</span>
                        <span
                          className={
                            "ext-feature__tier ext-feature__tier--" + f.tier
                          }
                        >
                          {f.tier === "free" ? "Free" : "Pro"}
                        </span>
                      </div>
                      <p className="ext-feature__desc">{f.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div className="ext-cta-row">
              <a
                href="/signup?ref=extension"
                className="ext-cta"
                aria-label="Sign up to get the xsbl Chrome extension"
              >
                <Chrome size={16} strokeWidth={2} />
                Sign up free to get the extension
                <ArrowRight size={14} strokeWidth={2} />
              </a>
              <span className="ext-cta-note">
                Create a free account to download · Pro features unlock with any
                paid plan
              </span>
              <a href="/extension" className="ext-cta-learn">
                See all features and how it works →
              </a>
            </div>
          </FadeIn>
        </div>

        {/* Popup mock side */}
        <FadeIn delay={0.12} className="ext-section__visual">
          <MockPopup t={t} />
        </FadeIn>
      </div>
    </section>
  );
}
