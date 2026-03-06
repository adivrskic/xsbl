import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { Send, Loader2, Check, Mail, MessageSquare } from "lucide-react";
import XsblBull from "../components/landing/XsblBull";

var SUBJECTS = [
  "General inquiry",
  "Sales / Pricing",
  "Bug report",
  "Feature request",
  "Partnership",
  "Enterprise / Custom plan",
  "Other",
];

export default function ContactPage() {
  var { t } = useTheme();
  var [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    subject: "General inquiry",
    message: "",
  });
  var [sending, setSending] = useState(false);
  var [sent, setSent] = useState(false);
  var [error, setError] = useState(null);

  var supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  var handleChange = function (field) {
    return function (e) {
      setForm(function (prev) {
        var next = Object.assign({}, prev);
        next[field] = e.target.value;
        return next;
      });
    };
  };

  var handleSubmit = async function () {
    if (!form.email.trim() || !form.message.trim()) {
      setError("Email and message are required.");
      return;
    }
    setSending(true);
    setError(null);
    try {
      var res = await fetch(supabaseUrl + "/functions/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          subject: form.subject,
          message: form.message,
          page_url: window.location.href,
        }),
      });
      var data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send");
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
    setSending(false);
  };

  var inputStyle = {
    width: "100%",
    padding: "0.65rem 0.9rem",
    borderRadius: 8,
    border: "1.5px solid " + t.ink20,
    background: t.cardBg,
    color: t.ink,
    fontFamily: "var(--body)",
    fontSize: "0.88rem",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  };

  var labelStyle = {
    display: "block",
    fontFamily: "var(--mono)",
    fontSize: "0.62rem",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    color: t.ink50,
    marginBottom: "0.3rem",
    fontWeight: 600,
  };

  return (
    <div>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "7rem clamp(1.5rem, 3vw, 3rem) 4rem",
        }}
      >
        <div
          className="hero-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "4rem",
            alignItems: "start",
          }}
        >
          {/* Left — info */}
          <div>
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: t.accent,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
              }}
            >
              <span style={{ width: 20, height: 1.5, background: t.accent }} />{" "}
              Contact
            </div>
            <h1
              style={{
                fontFamily: "var(--serif)",
                fontSize: "clamp(2rem, 3.5vw, 2.6rem)",
                fontWeight: 700,
                color: t.ink,
                lineHeight: 1.15,
                marginBottom: "0.8rem",
              }}
            >
              Get in touch
            </h1>
            <p
              style={{
                fontSize: "1.02rem",
                color: t.ink50,
                lineHeight: 1.75,
                marginBottom: "2.5rem",
                maxWidth: 400,
              }}
            >
              Have a question, feedback, or need help with your accessibility
              workflow? We'd love to hear from you.
            </p>

            {/* Quick links */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                marginBottom: "2.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.7rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: t.accentBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Mail size={16} color={t.accent} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: t.ink,
                    }}
                  >
                    Email us directly
                  </div>
                  <a
                    href="mailto:hello@xsbl.dev"
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: "0.78rem",
                      color: t.accent,
                      textDecoration: "none",
                    }}
                  >
                    hello@xsbl.dev
                  </a>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.7rem",
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: t.accentBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MessageSquare size={16} color={t.accent} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.88rem",
                      fontWeight: 600,
                      color: t.ink,
                    }}
                  >
                    Response time
                  </div>
                  <div style={{ fontSize: "0.82rem", color: t.ink50 }}>
                    We typically respond within 24 hours
                  </div>
                </div>
              </div>
            </div>

            {/* Bull mascot */}
            <div style={{ opacity: 0.5 }}>
              <XsblBull size={80} />
            </div>
          </div>

          {/* Right — form */}
          <div>
            {sent ? (
              /* Success state */
              <div
                style={{
                  padding: "3rem 2rem",
                  borderRadius: 16,
                  border: "1px solid " + t.green + "25",
                  background: t.green + "06",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: t.green + "15",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                  }}
                >
                  <Check size={24} color={t.green} strokeWidth={2.5} />
                </div>
                <h2
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.4rem",
                    fontWeight: 700,
                    color: t.ink,
                    marginBottom: "0.5rem",
                  }}
                >
                  Message sent
                </h2>
                <p
                  style={{
                    fontSize: "0.92rem",
                    color: t.ink50,
                    lineHeight: 1.6,
                    marginBottom: "1.2rem",
                    maxWidth: 340,
                    margin: "0 auto 1.2rem",
                  }}
                >
                  Thanks for reaching out! We've sent a confirmation to{" "}
                  <strong style={{ color: t.ink }}>{form.email}</strong> and
                  will get back to you within 24 hours.
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    justifyContent: "center",
                  }}
                >
                  <Link
                    to="/"
                    style={{
                      padding: "0.5rem 1.1rem",
                      borderRadius: 7,
                      border: "1.5px solid " + t.ink20,
                      background: "none",
                      color: t.ink,
                      fontFamily: "var(--body)",
                      fontSize: "0.82rem",
                      fontWeight: 500,
                      textDecoration: "none",
                    }}
                  >
                    Back to home
                  </Link>
                  <Link
                    to="/docs"
                    style={{
                      padding: "0.5rem 1.1rem",
                      borderRadius: 7,
                      border: "none",
                      background: t.accent,
                      color: "white",
                      fontFamily: "var(--body)",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Read the docs
                  </Link>
                </div>
              </div>
            ) : (
              /* Form */
              <div
                style={{
                  padding: "2rem",
                  borderRadius: 16,
                  border: "1px solid " + t.ink08,
                  background: t.cardBg,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.8rem",
                    marginBottom: "0.8rem",
                  }}
                >
                  <div>
                    <label htmlFor="contact-name" style={labelStyle}>
                      Name
                    </label>
                    <input
                      id="contact-name"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Jane Smith"
                      style={inputStyle}
                      onFocus={function (e) {
                        e.target.style.borderColor = t.accent;
                      }}
                      onBlur={function (e) {
                        e.target.style.borderColor = t.ink20;
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" style={labelStyle}>
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="jane@company.com"
                      style={inputStyle}
                      onFocus={function (e) {
                        e.target.style.borderColor = t.accent;
                      }}
                      onBlur={function (e) {
                        e.target.style.borderColor = t.ink20;
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "0.8rem",
                    marginBottom: "0.8rem",
                  }}
                >
                  <div>
                    <label htmlFor="contact-company" style={labelStyle}>
                      Company
                    </label>
                    <input
                      id="contact-company"
                      value={form.company}
                      onChange={handleChange("company")}
                      placeholder="Acme Inc"
                      style={inputStyle}
                      onFocus={function (e) {
                        e.target.style.borderColor = t.accent;
                      }}
                      onBlur={function (e) {
                        e.target.style.borderColor = t.ink20;
                      }}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-subject" style={labelStyle}>
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
                        appearance: "none",
                        backgroundImage:
                          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 10px center",
                        paddingRight: "2rem",
                      }}
                    >
                      {SUBJECTS.map(function (s) {
                        return (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label htmlFor="contact-message" style={labelStyle}>
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    style={{
                      ...inputStyle,
                      resize: "vertical",
                      fontFamily: "var(--body)",
                      lineHeight: 1.6,
                    }}
                    onFocus={function (e) {
                      e.target.style.borderColor = t.accent;
                    }}
                    onBlur={function (e) {
                      e.target.style.borderColor = t.ink20;
                    }}
                  />
                </div>

                {error && (
                  <div
                    style={{
                      padding: "0.5rem 0.7rem",
                      borderRadius: 6,
                      background: t.red + "08",
                      border: "1px solid " + t.red + "20",
                      color: t.red,
                      fontSize: "0.78rem",
                      marginBottom: "0.8rem",
                    }}
                  >
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={
                    sending || !form.email.trim() || !form.message.trim()
                  }
                  style={{
                    width: "100%",
                    padding: "0.7rem 1.5rem",
                    borderRadius: 8,
                    border: "none",
                    background: t.accent,
                    color: "white",
                    fontFamily: "var(--body)",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: sending ? "not-allowed" : "pointer",
                    opacity:
                      sending || !form.email.trim() || !form.message.trim()
                        ? 0.6
                        : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.4rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={function (e) {
                    if (!sending)
                      e.currentTarget.style.background = t.accentLight;
                  }}
                  onMouseLeave={function (e) {
                    e.currentTarget.style.background = t.accent;
                  }}
                >
                  {sending ? (
                    <Loader2 size={16} className="xsbl-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {sending ? "Sending..." : "Send message"}
                </button>

                <p
                  style={{
                    fontSize: "0.68rem",
                    color: t.ink50,
                    marginTop: "0.6rem",
                    textAlign: "center",
                  }}
                >
                  We'll respond to your email within 24 hours. You'll also
                  receive a confirmation email.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`.xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
