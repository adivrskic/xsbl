import { useTheme } from "../../context/ThemeContext";
import { vsOverlay } from "../../data/content";
import FadeIn from "./FadeIn";
import Section from "./Section";
import { Eyebrow, H2, SubText, Italic } from "./Typography";
import { X, ArrowRight } from "lucide-react";

function VsColumn({ items, isBad }) {
  const { t } = useTheme();

  return (
    <div
      style={{
        padding: "2.2rem",
        borderRadius: 14,
        background: isBad ? `${t.red}08` : t.greenBg,
        border: `1px solid ${isBad ? `${t.red}18` : `${t.green}18`}`,
        flex: 1,
        minWidth: 280,
      }}
    >
      <h3
        style={{
          fontFamily: "var(--mono)",
          fontSize: "0.76rem",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          marginBottom: "1.4rem",
          fontWeight: 600,
          color: isBad ? t.red : t.green,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
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

      <ul
        style={{
          listStyle: "none",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
          padding: 0,
        }}
      >
        {items.map((item, i) => (
          <li
            key={i}
            style={{
              fontSize: "0.88rem",
              color: t.ink50,
              paddingLeft: "1.5rem",
              position: "relative",
              lineHeight: 1.6,
            }}
          >
            <span style={{ position: "absolute", left: 0, top: "0.25rem" }}>
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

      <p
        style={{
          marginTop: "1.4rem",
          fontSize: "0.76rem",
          color: t.ink50,
          fontStyle: "italic",
          paddingTop: "1rem",
          borderTop: `1px solid ${t.ink08}`,
        }}
      >
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

      <div
        style={{
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          alignItems: "stretch",
        }}
      >
        <FadeIn delay={0} style={{ flex: 1, minWidth: 280, display: "flex" }}>
          <VsColumn items={vsOverlay.bad} isBad />
        </FadeIn>
        <div
          className="vs-divider"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 0.5rem",
          }}
        >
          <span
            style={{
              fontFamily: "var(--serif)",
              fontSize: "0.85rem",
              fontStyle: "italic",
              color: "rgba(128,128,128,0.5)",
            }}
          >
            vs.
          </span>
        </div>
        <FadeIn delay={0.1} style={{ flex: 1, minWidth: 280, display: "flex" }}>
          <VsColumn items={vsOverlay.good} isBad={false} />
        </FadeIn>
      </div>
      <style>{`@media (max-width: 680px) { .vs-divider { display: none !important; } }`}</style>
    </Section>
  );
}
