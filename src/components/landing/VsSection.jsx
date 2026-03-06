import { useTheme } from "../../context/ThemeContext";
import { vsOverlay } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { X, ArrowRight } from "lucide-react";
import "./VsSection.css";

function VsColumn({ items, isBad }) {
  const { t } = useTheme();

  return (
    <div
      className={"vs-column" + (isBad ? " vs-column--bad" : " vs-column--good")}
    >
      <h3 className="vs-column__heading">
        {isBad ? (
          <>
            <X size={14} strokeWidth={2.5} /> Overlays (accessiBe, UserWay…)
          </>
        ) : (
          <>
            <ArrowRight size={14} strokeWidth={2.5} /> xsbl — real accessibility
            scanning
          </>
        )}
      </h3>

      <ul className="vs-column__list">
        {items.map((item, i) => (
          <li key={i} className="vs-column__item">
            <span className="vs-column__item-icon">
              {isBad ? (
                <X size={13} color={t.red} strokeWidth={2.5} />
              ) : (
                <ArrowRight size={13} color={t.green} strokeWidth={2} />
              )}
            </span>
            {item}
          </li>
        ))}
      </ul>

      <p className="vs-column__footer">
        {isBad
          ? '"Overlay solutions do not meet the legal requirements for accessibility." — 600+ signatories'
          : "Your code gets better. Your users notice. No lawsuits."}
      </p>
    </div>
  );
}

export default function VsSection() {
  return (
    <Section>
      <FadeIn>
        <Eyebrow>The overlay problem</Eyebrow>
      </FadeIn>
      <FadeIn delay={0.05}>
        <H2>
          Overlays don't work. We <Italic>actually</Italic> fix your&nbsp;code.
        </H2>
      </FadeIn>
      <FadeIn delay={0.1}>
        <SubText>
          800+ businesses using overlay widgets were sued in 2023–2024. Over 600
          experts from Google, Apple, and Microsoft formally oppose them.
        </SubText>
      </FadeIn>

      <div className="vs-columns">
        <FadeIn delay={0} style={{ flex: 1, minWidth: 280, display: "flex" }}>
          <VsColumn items={vsOverlay.bad} isBad />
        </FadeIn>
        <div className="vs-divider">
          <span className="vs-divider__text">vs.</span>
        </div>
        <FadeIn delay={0.1} style={{ flex: 1, minWidth: 280, display: "flex" }}>
          <VsColumn items={vsOverlay.good} isBad={false} />
        </FadeIn>
      </div>
    </Section>
  );
}
