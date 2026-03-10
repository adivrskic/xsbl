import { useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { Link } from "react-router-dom";
import FadeIn from "../components/landing/FadeIn";
import {
  Send,
  Loader2,
  Check,
  Users,
  FileText,
  Shield,
  BarChart3,
  GitPullRequest,
  Eye,
  Clock,
  Settings,
  Globe,
} from "lucide-react";
import "../styles/agency.css";

var FEATURES = [
  {
    icon: Users,
    title: "Client read-only dashboards",
    desc: "Invite clients directly into xsbl. They see their sites, scores, and issues — nothing else. No more exporting PDFs and emailing them.",
  },
  {
    icon: FileText,
    title: "White-label PDF reports",
    desc: "Replace xsbl branding with your company name. Deliver professional accessibility reports under your brand, automatically or on demand.",
  },
  {
    icon: Shield,
    title: "SOC 2 & ISO 27001 evidence",
    desc: "One-click evidence packages for compliance audits. Scan history, remediation timelines, access controls — structured by framework.",
  },
  {
    icon: BarChart3,
    title: "Complete audit trail",
    desc: "Every scan, fix, settings change, and user action logged. Searchable, filterable, exportable. Prove your accessibility program to any auditor.",
  },
  {
    icon: GitPullRequest,
    title: "Unlimited AI fixes & PRs",
    desc: "999 AI suggestions and 999 GitHub PRs per month — effectively unlimited. Bulk fix all critical issues across a client site in one click.",
  },
  {
    icon: Eye,
    title: "Accessibility simulator",
    desc: "Show clients exactly how their site looks under 8 vision conditions. Real screenshots with scientifically accurate simulation.",
  },
  {
    icon: Clock,
    title: "Scheduled scans & reports",
    desc: "Set daily or weekly scans per site. Configure automatic PDF report delivery to client inboxes — your brand, their data, zero manual work.",
  },
  {
    icon: Settings,
    title: "Custom scan profiles",
    desc: "Exclude rules, selectors, or third-party widgets per client. Toggle WCAG AAA and best-practice checks. Profiles persist across all scans.",
  },
];

var COMPARE = [
  { feature: "Sites monitored", pro: "Unlimited", agency: "Unlimited" },
  { feature: "Scans per month", pro: "100", agency: "Unlimited" },
  { feature: "AI fix suggestions", pro: "200/mo", agency: "999/mo" },
  { feature: "GitHub PRs", pro: "25/mo", agency: "999/mo" },
  { feature: "Issues per PR", pro: "10", agency: "Unlimited" },
  { feature: "Client dashboards", pro: "—", agency: "✓" },
  { feature: "White-label reports", pro: "—", agency: "✓" },
  { feature: "Scheduled report delivery", pro: "—", agency: "✓" },
  { feature: "Custom scan profiles", pro: "—", agency: "✓" },
  { feature: "Audit log", pro: "—", agency: "✓" },
  { feature: "SOC 2 / ISO evidence export", pro: "—", agency: "✓" },
  { feature: "Public status page", pro: "✓", agency: "✓" },
];

var TEAM_SIZES = [
  "1–5 client sites",
  "6–20 client sites",
  "21–50 client sites",
  "50+ client sites",
  "Just exploring",
];

export default function AgencyPage() {
  var { t } = useTheme();
  var [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    teamSize: "1–5 client sites",
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
    if (!form.email.trim() || !form.name.trim()) {
      setError("Name and email are required.");
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
          subject: "Agency plan inquiry — " + form.teamSize,
          message: form.message || "(No additional message)",
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
      <div className="agency-page">
        {/* Hero */}
        <FadeIn>
          <div className="agency-hero">
            <div className="eyebrow">
              <span className="eyebrow-line" /> Agency plan
            </div>
            <h1 className="agency-hero__title">
              Accessibility at scale.
              <br />
              Built for agencies.
            </h1>
            <p className="agency-hero__sub">
              Manage accessibility across every client site from one dashboard.
              White-label reports, client portals, compliance evidence, and
              unlimited AI-powered fixes — all under your brand.
            </p>
            <div className="agency-hero__badges">
              <span className="agency-hero__badge agency-hero__badge--accent">
                $249/mo
              </span>
              <span className="agency-hero__badge">Unlimited sites</span>
              <span className="agency-hero__badge">Unlimited scans</span>
              <span className="agency-hero__badge">Cancel anytime</span>
            </div>
          </div>
        </FadeIn>

        {/* Features grid */}
        <div className="agency-features">
          {FEATURES.map(function (feat, i) {
            var Icon = feat.icon;
            return (
              <FadeIn key={i} delay={i * 0.04}>
                <div className="agency-feat">
                  <div className="agency-feat__icon">
                    <Icon size={17} color={t.accent} strokeWidth={1.8} />
                  </div>
                  <h2 className="agency-feat__title">{feat.title}</h2>
                  <p className="agency-feat__desc">{feat.desc}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Comparison table */}
        <FadeIn>
          <div className="agency-compare">
            <h2 className="agency-compare__title">Agency vs Pro</h2>
            <table className="agency-compare__table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Pro ($69/mo)</th>
                  <th>Agency ($249/mo)</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE.map(function (row, i) {
                  return (
                    <tr key={i}>
                      <td>{row.feature}</td>
                      <td>{row.pro}</td>
                      <td>{row.agency}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* CTA + Form */}
        <FadeIn delay={0.05}>
          <div className="agency-cta">
            <div className="agency-cta__info">
              <h2 className="agency-cta__title">Get started with Agency</h2>
              <p className="agency-cta__desc">
                Tell us about your agency and we'll set you up with a
                personalized demo. Most agencies are scanning within 24 hours.
              </p>
              <ul className="agency-cta__bullets">
                {[
                  "Personalized onboarding call",
                  "Help migrating existing client audits",
                  "Custom scan profile setup",
                  "Priority support via Slack or email",
                  "Volume discounts for 50+ sites",
                ].map(function (item, i) {
                  return (
                    <li key={i} className="agency-cta__bullet">
                      <Check
                        size={14}
                        className="agency-cta__bullet-icon"
                        strokeWidth={2.5}
                      />
                      {item}
                    </li>
                  );
                })}
              </ul>
            </div>

            {sent ? (
              <div className="agency-success" role="status">
                <div className="agency-success__icon">
                  <Check size={24} color={t.green} strokeWidth={2.5} />
                </div>
                <h3 className="agency-success__title">We'll be in touch</h3>
                <p className="agency-success__text">
                  Thanks for your interest! We've sent a confirmation to{" "}
                  <strong style={{ color: t.ink }}>{form.email}</strong> and
                  will reach out within one business day to schedule your demo.
                </p>
              </div>
            ) : (
              <form
                className="agency-form"
                onSubmit={handleSubmit}
                noValidate
                aria-label="Agency plan inquiry form"
              >
                <div className="agency-form__row">
                  <div>
                    <label htmlFor="agency-name" className="agency-form__label">
                      Name *
                    </label>
                    <input
                      id="agency-name"
                      value={form.name}
                      onChange={handleChange("name")}
                      placeholder="Jane Smith"
                      className="agency-form__input"
                      autoComplete="name"
                      aria-required="true"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="agency-email"
                      className="agency-form__label"
                    >
                      Work email *
                    </label>
                    <input
                      id="agency-email"
                      type="email"
                      value={form.email}
                      onChange={handleChange("email")}
                      placeholder="jane@agency.com"
                      className="agency-form__input"
                      autoComplete="email"
                      aria-required="true"
                    />
                  </div>
                </div>

                <div className="agency-form__row">
                  <div>
                    <label
                      htmlFor="agency-company"
                      className="agency-form__label"
                    >
                      Company
                    </label>
                    <input
                      id="agency-company"
                      value={form.company}
                      onChange={handleChange("company")}
                      placeholder="Acme Digital Agency"
                      className="agency-form__input"
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <label htmlFor="agency-size" className="agency-form__label">
                      Client sites managed
                    </label>
                    <select
                      id="agency-size"
                      value={form.teamSize}
                      onChange={handleChange("teamSize")}
                      className="agency-form__select"
                    >
                      {TEAM_SIZES.map(function (s) {
                        return (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="agency-message"
                    className="agency-form__label"
                  >
                    Anything else?
                  </label>
                  <textarea
                    id="agency-message"
                    value={form.message}
                    onChange={handleChange("message")}
                    placeholder="Tell us about your workflow, client needs, or questions..."
                    rows={3}
                    className="agency-form__textarea"
                  />
                </div>

                {error && (
                  <div className="contact-form__error" role="alert">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sending || !form.email.trim() || !form.name.trim()}
                  className="agency-form__submit"
                >
                  {sending ? (
                    <Loader2 size={16} className="xsbl-spin" />
                  ) : (
                    <Send size={15} />
                  )}
                  {sending ? "Sending..." : "Request a demo"}
                </button>

                <p className="agency-form__hint">
                  Or start immediately —{" "}
                  <Link to="/signup" style={{ color: t.accent }}>
                    sign up
                  </Link>{" "}
                  and upgrade to Agency during onboarding or in Billing.
                </p>
              </form>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
