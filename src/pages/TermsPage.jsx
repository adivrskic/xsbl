import { useTheme } from "../context/ThemeContext";
import { FileText } from "lucide-react";
import FadeIn from "../components/landing/FadeIn";
import "../styles/legal.css";

export default function TermsPage() {
  var { t } = useTheme();

  return (
    <div className="legal-page">
      <FadeIn>
        <div className="legal-page__eyebrow">
          <span className="legal-page__eyebrow-line" />
          Terms of service
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <h1 className="legal-page__title">Terms of Service</h1>
      </FadeIn>

      <FadeIn delay={0.1}>
        <p className="legal-page__updated">Last updated: March 1, 2026</p>
      </FadeIn>

      <FadeIn delay={0.12}>
        <div className="legal-page__body">
          <div className="legal-page__callout">
            <p>
              <strong>The short version:</strong> xsbl is a tool that helps you
              find and fix accessibility issues. We do our best to give accurate
              results, but we're not lawyers — passing an xsbl scan doesn't
              guarantee legal compliance. You're responsible for your own
              website.
            </p>
          </div>

          <h2>1. Acceptance of terms</h2>
          <p>
            By creating an account or using xsbl ("the Service"), you agree to
            these Terms of Service ("Terms"). If you are using xsbl on behalf of
            an organization, you represent that you have authority to bind that
            organization to these Terms. If you do not agree, do not use the
            Service.
          </p>

          <h2>2. Description of service</h2>
          <p>
            xsbl provides automated web accessibility scanning against WCAG 2.2
            guidelines, AI-generated fix suggestions, GitHub integration for
            pull requests and issue creation, compliance reporting, and related
            tools. The Service scans the publicly rendered version of websites
            you specify.
          </p>

          <h2>3. Accounts</h2>
          <p>
            You must provide accurate information when creating an account. You
            are responsible for maintaining the security of your account
            credentials and for all activity under your account. Notify us
            immediately at{" "}
            <a href="mailto:security@xsbl.io">security@xsbl.io</a> if you
            suspect unauthorized access.
          </p>
          <p>
            Accounts are for individual or organizational use only. You may not
            share account credentials or resell access to the Service unless you
            are on an Agency plan using the client dashboard feature as
            intended.
          </p>

          <h2>4. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>
              Scan websites you do not own or have explicit permission to scan
            </li>
            <li>
              Use the Service to attack, overload, or interfere with other
              websites
            </li>
            <li>
              Reverse-engineer, decompile, or attempt to extract the source code
              of the Service
            </li>
            <li>Circumvent usage limits, rate limits, or access controls</li>
            <li>Use the Service for any illegal purpose</li>
            <li>
              Resell, sublicense, or redistribute the Service without written
              permission
            </li>
            <li>
              Automate access to the Service beyond what the API explicitly
              supports
            </li>
          </ul>
          <p>
            We reserve the right to suspend or terminate accounts that violate
            these terms or that we reasonably believe are being used abusively.
          </p>

          <h2>5. Subscriptions and billing</h2>
          <p>
            xsbl offers free and paid plans. Paid plans are billed monthly and
            renew automatically. You can cancel at any time from your billing
            page — you'll retain access through the end of your current billing
            period.
          </p>
          <p>
            Prices are in US dollars. We may change pricing with 30 days'
            notice. Price changes do not apply to the current billing period.
            All fees are non-refundable unless required by law or at our
            discretion.
          </p>
          <p>
            If your payment fails, we will attempt to charge your payment method
            for up to 14 days. If payment remains unsuccessful, your account
            will be downgraded to the free plan.
          </p>

          <h2>6. Usage limits</h2>
          <p>
            Each plan includes specific limits on scans, sites, AI suggestions,
            and GitHub PRs per month. Usage resets at the start of each billing
            cycle. If you exceed your limits, some features may be restricted
            until the next cycle or until you upgrade.
          </p>

          <h2>7. Intellectual property</h2>
          <p>
            The xsbl Service, including its design, code, documentation, and
            branding, is owned by xsbl and protected by intellectual property
            laws. These Terms do not grant you any rights to our intellectual
            property except the limited right to use the Service as intended.
          </p>
          <p>
            You retain ownership of your websites, source code, and content. You
            grant xsbl a limited license to access and scan your websites and
            (when you connect GitHub) to read relevant source files for the
            purpose of generating fixes — this license ends when you disconnect
            or delete your account.
          </p>

          <h2>8. Disclaimer of warranties</h2>
          <p>
            <strong>
              The Service is provided "as is" and "as available" without
              warranties of any kind, express or implied.
            </strong>
          </p>
          <p>
            We strive for accurate scan results, but automated scanning has
            inherent limitations. xsbl typically detects 30–50% of WCAG issues —
            manual testing is still necessary for full compliance. Scan results,
            AI fix suggestions, and compliance reports are informational tools,
            not legal advice.
          </p>
          <p>
            We do not guarantee that using xsbl will make your website fully
            accessible or compliant with any specific law or regulation (ADA,
            EAA, Section 508, etc.). You are responsible for your own compliance
            decisions.
          </p>

          <h2>9. Limitation of liability</h2>
          <p>
            To the maximum extent permitted by law, xsbl shall not be liable for
            any indirect, incidental, special, consequential, or punitive
            damages, or any loss of profits, data, or business opportunities,
            whether arising from contract, tort, or otherwise, even if we have
            been advised of the possibility of such damages.
          </p>
          <p>
            Our total aggregate liability for all claims related to the Service
            shall not exceed the amount you paid us in the 12 months preceding
            the claim.
          </p>

          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold xsbl harmless from any claims,
            damages, losses, and expenses (including reasonable attorney fees)
            arising from your use of the Service, your violation of these Terms,
            or your violation of any third-party rights.
          </p>

          <h2>11. Service availability</h2>
          <p>
            We aim for high availability but do not guarantee uninterrupted
            access. We may temporarily suspend the Service for maintenance,
            updates, or circumstances beyond our control. We will provide
            reasonable notice of planned downtime when possible.
          </p>

          <h2>12. Termination</h2>
          <p>
            You may close your account at any time from your dashboard settings.
            We may terminate or suspend your account if you violate these Terms
            or if required by law. Upon termination, your right to use the
            Service ends immediately. We will delete your data in accordance
            with our <a href="/privacy">Privacy Policy</a>.
          </p>

          <h2>13. Changes to these terms</h2>
          <p>
            We may modify these Terms from time to time. We will provide notice
            of material changes via email or a prominent notice on the Service.
            Continued use after changes take effect constitutes acceptance. If
            you disagree with changes, your remedy is to close your account.
          </p>

          <h2>14. Governing law</h2>
          <p>
            These Terms are governed by the laws of the State of Delaware,
            United States, without regard to conflict of law principles. Any
            disputes shall be resolved in the state or federal courts located in
            Delaware.
          </p>

          <h2>15. General</h2>
          <p>
            These Terms constitute the entire agreement between you and xsbl
            regarding the Service. If any provision is found unenforceable, the
            remaining provisions continue in effect. Our failure to enforce a
            right does not waive that right. You may not assign these Terms; we
            may assign them in connection with a merger or acquisition.
          </p>

          <h2>16. Contact</h2>
          <p>
            Questions about these terms? Reach us at{" "}
            <a href="mailto:legal@xsbl.io">legal@xsbl.io</a> or through our{" "}
            <a href="/contact">contact page</a>.
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
