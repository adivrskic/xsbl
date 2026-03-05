import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useTheme } from "../../context/ThemeContext";

export default function AuthCallback() {
  const { t } = useTheme();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    async function handleCallback() {
      try {
        // Supabase JS v2 automatically picks up the token from the URL hash/query
        // and exchanges it for a session when we call getSession after the redirect.
        const { data, error: authError } = await supabase.auth.getSession();

        if (authError) {
          setError(authError.message);
          return;
        }

        if (data?.session) {
          // Successfully authenticated — go to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // No session yet — try exchanging the hash params
          // Supabase v2 with PKCE or implicit flow puts tokens in the URL hash
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
            // Check for error in URL params (e.g. expired token)
            const urlParams = new URLSearchParams(window.location.search);
            const errDesc =
              urlParams.get("error_description") ||
              hashParams.get("error_description");
            if (errDesc) {
              setError(errDesc);
            } else {
              // Fallback — just redirect to login
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
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.paper,
          padding: "2rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: t.red + "12",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "1.5rem",
            }}
          >
            ✕
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: t.ink,
              marginBottom: "0.75rem",
            }}
          >
            Confirmation failed
          </h1>
          <p
            style={{
              color: t.ink50,
              fontSize: "0.88rem",
              lineHeight: 1.6,
              marginBottom: "1.5rem",
            }}
          >
            {error}
          </p>
          <a
            href="/login"
            style={{
              color: t.accent,
              fontSize: "0.88rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Go to login
          </a>
        </div>
      </div>
    );
  }

  // Loading state while processing the callback
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
        <p
          style={{
            color: t.ink50,
            fontSize: "0.88rem",
            marginBottom: "1rem",
          }}
        >
          Confirming your email…
        </p>
        <div
          style={{
            width: 28,
            height: 28,
            border: "3px solid " + t.ink08,
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
