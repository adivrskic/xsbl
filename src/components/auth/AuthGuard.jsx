import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

export default function AuthGuard({ children }) {
  const { user, org, loading } = useAuth();
  const { t } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.paper,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontWeight: 600,
              fontSize: "1.3rem",
              color: t.ink,
              marginBottom: "1rem",
            }}
          >
            xsbl<span style={{ color: t.accent }}>.</span>
          </div>
          <div
            style={{
              width: 28,
              height: 28,
              border: `3px solid ${t.ink08}`,
              borderTopColor: t.accent,
              borderRadius: "50%",
              animation: "xsbl-spin 0.6s linear infinite",
              margin: "0 auto",
            }}
          />
          <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to onboarding if not completed (but don't redirect if already on onboarding)
  if (
    org &&
    !org.onboarding_complete &&
    location.pathname !== "/dashboard/onboarding"
  ) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  return children;
}
