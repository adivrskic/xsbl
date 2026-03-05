import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import XsblBull from "../../components/landing/XsblBull";
import { Sun, Moon } from "lucide-react";

export default function SignupPage() {
  const { t, dark, toggle } = useTheme();
  const { signUp, signInWithOAuth } = useAuth();
  const navigate = useNavigate();

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

  const oauth = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.6rem",
    padding: "0.65rem 1rem",
    borderRadius: 8,
    border: `1.5px solid ${t.ink20}`,
    background: "none",
    color: t.ink,
    fontFamily: "var(--body)",
    fontSize: "0.88rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.2s",
  };

  const hov = (e, on) => {
    e.currentTarget.style.borderColor = on ? t.ink : t.ink20;
    e.currentTarget.style.background = on ? t.ink04 : "none";
  };

  if (confirmSent) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.paper,
          padding: "2rem",
          position: "relative",
        }}
      >
        <button
          onClick={toggle}
          title="Toggle theme"
          style={{
            position: "absolute",
            top: "1.5rem",
            right: "1.5rem",
            background: t.ink08,
            border: "none",
            borderRadius: 8,
            padding: "0.45rem 0.55rem",
            cursor: "pointer",
            color: t.ink,
            transition: "background 0.2s",
            display: "flex",
            alignItems: "center",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = t.ink20;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = t.ink08;
          }}
        >
          {dark ? (
            <Sun size={16} strokeWidth={2} />
          ) : (
            <Moon size={16} strokeWidth={2} />
          )}
        </button>
        <div style={{ width: "100%", maxWidth: 400, textAlign: "center" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: t.accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.5rem",
              fontSize: "1.5rem",
            }}
          >
            ✉
          </div>
          <h1
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.5rem",
              fontWeight: 700,
              color: t.ink,
              marginBottom: "0.75rem",
            }}
          >
            Check your email
          </h1>
          <p
            style={{
              color: t.ink50,
              fontSize: "0.92rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            We sent a confirmation link to{" "}
            <strong style={{ color: t.ink }}>{email}</strong>. Click it to
            activate your account.
          </p>
          <Link
            to="/login"
            style={{
              color: t.accent,
              fontSize: "0.88rem",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.paper,
        padding: "2rem",
        position: "relative",
      }}
    >
      <button
        onClick={toggle}
        title="Toggle theme"
        style={{
          position: "absolute",
          top: "1.5rem",
          right: "1.5rem",
          background: t.ink08,
          border: "none",
          borderRadius: 8,
          padding: "0.45rem 0.55rem",
          cursor: "pointer",
          color: t.ink,
          transition: "background 0.2s",
          display: "flex",
          alignItems: "center",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = t.ink20;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = t.ink08;
        }}
      >
        {dark ? (
          <Sun size={16} strokeWidth={2} />
        ) : (
          <Moon size={16} strokeWidth={2} />
        )}
      </button>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <Link
          to="/"
          style={{
            fontFamily: "var(--mono)",
            fontWeight: 600,
            fontSize: "1.5rem",
            color: t.ink,
            textDecoration: "none",
            marginBottom: "2.5rem",
            display: "flex",
            alignItems: "center",
            gap: "4px",
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
          Create your account
        </h1>
        <p
          style={{ color: t.ink50, fontSize: "0.92rem", marginBottom: "2rem" }}
        >
          Start scanning your sites for accessibility issues.
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.6rem",
            marginBottom: "1.5rem",
          }}
        >
          <button
            onClick={() => handleOAuth("github")}
            style={oauth}
            onMouseEnter={(e) => hov(e, true)}
            onMouseLeave={(e) => hov(e, false)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill={t.ink}>
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Continue with GitHub
          </button>
          <button
            onClick={() => handleOAuth("google")}
            style={oauth}
            onMouseEnter={(e) => hov(e, true)}
            onMouseLeave={(e) => hov(e, false)}
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

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ flex: 1, height: 1, background: t.ink08 }} />
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              color: t.ink50,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            or
          </span>
          <div style={{ flex: 1, height: 1, background: t.ink08 }} />
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
        >
          <div>
            <label
              htmlFor="signup-name"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: t.ink,
                marginBottom: "0.35rem",
              }}
            >
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Jane Smith"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.ink20)}
            />
          </div>
          <div>
            <label
              htmlFor="signup-email"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: t.ink,
                marginBottom: "0.35rem",
              }}
            >
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              style={inp}
              onFocus={(e) => (e.target.style.borderColor = t.accent)}
              onBlur={(e) => (e.target.style.borderColor = t.ink20)}
            />
          </div>
          <div>
            <label
              htmlFor="signup-pw"
              style={{
                display: "block",
                fontSize: "0.78rem",
                fontWeight: 500,
                color: t.ink,
                marginBottom: "0.35rem",
              }}
            >
              Password
            </label>
            <input
              id="signup-pw"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
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
            {loading ? "Creating account\u2026" : "Create account"}
          </button>
        </form>

        <p
          style={{
            marginTop: "1.5rem",
            fontSize: "0.85rem",
            color: t.ink50,
            textAlign: "center",
          }}
        >
          Already have an account?{" "}
          <Link
            to="/login"
            style={{ color: t.accent, textDecoration: "none", fontWeight: 600 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
