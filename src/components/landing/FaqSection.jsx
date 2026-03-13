import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { ChevronDown } from "lucide-react";
import "./FaqSection.css";

var FAQ_ITEMS = [
  {
    q: "Is xsbl an overlay?",
    a: "No — and that distinction matters. Overlays inject JavaScript on your live site to paper over issues at runtime. They don't fix your code, they break screen readers, and courts have rejected them as compliance evidence. xsbl scans your rendered pages in a real browser, identifies the actual WCAG violations in your markup, and gives you code-level fixes (or opens a PR with them). Your source code gets better, not just the surface.",
  },
  {
    q: "What's the difference between WCAG AA and AAA?",
    a: "WCAG 2.2 AA is the baseline most organizations aim for — it covers essentials like color contrast (4.5:1 for normal text), alt text, keyboard navigation, and form labels. AAA is stricter: contrast jumps to 7:1, text must be resizable to 200%, and more. xsbl scans for both levels so you can decide how far to go. Most legal requirements reference AA, but hitting AAA on critical pages is a strong signal to procurement teams.",
  },
  {
    q: "Do you store my source code?",
    a: "No. xsbl scans the publicly rendered version of your pages — the same HTML a browser sees. When you connect GitHub for PR creation, we read the relevant files only at the moment of generating a fix, and we don't persist your repository contents. Scan results (issue descriptions, selectors, fix suggestions) are stored in your account so you can track progress over time.",
  },
  {
    q: "How does the GitHub PR integration work?",
    a: "Connect your repo from the site detail page. When xsbl finds issues, it generates contextual code fixes based on your actual markup. You can create a PR for a single issue or bulk-fix up to 20 issues in one PR. The PR includes a description of what changed and why, mapped to specific WCAG criteria. Your team reviews and merges as normal.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. All paid plans are month-to-month with no contracts. Cancel from your billing page and you'll keep access through the end of your current billing period. Your scan history and reports stay available on the free tier after downgrading.",
  },
  {
    q: "What does 'AI fix suggestions' mean?",
    a: "When xsbl finds an issue — say a missing alt attribute or a low-contrast color — it doesn't just tell you what's wrong. It reads your actual element markup and generates a specific code snippet you can copy-paste to fix it. For example, instead of 'add an alt attribute,' you'd get the actual alt text written for your specific image in context.",
  },
  {
    q: "Is xsbl enough to be ADA / EAA compliant?",
    a: "Automated scanning catches roughly 30–50% of WCAG issues — the rest require manual testing (like checking tab order makes sense, or that custom widgets work with screen readers). xsbl covers the automated layer thoroughly and provides the evidence trail auditors want, but full compliance typically also involves manual review. We're upfront about that because the tools that promise 100% automated compliance are the ones getting fined.",
  },
  {
    q: "How is this different from axe, Lighthouse, or WAVE?",
    a: "Those are excellent tools — xsbl actually uses axe-core under the hood. The difference is workflow: xsbl wraps the scan engine in continuous monitoring, AI-generated fixes, GitHub PR creation, score tracking, and compliance reporting. Think of it as axe + CI/CD + project management for accessibility, rather than a one-off audit tab.",
  },
];

function FaqItem({ q, a, open, onToggle, delay }) {
  var { t } = useTheme();

  return (
    <FadeIn delay={delay}>
      <div className={"faq-item" + (open ? " faq-item--open" : "")}>
        <button
          className="faq-item__trigger"
          onClick={onToggle}
          aria-expanded={open}
        >
          <span className="faq-item__question">{q}</span>
          <ChevronDown
            size={18}
            strokeWidth={2}
            className={
              "faq-item__chevron" + (open ? " faq-item__chevron--open" : "")
            }
            color={open ? t.accent : t.ink50}
          />
        </button>
        <div
          className="faq-item__body"
          role="region"
          style={{
            gridTemplateRows: open ? "1fr" : "0fr",
          }}
        >
          <div className="faq-item__answer">
            <p className="faq-item__text">{a}</p>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

export default function FaqSection() {
  var [openIndex, setOpenIndex] = useState(null);

  var handleToggle = function (i) {
    setOpenIndex(function (prev) {
      return prev === i ? null : i;
    });
  };

  return (
    <Section id="faq">
      <FadeIn>
        <Eyebrow>FAQ</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Common <Italic>questions</Italic>
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>Straight answers, no bull.</SubText>
      </FadeIn>

      <div className="faq-layout">
        <div className="faq-list">
          {FAQ_ITEMS.map(function (item, i) {
            return (
              <FaqItem
                key={i}
                q={item.q}
                a={item.a}
                open={openIndex === i}
                onToggle={function () {
                  handleToggle(i);
                }}
                delay={0.03 * i}
              />
            );
          })}
        </div>

        <FadeIn delay={0.15}>
          <div className="faq-cta">
            <div className="faq-cta__inner">
              <h3 className="faq-cta__title">
                Start fixing accessibility issues today
              </h3>
              <p className="faq-cta__desc">
                Free plan included. No credit card. See your first results in 30
                seconds.
              </p>
              <a href="/signup" className="faq-cta__btn">
                Get started free
              </a>
              <div className="faq-cta__sub">
                or{" "}
                <a href="/contact" className="faq-cta__link">
                  book a demo
                </a>{" "}
                for teams
              </div>
              <div className="faq-cta__proof">
                <span className="faq-cta__proof-dot" />
                2,400+ sites scanned
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
