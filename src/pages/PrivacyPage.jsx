import { useTheme } from "../context/ThemeContext";
import { Shield } from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

export default function PrivacyPage() {
  var { t } = useTheme();

  return (
    <div className="legal-page">
      <FadeIn>
        <div className="legal-page__eyebrow">
          <span className="legal-page__eyebrow-line" />
          Privacy policy
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="legal-page__title">Privacy Policy</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="legal-page__updated">Last updated: March 1, 2026</p>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div className="legal-page__body">
          <div className="legal-page__callout">
            <p>
              <strong>The short version:</strong> xsbl scans the public-facing
              HTML of your website. We don't inject scripts, install cookies on
              your visitors, or store your source code. We collect what we need
              to run the service and nothing more.
            </p>
          </div>

          <h2>1. Who we are</h2>
          <p>
            xsbl ("we", "us", "our") provides a web accessibility scanning and
            compliance platform at xsbl.io. This policy explains how we collect,
            use, and protect information when you use our website and services.
          </p>

          <h2>2. Information we collect</h2>

          <h3>Account information</h3>
          <p>
            When you create an account, we collect your email address, name (if
            provided), and authentication credentials. If you sign in via GitHub
            or Google, we receive your public profile information and email from
            those providers.
          </p>

          <h3>Scan data</h3>
          <p>
            When you scan a website, we fetch the publicly rendered HTML of the
            pages you specify — the same content any browser visitor would see.
            We analyze this HTML for WCAG 2.2 accessibility violations and store
            the scan results (issue descriptions, element selectors, fix
            suggestions, scores). We do not store full page HTML after the scan
            completes.
          </p>

          <h3>GitHub integration data</h3>
          <p>
            If you connect a GitHub repository, we store an access token scoped
            to the repositories you authorize and the repo identifier. When
            creating pull requests or issues, we read relevant source files at
            that moment only — we do not clone, cache, or persist your
            repository contents.
          </p>

          <h3>Usage data</h3>
          <p>
            We collect standard usage information: pages visited within our
            dashboard, features used, scan frequency, browser type, and
            approximate location derived from IP address. We use this to improve
            the product and diagnose issues.
          </p>

          <h3>Payment information</h3>
          <p>
            Payments are processed by Stripe. We do not store credit card
            numbers, CVVs, or bank account details. Stripe provides us with a
            customer identifier, plan status, and billing email.
          </p>

          <h2>3. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve the xsbl service</li>
            <li>Run accessibility scans and generate fix suggestions</li>
            <li>Create pull requests and GitHub issues on your behalf</li>
            <li>
              Send scan completion notifications and alerts you've opted into
            </li>
            <li>Process payments and manage subscriptions</li>
            <li>Diagnose bugs and monitor service reliability</li>
            <li>Respond to support requests</li>
          </ul>

          <h2>4. What we don't do</h2>
          <ul>
            <li>We do not sell or rent your personal information to anyone</li>
            <li>We do not serve advertisements</li>
            <li>We do not inject scripts or overlays onto your website</li>
            <li>We do not track your website's visitors</li>
            <li>
              We do not store your source code beyond what's needed to generate
              a specific fix
            </li>
            <li>We do not use your data to train AI models</li>
          </ul>

          <h2>5. Data storage and security</h2>
          <p>
            Your data is stored in Supabase-managed PostgreSQL databases hosted
            on AWS infrastructure in the United States. All data is encrypted at
            rest and in transit (TLS 1.2+). Access to production databases is
            restricted to essential personnel and protected by multi-factor
            authentication. See our <a href="/security">Security page</a> for
            more detail.
          </p>

          <h2>6. Data retention</h2>
          <p>
            Scan results and issues are retained for the lifetime of your
            account. When you delete a site, we remove its scan history, issues,
            and associated data within 30 days. When you delete your account, we
            remove all your data within 30 days, except where required by law
            (e.g., billing records).
          </p>

          <h2>7. Third-party services</h2>
          <p>We use the following third-party services:</p>
          <ul>
            <li>
              <strong>Supabase</strong> — database, authentication, and edge
              functions
            </li>
            <li>
              <strong>Netlify</strong> — web hosting and CDN
            </li>
            <li>
              <strong>Stripe</strong> — payment processing
            </li>
            <li>
              <strong>GitHub API</strong> — pull request and issue creation
              (only when you connect your repo)
            </li>
            <li>
              <strong>Browserless</strong> — headless browser for rendering
              pages during scans
            </li>
            <li>
              <strong>Anthropic (Claude)</strong> — AI-powered fix suggestions
              and alt text generation
            </li>
          </ul>
          <p>
            Each of these services processes data according to their own privacy
            policies. We select partners that maintain SOC 2 compliance or
            equivalent security standards.
          </p>

          <h2>8. Cookies</h2>
          <p>
            We use essential cookies only: a session token for authentication
            and a theme preference (light/dark). We do not use analytics
            cookies, advertising cookies, or third-party tracking cookies.
          </p>

          <h2>9. Your rights</h2>
          <p>Depending on your jurisdiction, you may have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Correct inaccurate data</li>
            <li>Delete your data ("right to be forgotten")</li>
            <li>Export your data in a portable format</li>
            <li>Object to processing of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>
            To exercise any of these rights, email us at{" "}
            <a href="mailto:privacy@xsbl.io">privacy@xsbl.io</a> or use the
            account deletion option in your dashboard settings. We respond to
            all requests within 30 days.
          </p>

          <h2>10. International transfers</h2>
          <p>
            Our servers are located in the United States. If you are accessing
            xsbl from outside the US, your data will be transferred to and
            processed in the US. We rely on Standard Contractual Clauses and
            applicable legal frameworks for lawful international data transfers.
          </p>

          <h2>11. Children's privacy</h2>
          <p>
            xsbl is not directed at children under 16. We do not knowingly
            collect information from children. If we learn we have collected
            data from a child, we will delete it promptly.
          </p>

          <h2>12. Changes to this policy</h2>
          <p>
            We may update this policy from time to time. We will notify you of
            material changes by posting a notice on our website and, where
            possible, sending an email to your registered address. Your
            continued use of xsbl after changes take effect constitutes
            acceptance of the updated policy.
          </p>

          <h2>13. Contact</h2>
          <p>
            If you have questions about this privacy policy or how we handle
            your data, contact us at{" "}
            <a href="mailto:privacy@xsbl.io">privacy@xsbl.io</a> or through our{" "}
            <a href="/contact">contact page</a>.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
