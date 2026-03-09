import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import XsblBull from "../../components/landing/XsblBull";
import { Sun, Moon } from "lucide-react";
import "../../styles/auth.css";

export default function SignupPage() {
  const { t, dark, toggle } = useTheme();
  const { signUp, signInWithOAuth } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const inviteId = searchParams.get("invite");

  // Persist invite ID so it survives OAuth redirects
  if (inviteId) {
    try {
      localStorage.setItem("xsbl-pending-invite", inviteId);
    } catch (e) {}
  }

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { data, error: err } = await signUp(email, password, fullName);
    if (err) {
      setError(err.message);
      setLoading(false);
    } else if (data?.user?.identities?.length === 0) {
      setError("An account with this email already exists.");
      setLoading(false);
    } else if (data?.session) {
      navigate("/dashboard", { replace: true });
    } else {
      setConfirmSent(true);
      setLoading(false);
    }
  };

  const handleOAuth = async (provider) => {
    setError(null);
    const { error: err } = await signInWithOAuth(provider);
    if (err) setError(err.message);
  };

  if (confirmSent) {
    return (
      <div className="auth-page">
        <button
          onClick={toggle}
          title="Toggle theme"
          className="theme-toggle auth-theme-toggle"
        >
          {dark ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>
        <div className="auth-card auth-card--center">
          <div className="auth-icon-box auth-icon-box--accent">✉</div>
          <h1 className="auth-title" style={{ fontSize: "1.5rem" }}>
            Check your email
          </h1>
          <p className="auth-subtitle" style={{ lineHeight: 1.6 }}>
            We sent a confirmation link to{" "}
            <strong style={{ color: "var(--ink)" }}>{email}</strong>. Click it
            to activate your account.
          </p>
          <Link to="/login" className="auth-accent-link">
            ← Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <button
        onClick={toggle}
        title="Toggle theme"
        className="theme-toggle auth-theme-toggle"
      >
        {dark ? (
          <Sun size={16} strokeWidth={2} />
        ) : (
          <Moon size={16} strokeWidth={2} />
        )}
      </button>
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <XsblBull />
          xsbl<span className="auth-logo__dot">.</span>
        </Link>

        <h1 className="auth-title">
          {inviteId ? "Create your account" : "Create your account"}
        </h1>
        <p className="auth-subtitle">
          {inviteId
            ? "Sign up to view the accessibility dashboard shared with you."
            : "Start scanning your sites for accessibility issues."}
        </p>

        <div className="auth-oauth-group">
          <button
            onClick={() => handleOAuth("github")}
            className="auth-oauth-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={t.ink}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
          <button
            onClick={() => handleOAuth("google")}
            className="auth-oauth-btn"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
        </div>

        <div className="auth-divider">
          <div className="auth-divider__line" />
          <span className="auth-divider__text">or</span>
          <div className="auth-divider__line" />
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div>
            <label htmlFor="signup-name" className="auth-label">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              className="auth-input"
            />
          </div>
          <div>
            <label htmlFor="signup-email" className="auth-label">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="auth-input"
            />
          </div>
          <div>
            <label htmlFor="signup-pw" className="auth-label">
              Password
            </label>
            <input
              id="signup-pw"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="auth-input"
            />
          </div>
          {error && <p className="auth-error">{error}</p>}
          <button type="submit" disabled={loading} className="auth-submit">
            {loading ? "Creating account\u2026" : "Create account"}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to={"/login" + (inviteId ? "?invite=" + inviteId : "")}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
