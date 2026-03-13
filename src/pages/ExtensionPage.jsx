import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import FadeIn from "../components/landing/FadeIn";
import XsblBull from "../components/landing/XsblBull";
import {
  Chrome,
  SunMoon,
  Keyboard,
  BookOpen,
  Eye,
  PenLine,
  Image,
  Sparkles,
  Check,
  ArrowRight,
  Lock,
  ExternalLink,
  Shield,
  Zap,
  Globe,
  Users,
  ChevronDown,
  Pause,
  Subtitles,
} from "lucide-react";
import "../styles/extension-page.css";

var CHROME_STORE_URL =
  "https://chrome.google.com/webstore/detail/xsbl-accessibility/placeholder";

/* ═══════════════════════════════════════════
   FEATURES DATA
   ═══════════════════════════════════════════ */

var FREE_FEATURES = [
  {
    icon: SunMoon,
    title: "Contrast & text scaling",
    desc: "Boost the contrast ratio of any page by 25% and scale text from 100% to 160%. Applied instantly via CSS — no reloading, no layout breakage. Works on every site including SPAs and shadow DOM.",
  },
  {
    icon: Keyboard,
    title: "Keyboard navigation overlay",
    desc: "Injects a skip-nav link at the top of every page, adds visible 3px focus rings on every focusable element, and overlays numbered tab-order badges so you can see exactly where Tab will take you.",
  },
  {
    icon: Pause,
    title: "Stop motion & media",
    desc: "One toggle to pause all videos, freeze animated GIFs (replaced with their first frame via canvas), kill every CSS animation and transition, and stop carousels and marquees. Essential for vestibular disorders, epilepsy, and ADHD.",
  },
];

var PRO_FEATURES = [
  {
    icon: BookOpen,
    title: "Dyslexia-friendly mode",
    desc: "Switches the entire page to OpenDyslexic, widens letter-spacing to 0.08em, word-spacing to 0.16em, and line-height to 1.8×. Adds a reading ruler that follows your cursor — a highlighted strip that helps track lines. Caps paragraph width at 70 characters.",
  },
  {
    icon: Eye,
    title: "Color blindness correction",
    desc: "SVG color matrix filters tuned for protanopia (red-weak), deuteranopia (green-weak), and tritanopia (blue-weak) using the Brettel/Viénot/Mollon perceptual model. Remaps colors into distinguishable ranges without distorting images. Pick your type from a dropdown.",
  },
  {
    icon: PenLine,
    title: "ARIA & heading auto-fix",
    desc: "Scans the DOM and injects missing landmark roles (main, nav, banner, contentinfo), corrects heading skip-levels via aria-level, labels icon-only buttons by reading SVG titles or class names, and associates orphaned form inputs with aria-label from placeholders.",
  },
  {
    icon: Image,
    title: "AI alt text generation",
    desc: "Finds every <img> missing an alt attribute, sends them to Claude Vision, and injects the generated descriptions directly into the DOM. Screen readers pick them up immediately. A small 'AI alt' badge shows which images were fixed. 100 images/day on Pro, 500 on Agency.",
  },
  {
    icon: Subtitles,
    title: "Caption detection",
    desc: "Scans the page for HTML5 videos without <track> captions, YouTube and Vimeo embeds, and audio elements without transcripts. Overlays a visible warning on each uncaptioned element with instructions to enable platform captions where available.",
  },
];

/* ═══════════════════════════════════════════
   HOW IT WORKS
   ═══════════════════════════════════════════ */

var STEPS = [
  {
    n: "1",
    title: "Install the extension",
    desc: "Add xsbl to Chrome from the Web Store. Free features work immediately — no account needed.",
    tag: "30 seconds",
  },
  {
    n: "2",
    title: "Sign in to unlock Pro",
    desc: "Click 'Sign in' in the popup. If you have an xsbl Pro or Agency account, all features unlock automatically.",
    tag: "One click",
  },
  {
    n: "3",
    title: "Toggle what you need",
    desc: "Every feature is a toggle. Settings save per-site — your preferences for GitHub are different from your news site.",
    tag: "Per-site",
  },
];

/* ═══════════════════════════════════════════
   FAQ
   ═══════════════════════════════════════════ */

var FAQS = [
  {
    q: "Do I need an xsbl account to use the extension?",
    a: "No. Contrast boost and keyboard navigation work immediately after install, no account required. Signing in unlocks the Pro features like dyslexia mode, color blindness correction, ARIA auto-fix, and AI alt text.",
  },
  {
    q: "Does the extension slow down pages?",
    a: "No. All free features are pure CSS/DOM changes with zero network calls. Pro features like AI alt text make a single API call when activated. The content script runs at document_idle so it never blocks page load.",
  },
  {
    q: "Does it work on all websites?",
    a: "It works on any standard webpage. Chrome restricts extensions from running on chrome:// pages, the Chrome Web Store, and some browser-internal URLs. Everything else — including SPAs, dynamic sites, and sites behind logins — works.",
  },
  {
    q: "Will it break the design of websites?",
    a: "The extension applies non-destructive CSS layers. Contrast boost uses a CSS filter. Text scaling adjusts font-size. Dyslexia mode overrides font-family and spacing. Color blindness uses an SVG filter. None of these alter the HTML structure. ARIA auto-fix adds attributes only — never changes visual layout.",
  },
  {
    q: "How does the color blindness correction work?",
    a: "It applies an SVG feColorMatrix filter to the entire page. The matrices are tuned using the Brettel/Viénot/Mollon perceptual color model for each type of color vision deficiency. Colors get remapped into ranges you can distinguish, while images and photos remain natural-looking.",
  },
  {
    q: "Is the AI alt text accurate?",
    a: "It uses Claude Vision (Anthropic's latest model) to describe images. Accuracy is high for photos, logos, icons, and charts. The extension adds an 'AI alt' badge to every image it describes so screen reader users know it's generated. You can always override by refreshing the page.",
  },
  {
    q: "What data does the extension collect?",
    a: "Settings are stored locally in chrome.storage. If you sign in, your extension token (not your password) is stored locally. AI alt text sends image URLs to our server for processing — we don't store the images or the generated descriptions. No browsing history, no analytics, no tracking.",
  },
  {
    q: "I already use the xsbl dashboard. Is the extension included?",
    a: "Yes. If you're on a Pro or Agency plan, all extension features are included at no extra cost. Just sign in with your xsbl account inside the extension popup.",
  },
];

function FaqItem({ q, a, t }) {
  var [open, setOpen] = useState(false);
  return (
    <div className="ext-faq__item">
      <button
        className="ext-faq__question"
        onClick={function () {
          setOpen(!open);
        }}
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          style={{
            transform: open ? "rotate(180deg)" : "none",
            transition: "transform 0.2s",
            flexShrink: 0,
            color: t.ink50,
          }}
        />
      </button>
      {open && <div className="ext-faq__answer">{a}</div>}
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPARISON TABLE
   ═══════════════════════════════════════════ */

var COMPARE = [
  { feature: "Contrast & text scaling", free: true, pro: true },
  { feature: "Keyboard navigation overlay", free: true, pro: true },
  { feature: "Stop motion & media", free: true, pro: true },
  { feature: "Dyslexia-friendly mode", free: false, pro: true },
  { feature: "Color blindness correction", free: false, pro: true },
  { feature: "ARIA & heading auto-fix", free: false, pro: true },
  { feature: "Caption detection", free: false, pro: true },
  { feature: "AI alt text generation", free: false, pro: true },
  { feature: "Per-site settings", free: true, pro: true },
  { feature: "AI images per day", free: "—", pro: "100–500" },
];

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */

export default function ExtensionPage() {
  var { t } = useTheme();

  return (
    <div className="ext-page">
      {/* ── Hero ── */}
      <div className="ext-page__hero">
        <FadeIn>
          <div className="ext-page__hero-eyebrow">
            <Chrome size={15} strokeWidth={2} />
            Chrome extension
          </div>
        </FadeIn>
        <FadeIn delay={0.05}>
          <h1 className="ext-page__hero-title">
            Make <em>any</em> website accessible
            <br />
            while you browse
          </h1>
        </FadeIn>
        <FadeIn delay={0.1}>
          <p className="ext-page__hero-sub">
            xsbl helps developers fix their own sites. But billions of pages
            haven't been fixed yet. The extension gives everyone — people with
            low vision, color blindness, motor impairments, dyslexia, or anyone
            who wants a better web — instant accessibility on every page they
            visit.
          </p>
        </FadeIn>
        <FadeIn delay={0.14}>
          <div className="ext-page__hero-actions">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ext-page__cta"
            >
              <Chrome size={17} strokeWidth={2} />
              Add to Chrome — it's free
              <ExternalLink size={13} strokeWidth={2} />
            </a>
            <div className="ext-page__hero-note">
              Free features work instantly · Sign in for Pro
            </div>
          </div>
        </FadeIn>
        <FadeIn delay={0.18}>
          <div className="ext-page__hero-stats">
            <div className="ext-page__stat">
              <span className="ext-page__stat-value">8</span>
              <span className="ext-page__stat-label">Features</span>
            </div>
            <div className="ext-page__stat-divider" />
            <div className="ext-page__stat">
              <span className="ext-page__stat-value">0ms</span>
              <span className="ext-page__stat-label">Page load impact</span>
            </div>
            <div className="ext-page__stat-divider" />
            <div className="ext-page__stat">
              <span className="ext-page__stat-value" style={{ color: t.green }}>
                Free
              </span>
              <span className="ext-page__stat-label">Core features</span>
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ── Free features ── */}
      <FadeIn>
        <div className="ext-page__section">
          <div className="ext-page__section-header">
            <div className="ext-page__section-eyebrow">
              <Zap size={13} strokeWidth={2.5} />
              Free — no account needed
            </div>
            <h2 className="ext-page__section-title">Works out of the box</h2>
            <p className="ext-page__section-sub">
              Install the extension and these features activate immediately. No
              signup, no login, no friction.
            </p>
          </div>
          <div className="ext-page__features-grid ext-page__features-grid--3">
            {FREE_FEATURES.map(function (f, i) {
              var Icon = f.icon;
              return (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="ext-page__feature-card">
                    <div className="ext-page__feature-icon">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="ext-page__feature-title">{f.title}</h3>
                    <p className="ext-page__feature-desc">{f.desc}</p>
                    <span className="ext-page__feature-tier ext-page__feature-tier--free">
                      Free
                    </span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── Pro features ── */}
      <FadeIn>
        <div className="ext-page__section">
          <div className="ext-page__section-header">
            <div className="ext-page__section-eyebrow ext-page__section-eyebrow--pro">
              <Sparkles size={13} strokeWidth={2.5} />
              Pro — sign in to unlock
            </div>
            <h2 className="ext-page__section-title">
              Power tools for real needs
            </h2>
            <p className="ext-page__section-sub">
              Sign in with your xsbl Pro or Agency account and these features
              unlock automatically. No extra cost.
            </p>
          </div>
          <div className="ext-page__features-grid">
            {PRO_FEATURES.map(function (f, i) {
              var Icon = f.icon;
              return (
                <FadeIn key={i} delay={i * 0.06}>
                  <div className="ext-page__feature-card ext-page__feature-card--pro">
                    <div className="ext-page__feature-icon ext-page__feature-icon--pro">
                      <Icon size={20} strokeWidth={2} />
                    </div>
                    <h3 className="ext-page__feature-title">{f.title}</h3>
                    <p className="ext-page__feature-desc">{f.desc}</p>
                    <span className="ext-page__feature-tier ext-page__feature-tier--pro">
                      Pro
                    </span>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── How it works ── */}
      <FadeIn>
        <div className="ext-page__section">
          <div className="ext-page__section-header">
            <h2 className="ext-page__section-title">How it works</h2>
          </div>
          <div className="ext-page__steps">
            {STEPS.map(function (step, i) {
              return (
                <FadeIn key={i} delay={i * 0.08}>
                  <div className="ext-page__step">
                    <div className="ext-page__step-number">{step.n}</div>
                    <div className="ext-page__step-body">
                      <h3 className="ext-page__step-title">{step.title}</h3>
                      <p className="ext-page__step-desc">{step.desc}</p>
                      <span className="ext-page__step-tag">{step.tag}</span>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── Comparison table ── */}
      <FadeIn>
        <div className="ext-page__section">
          <div className="ext-page__section-header">
            <h2 className="ext-page__section-title">Free vs Pro</h2>
          </div>
          <div className="ext-page__table-wrap">
            <table className="ext-page__table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free</th>
                  <th>Pro</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(function (row, i) {
                  return (
                    <tr key={i}>
                      <td>{row.feature}</td>
                      <td>
                        {row.free === true ? (
                          <Check size={14} strokeWidth={2.5} color={t.green} />
                        ) : row.free === false ? (
                          <span style={{ color: t.ink50 }}>—</span>
                        ) : (
                          <span style={{ color: t.ink50 }}>{row.free}</span>
                        )}
                      </td>
                      <td>
                        {row.pro === true ? (
                          <Check size={14} strokeWidth={2.5} color={t.accent} />
                        ) : (
                          <span style={{ color: t.accent, fontWeight: 600 }}>
                            {row.pro}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>

      {/* ── FAQ ── */}
      <FadeIn>
        <div className="ext-page__section">
          <div className="ext-page__section-header">
            <h2 className="ext-page__section-title">
              Frequently asked questions
            </h2>
          </div>
          <div className="ext-page__faq">
            {FAQS.map(function (faq, i) {
              return <FaqItem key={i} q={faq.q} a={faq.a} t={t} />;
            })}
          </div>
        </div>
      </FadeIn>

      {/* ── Bottom CTA ── */}
      <FadeIn>
        <div className="ext-page__bottom-cta">
          <XsblBull size={48} />
          <h2 className="ext-page__bottom-cta-title">
            The web should work for everyone.
          </h2>
          <p className="ext-page__bottom-cta-sub">
            Start with the free features, upgrade when you're ready.
          </p>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ext-page__cta"
          >
            <Chrome size={17} strokeWidth={2} />
            Add to Chrome
            <ExternalLink size={13} strokeWidth={2} />
          </a>
          <a href="/signup?ref=extension" className="ext-page__bottom-signup">
            Or sign up for xsbl to unlock Pro features →
          </a>
        </div>
      </FadeIn>
    </div>
  );
}
