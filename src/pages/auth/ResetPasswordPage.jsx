import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import XsblBull from "../../components/landing/XsblBull";
import "../../styles/auth.css";

export default function ResetPasswordPage() {
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

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <XsblBull />
          xsbl<span className="auth-logo__dot">.</span>
        </Link>

        <h1 className="auth-title">Set new password</h1>
        <p className="auth-subtitle">Enter your new password below.</p>

        {success ? (
          <div className="auth-success-box" style={{ padding: "1rem 1.2rem" }}>
            <p
              className="auth-success-box__title"
              style={{ fontSize: "0.88rem", fontWeight: 600 }}
            >
              Password updated
            </p>
            <p className="auth-success-box__text">
              Redirecting you to the dashboard…
            </p>
          </div>
        ) : !session ? (
          <div className="auth-error-box">
            <p className="auth-error-box__title">Invalid or expired link</p>
            <p className="auth-error-box__text">
              This reset link may have expired.{" "}
              <Link
                to="/login"
                className="auth-accent-link"
                style={{ fontSize: "0.82rem" }}
              >
                Request a new one
              </Link>
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <div>
              <label htmlFor="reset-pw" className="auth-label">
                New password
              </label>
              <input
                id="reset-pw"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="auth-input"
                autoFocus
              />
            </div>
            <div>
              <label htmlFor="reset-pw-confirm" className="auth-label">
                Confirm password
              </label>
              <input
                id="reset-pw-confirm"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                className="auth-input"
              />
            </div>
            {error && <p className="auth-error">{error}</p>}
            <button type="submit" disabled={loading} className="auth-submit">
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
}
