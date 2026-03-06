import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.css";

export default function AuthGuard({ children }) {
  const { user, org, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="auth-page">
        <div style={{ textAlign: "center" }}>
          <div className="auth-brand">
            xsbl<span className="auth-brand__dot">.</span>
          </div>
          <div className="auth-spinner" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (
    org &&
    !org.onboarding_complete &&
    location.pathname !== "/dashboard/onboarding"
  ) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  return children;
}
