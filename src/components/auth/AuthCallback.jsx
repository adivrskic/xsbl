import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import "../../styles/auth.css";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data?.session) {
          navigate("/dashboard", { replace: true });
        } else {
          const hashParams = new URLSearchParams(
            window.location.hash.substring(1)
          );
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setErr } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });
            if (setErr) {
              setError(setErr.message);
              return;
            }
            navigate("/dashboard", { replace: true });
          } else {
            const urlParams = new URLSearchParams(window.location.search);
            const errDesc =
              urlParams.get("error_description") ||
              hashParams.get("error_description");
            if (errDesc) {
              setError(errDesc);
            } else {
              navigate("/login", { replace: true });
            }
          }
        }
      } catch (e) {
        setError("Something went wrong. Please try logging in again.");
      }
    }

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-card auth-card--center">
          <div className="auth-icon-box auth-icon-box--red">✕</div>
          <h1 className="auth-title" style={{ fontSize: "1.4rem" }}>
            Confirmation failed
          </h1>
          <p
            className="auth-subtitle"
            style={{ lineHeight: 1.6, marginBottom: "1.5rem" }}
          >
            {error}
          </p>
          <a href="/login" className="auth-accent-link">
            ← Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div style={{ textAlign: "center" }}>
        <div className="auth-brand">
          xsbl<span className="auth-brand__dot">.</span>
        </div>
        <p className="auth-loading-text">Confirming your email…</p>
        <div className="auth-spinner" />
      </div>
    </div>
  );
}
