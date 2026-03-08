import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { ArrowLeft, AlertTriangle } from "lucide-react";

export default function NotFoundPage() {
  var { t } = useTheme();

  return (
    <main
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        padding: "2rem",
        textAlign: "center",
      }}
    >
      <div>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: t.ink04,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1.2rem",
          }}
        >
          <AlertTriangle size={24} color={t.ink50} strokeWidth={1.8} />
        </div>
        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "2.2rem",
            fontWeight: 700,
            color: t.ink,
            marginBottom: "0.5rem",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: "0.95rem",
            color: t.ink50,
            lineHeight: 1.6,
            marginBottom: "1.5rem",
            maxWidth: 360,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          to="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            fontFamily: "var(--mono)",
            fontSize: "0.82rem",
            color: t.accent,
            textDecoration: "none",
          }}
        >
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>
    </main>
  );
}
