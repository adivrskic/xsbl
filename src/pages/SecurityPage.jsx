import { useTheme } from "../context/ThemeContext";
import { Shield, Lock, Server, Eye, Key, RefreshCw } from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

function SecurityCard({ icon, title, children, t }) {
  return (
    <div
      style={{
        padding: "1.2rem 1.3rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "0.8rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.6rem",
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 7,
            background: t.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <h3
          style={{
            fontFamily: "var(--body)",
            fontSize: "0.95rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          fontSize: "0.88rem",
          color: t.ink50,
          lineHeight: 1.75,
        }}
      >
        {children}
      </div>
    </div>
  );
}

export default function SecurityPage() {
  var { t } = useTheme();

  return (
    <div className="legal-page">
      <FadeIn>
        <div className="legal-page__eyebrow">
          <span className="legal-page__eyebrow-line" />
          Security
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="legal-page__title">Security at xsbl</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="legal-page__updated">Last updated: March 1, 2026</p>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div className="legal-page__body">
          <div className="legal-page__callout">
            <p>
              <strong>Our approach:</strong> We minimize what we collect,
              encrypt everything in transit and at rest, and never store data we
              don't need. If you find a security issue, we want to hear about
              it.
            </p>
          </div>

          <h2>How we protect your data</h2>
        </div>
      </FadeIn>

      <FadeIn delay={0.15}>
        <SecurityCard
          icon={<Lock size={16} color={t.accent} strokeWidth={2} />}
          title="Encryption"
          t={t}
        >
          <p style={{ margin: "0 0 0.5rem" }}>
            All data is encrypted in transit using TLS 1.2 or higher. Data at
            rest is encrypted using AES-256 via the database provider's managed
            encryption. API tokens and GitHub access tokens are encrypted before
            storage and never logged in plaintext.
          </p>
        </SecurityCard>
      </FadeIn>

      <FadeIn delay={0.18}>
        <SecurityCard
          icon={<Server size={16} color={t.accent} strokeWidth={2} />}
          title="Infrastructure"
          t={t}
        >
          <p style={{ margin: "0 0 0.5rem" }}>
            xsbl runs on Supabase (managed PostgreSQL on AWS) and Netlify's edge
            network. Both providers maintain SOC 2 Type II compliance. Our edge
            functions run in isolated Deno environments with no shared state
            between tenants. Headless browser instances used for scanning are
            ephemeral — they're created for each scan and destroyed immediately
            after.
          </p>
        </SecurityCard>
      </FadeIn>

      <FadeIn delay={0.21}>
        <SecurityCard
          icon={<Key size={16} color={t.accent} strokeWidth={2} />}
          title="Authentication & access"
          t={t}
        >
          <p style={{ margin: "0 0 0.5rem" }}>
            User authentication is handled by Supabase Auth with bcrypt-hashed
            passwords, JWT session tokens, and optional OAuth via GitHub and
            Google. Admin access to production infrastructure requires
            multi-factor authentication. Database access is restricted by
            row-level security policies — users can only access data belonging
            to their organization.
          </p>
        </SecurityCard>
      </FadeIn>

      <FadeIn delay={0.24}>
        <SecurityCard
          icon={<Eye size={16} color={t.accent} strokeWidth={2} />}
          title="What we scan — and what we don't"
          t={t}
        >
          <p style={{ margin: "0 0 0.5rem" }}>
            xsbl scans the publicly rendered HTML of your web pages — the same
            content any visitor's browser would see. We do not install agents,
            inject scripts, or modify your website in any way. When you connect
            GitHub, we read source files only at the moment of generating a fix
            and do not persist repository contents. We do not scan pages behind
            authentication or access private resources.
          </p>
        </SecurityCard>
      </FadeIn>

      <FadeIn delay={0.27}>
        <SecurityCard
          icon={<RefreshCw size={16} color={t.accent} strokeWidth={2} />}
          title="Data retention & deletion"
          t={t}
        >
          <p style={{ margin: "0 0 0.5rem" }}>
            Scan results are retained for the life of your account. When you
            delete a site, all associated scans, issues, and reports are queued
            for deletion within 30 days. When you close your account, all data
            is purged within 30 days except billing records required by law.
            GitHub tokens are revoked and deleted immediately upon
            disconnection.
          </p>
        </SecurityCard>
      </FadeIn>

      <FadeIn delay={0.3}>
        <div className="legal-page__body">
          <h2>Responsible disclosure</h2>
          <p>
            If you discover a security vulnerability in xsbl, please report it
            responsibly. We take all reports seriously and will respond within
            48 hours.
          </p>

          <p>
            <strong>Email:</strong>{" "}
            <a href="mailto:security@xsbl.io">security@xsbl.io</a>
          </p>

          <p>When reporting, please include:</p>
          <ul>
            <li>A description of the vulnerability and its potential impact</li>
            <li>Steps to reproduce or a proof of concept</li>
            <li>Your contact information for follow-up</li>
          </ul>

          <p>
            We ask that you do not publicly disclose the vulnerability until
            we've had reasonable time to address it (typically 90 days). We do
            not pursue legal action against researchers who report in good faith
            and comply with this policy.
          </p>

          <h2>Security headers</h2>
          <p>
            All xsbl pages are served with security headers including{" "}
            <code>X-Frame-Options: DENY</code>,{" "}
            <code>X-Content-Type-Options: nosniff</code>, and{" "}
            <code>Referrer-Policy: strict-origin-when-cross-origin</code>. These
            prevent clickjacking, MIME-type confusion, and limit referrer
            information leakage.
          </p>

          <h2>Incident response</h2>
          <p>
            In the event of a data breach or security incident, we will notify
            affected users within 72 hours via email with details of the
            incident, what data was affected, steps we're taking, and
            recommendations for protecting yourself. We maintain internal
            incident response procedures and conduct post-incident reviews for
            all security events.
          </p>

          <h2>Compliance</h2>
          <p>
            Our infrastructure providers (Supabase and Netlify) maintain SOC 2
            Type II compliance. xsbl generates compliance evidence for our
            customers (audit logs, scan history, VPAT documents) — the same
            tools we use internally to maintain our own security posture.
          </p>

          <h2>Questions</h2>
          <p>
            Security questions or concerns? Contact us at{" "}
            <a href="mailto:security@xsbl.io">security@xsbl.io</a> or through
            our <a href="/contact">contact page</a>.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
