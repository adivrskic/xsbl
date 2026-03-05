import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import XsblBull from "../../components/landing/XsblBull";

export default function ResetPasswordPage() {
  const { t } = useTheme();
  const { updatePassword, session } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    const { error: err } = await updatePassword(password);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      setTimeout(() => navigate("/dashboard", { replace: true }), 2000);
    }
  };

  const inp = {
    width: "100%",
    padding: "0.6rem 0.9rem",
    borderRadius: 8,
    border: `1.5px solid ${t.ink20}`,
    background: t.cardBg,
    color: t.ink,
    fontFamily: "var(--body)",
    fontSize: "0.88rem",
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  };

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
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link
          to="/"
          style={{
            fontFamily: "var(--mono)",
            fontWeight: 600,
            fontSize: "1.5rem",
            color: t.ink,
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            marginBottom: "2.5rem",
          }}
        >
          <XsblBull />
          xsbl<span style={{ color: t.accent }}>.</span>
        </Link>

        <h1
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.8rem",
            fontWeight: 700,
            color: t.ink,
            marginBottom: "0.5rem",
          }}
        >
          Set new password
        </h1>
        <p
          style={{ color: t.ink50, fontSize: "0.92rem", marginBottom: "2rem" }}
        >
          Enter your new password below.
        </p>

        {success ? (
          <div
            style={{
              padding: "1rem 1.2rem",
              borderRadius: 8,
              background: `${t.green}10`,
              border: `1px solid ${t.green}30`,
            }}
          >
            <p
              style={{
                fontSize: "0.88rem",
                color: t.green,
                margin: 0,
                fontWeight: 600,
                marginBottom: "0.3rem",
              }}
            >
              Password updated
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: t.ink50,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Redirecting you to the dashboard…
            </p>
          </div>
        ) : !session ? (
          <div
            style={{
              padding: "1rem 1.2rem",
              borderRadius: 8,
              background: `${t.red}08`,
              border: `1px solid ${t.red}20`,
            }}
          >
            <p
              style={{
                fontSize: "0.88rem",
                color: t.red,
                margin: 0,
                fontWeight: 500,
                marginBottom: "0.3rem",
              }}
            >
              Invalid or expired link
            </p>
            <p
              style={{
                fontSize: "0.82rem",
                color: t.ink50,
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              This reset link may have expired.{" "}
              <Link
                to="/login"
                style={{
                  color: t.accent,
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Request a new one
              </Link>
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
          >
            <div>
              <label
                htmlFor="reset-pw"
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: t.ink,
                  marginBottom: "0.35rem",
                }}
              >
                New password
              </label>
              <input
                id="reset-pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                style={inp}
                autoFocus
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e) => (e.target.style.borderColor = t.ink20)}
              />
            </div>
            <div>
              <label
                htmlFor="reset-pw-confirm"
                style={{
                  display: "block",
                  fontSize: "0.78rem",
                  fontWeight: 500,
                  color: t.ink,
                  marginBottom: "0.35rem",
                }}
              >
                Confirm password
              </label>
              <input
                id="reset-pw-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                style={inp}
                onFocus={(e) => (e.target.style.borderColor = t.accent)}
                onBlur={(e) => (e.target.style.borderColor = t.ink20)}
              />
            </div>
            {error && (
              <p style={{ color: t.red, fontSize: "0.82rem", margin: 0 }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: "0.4rem",
                padding: "0.7rem",
                borderRadius: 8,
                border: "none",
                background: t.accent,
                color: "white",
                fontFamily: "var(--body)",
                fontSize: "0.9rem",
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: t.ink50,
            textAlign: "center",
          }}
        >
          <Link
            to="/login"
            style={{
              color: t.accent,
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
