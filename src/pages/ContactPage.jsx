import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import { Send, Loader2, Check, Mail, MessageSquare } from "lucide-react";
import "../styles/contact.css";

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

  var handleSubmit = async function (e) {
    e.preventDefault();
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

  return (
    <div>
      <div className="contact-page">
        <div className="contact-layout">
          {/* Left — info */}
          <div>
            <div className="eyebrow">
              <span className="eyebrow-line" /> Contact
            </div>
            <h1 className="contact-page__title">Get in touch</h1>
            <p className="sub-text contact-page__desc">
              Have a question, feedback, or need help with your accessibility
              workflow? We'd love to hear from you.
            </p>

            <div className="contact-info">
              <div className="contact-info__item">
                <div className="contact-info__icon">
                  <Mail size={16} color={t.accent} />
                </div>
                <div>
                  <div className="contact-info__label">Email us directly</div>
                  <a href="mailto:hello@xsbl.io" className="contact-info__link">
                    hello@xsbl.io
                  </a>
                </div>
              </div>
              <div className="contact-info__item">
                <div className="contact-info__icon">
                  <MessageSquare size={16} color={t.accent} />
                </div>
                <div>
                  <div className="contact-info__label">Response time</div>
                  <div className="contact-info__value">
                    We typically respond within 24 hours
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div aria-live="polite">
            {sent ? (
              <div className="contact-success" role="status">
                <div className="contact-success__icon">
                  <Check size={24} color={t.green} strokeWidth={2.5} />
                </div>
                <h2 className="contact-success__title">Message sent</h2>
                <p className="contact-success__text">
                  Thanks for reaching out! We've sent a confirmation to{" "}
                  <strong>{form.email}</strong> and will get back to you within
                  24 hours.
                </p>
                <div className="contact-success__actions">
                  <Link to="/" className="btn-outline">
                    Back to home
                  </Link>
                  <Link
                    to="/docs"
                    className="btn btn-accent contact-success__btn-docs"
                  >
                    Read the docs
                  </Link>
                </div>
              </div>
            ) : (
              <form
                className="contact-form"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Contact form"
              >
                <div className="contact-form__grid">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="contact-form__label"
                    >
                      Name
                    </label>
                    <input
                      id="contact-name"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Jane Smith"
                      className="contact-form__input"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="contact-form__label"
                    >
                      Email *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="jane@company.com"
                      className="contact-form__input"
                      autoComplete="email"
                      aria-required="true"
                      aria-invalid={
                        error && !form.email.trim() ? "true" : undefined
                      }
                    />
                  </div>
                </div>

                <div className="contact-form__grid">
                  <div>
                    <label
                      htmlFor="contact-company"
                      className="contact-form__label"
                    >
                      Company
                    </label>
                    <input
                      id="contact-company"
                      value={form.company}
                      onChange={handleChange("company")}
                      placeholder="Acme Inc"
                      className="contact-form__input"
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-subject"
                      className="contact-form__label"
                    >
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={handleChange("subject")}
                      className="contact-form__select"
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

                <div className="contact-form__field">
                  <label
                    htmlFor="contact-message"
                    className="contact-form__label"
                  >
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    className="contact-form__textarea"
                    aria-required="true"
                    aria-invalid={
                      error && !form.message.trim() ? "true" : undefined
                    }
                  />
                </div>

                {error && (
                  <div className="contact-form__error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={
                    sending || !form.email.trim() || !form.message.trim()
                  }
                  className="contact-form__submit"
                >
                  {sending ? (
                    <Loader2 size={16} className="xsbl-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {sending ? "Sending..." : "Send message"}
                </button>

                <p className="contact-form__hint">
                  We'll respond to your email within 24 hours. You'll also
                  receive a confirmation email.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
