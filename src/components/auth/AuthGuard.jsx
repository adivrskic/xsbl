import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import "../../styles/auth.css";

/*
  AuthGuard — protects dashboard routes.

  FIX: Previously, if the signup trigger failed and org was null,
  the user landed on a broken dashboard. Now if org is null after
  a brief grace period (for async fetch), redirect to onboarding
  where the org can be created manually.
*/

export default function AuthGuard({ children }) {
  const { user, org, loading } = useAuth();
  const location = useLocation();

  // Grace period: org is fetched async after auth resolves, so
  // there's a brief window where user exists but org is null.
  // Wait up to 2s before deciding org truly doesn't exist.
  const [waited, setWaited] = useState(false);
  const timerRef = useRef(null);

  useEffect(function () {
    timerRef.current = setTimeout(function () {
      setWaited(true);
    }, 2000);
    return function () {
      clearTimeout(timerRef.current);
    };
  }, []);

  // Clear timer early if org loads
  useEffect(
    function () {
      if (org) {
        clearTimeout(timerRef.current);
        setWaited(true);
      }
    },
    [org]
  );

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

  // Still waiting for org to load — show spinner
  if (!org && !waited) {
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

  // No org after grace period (trigger failed) OR onboarding not done
  if (
    (!org || !org.onboarding_complete) &&
    location.pathname !== "/dashboard/onboarding"
  ) {
    return <Navigate to="/dashboard/onboarding" replace />;
  }

  return children;
}
