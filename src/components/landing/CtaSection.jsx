import { useTheme } from "../../context/ThemeContext";
import FadeIn from "./FadeIn";

export default function CtaSection() {
  const { t } = useTheme();

  return (
    <section
      style={{
        background: t.ctaBg,
        color: t.ctaText,
        padding: "7rem clamp(1.5rem, 3vw, 3rem)",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -300,
          left: "50%",
          transform: "translateX(-50%)",
          width: 600,
          height: 600,
          background: `radial-gradient(circle, ${t.accent}22 0%, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <FadeIn>
        <div
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            color: t.accentLight,
            fontWeight: 600,
            marginBottom: "1rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.6rem",
          }}
        >
          <span style={{ width: 20, height: 1.5, background: t.accentLight }} />
          Get started
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "clamp(1.9rem, 3.5vw, 2.8rem)",
            lineHeight: 1.18,
            fontWeight: 700,
            maxWidth: 600,
            margin: "0 auto 1.2rem",
            color: t.ctaText,
          }}
        >
          Your users deserve a web that{" "}
          <span
            style={{
              fontWeight: 400,
              fontStyle: "italic",
              color: t.accentLight,
            }}
          >
            works.
          </span>
        </h2>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p
          style={{
            color: `${t.ctaText}88`,
            fontSize: "1.02rem",
            maxWidth: 480,
            margin: "0 auto 2.5rem",
            lineHeight: 1.7,
          }}
        >
          Connect your repo. Scan your site. Merge the fix PR. Accessible in
          minutes.
        </p>
      </FadeIn>

      <FadeIn
        delay={0.15}
        style={{
          display: "flex",
          gap: "1rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <a
          href="/signup"
          style={{
            background: t.accent,
            color: "white",
            border: "none",
            fontFamily: "var(--body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            padding: "0.72rem 1.6rem",
            borderRadius: 8,
            textDecoration: "none",
            transition: "all 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#fff";
            e.currentTarget.style.color = t.accent;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = t.accent;
            e.currentTarget.style.color = "white";
          }}
        >
          Start scanning free →
        </a>
        <a
          href="/login"
          style={{
            background: "none",
            color: t.ctaText,
            border: `1.5px solid ${t.ctaText}33`,
            fontFamily: "var(--body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            padding: "0.65rem 1.5rem",
            borderRadius: 8,
            textDecoration: "none",
            transition: "all 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = t.ctaText;
            e.currentTarget.style.background = `${t.ctaText}0a`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = `${t.ctaText}33`;
            e.currentTarget.style.background = "none";
          }}
        >
          Log in to dashboard
        </a>
      </FadeIn>
    </section>
  );
}
