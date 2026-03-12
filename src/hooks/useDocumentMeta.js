import { useEffect } from "react";

var BASE_URL = "https://xsbl.io";
var DEFAULT_TITLE =
  "xsbl — Web Accessibility Scanner, Automation & WCAG 2.2 Compliance Tool";
var DEFAULT_DESC =
  "xsbl scans your website for WCAG 2.2 AA & AAA accessibility violations and generates AI-powered fix suggestions. Continuous monitoring, GitHub PR integration, and compliance reports. Not an overlay — real fixes.";
var DEFAULT_IMAGE = BASE_URL + "/favicon-96x96.png";

/**
 * Sets or creates a <meta> tag in <head>.
 * Uses attribute selectors to find existing tags.
 */
function setMeta(attr, attrValue, content) {
  var selector = "meta[" + attr + '="' + attrValue + '"]';
  var el = document.querySelector(selector);
  if (el) {
    el.setAttribute("content", content);
  } else {
    el = document.createElement("meta");
    el.setAttribute(attr, attrValue);
    el.setAttribute("content", content);
    document.head.appendChild(el);
  }
}

function setCanonical(url) {
  var el = document.querySelector('link[rel="canonical"]');
  if (el) {
    el.setAttribute("href", url);
  } else {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    el.setAttribute("href", url);
    document.head.appendChild(el);
  }
}

/**
 * useDocumentMeta({ title, description, path, image })
 *
 * Updates document.title and all meta/OG/Twitter tags for the current route.
 * Pass partial options — anything omitted falls back to site defaults.
 *
 * Usage:
 *   useDocumentMeta({ title: "Blog — xsbl", description: "..." , path: "/blog" })
 */
export default function useDocumentMeta(options) {
  var title = options.title || DEFAULT_TITLE;
  var description = options.description || DEFAULT_DESC;
  var path = options.path || "/";
  var image = options.image || DEFAULT_IMAGE;
  var url = BASE_URL + path;

  useEffect(
    function () {
      // Document title
      document.title = title;

      // Standard meta
      setMeta("name", "title", title);
      setMeta("name", "description", description);

      // Canonical
      setCanonical(url);

      // Open Graph
      setMeta("property", "og:title", title);
      setMeta("property", "og:description", description);
      setMeta("property", "og:url", url);
      setMeta("property", "og:image", image);

      // Twitter Card
      setMeta("name", "twitter:title", title);
      setMeta("name", "twitter:description", description);
      setMeta("name", "twitter:url", url);
      setMeta("name", "twitter:image", image);
    },
    [title, description, url, image]
  );
}

/**
 * Pre-built meta configs for known routes.
 * Exported so PageMeta can look them up by pathname.
 */
export var PAGE_META = {
  "/": {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESC,
  },
  "/login": {
    title: "Sign in — xsbl",
    description:
      "Sign in to your xsbl dashboard. Monitor accessibility scores, manage sites, and track WCAG compliance.",
  },
  "/signup": {
    title: "Sign up — xsbl",
    description:
      "Create a free xsbl account. Scan your site for accessibility issues and get AI-generated code fixes in minutes.",
  },
  "/reset-password": {
    title: "Reset password — xsbl",
    description: "Reset your xsbl account password.",
  },
  "/docs": {
    title: "Documentation — xsbl",
    description:
      "Learn how to use xsbl — scanning, fix suggestions, GitHub PR integration, CI/CD setup, API reference, and more.",
  },
  "/blog": {
    title: "Blog — xsbl",
    description:
      "Articles on web accessibility, WCAG compliance, inclusive design, and building accessible products.",
  },
  "/contact": {
    title: "Contact — xsbl",
    description:
      "Get in touch with the xsbl team. Questions about pricing, enterprise plans, or accessibility consulting.",
  },
  "/agency": {
    title: "Agency plan — xsbl",
    description:
      "Manage accessibility for multiple clients. White-label reports, client dashboards, VPAT generation, and dedicated support.",
  },
  "/privacy": {
    title: "Privacy Policy — xsbl",
    description:
      "How xsbl collects, uses, and protects your data. No tracking cookies, no data selling, no source code storage.",
  },
  "/terms": {
    title: "Terms of Service — xsbl",
    description:
      "Terms and conditions for using the xsbl accessibility scanning platform.",
  },
  "/security": {
    title: "Security — xsbl",
    description:
      "How xsbl protects your data. Encryption, infrastructure, access controls, responsible disclosure, and incident response.",
  },
  "/wcag": {
    title: "WCAG 2.2 Success Criteria Reference — xsbl",
    description:
      "Complete guide to WCAG 2.2 success criteria. Learn what each criterion means, why it matters, common failures, and how to fix them.",
  },
  "/dashboard": {
    title: "Dashboard — xsbl",
    description:
      "Your accessibility overview. Monitor scores, scan sites, and track WCAG compliance.",
  },
  "/dashboard/sites": {
    title: "Sites — xsbl",
    description:
      "Manage your monitored sites. Add domains, run scans, and view accessibility scores.",
  },
  "/dashboard/settings": {
    title: "Settings — xsbl",
    description: "Manage your account, team, notifications, and integrations.",
  },
  "/dashboard/billing": {
    title: "Billing — xsbl",
    description: "Manage your subscription, payment method, and invoices.",
  },
  "/dashboard/onboarding": {
    title: "Get started — xsbl",
    description:
      "Set up your first site, run your first scan, and connect GitHub.",
  },
  "/dashboard/tester": {
    title: "Element tester — xsbl",
    description:
      "Test individual HTML elements for WCAG accessibility violations.",
  },
  "/dashboard/audit-log": {
    title: "Audit log — xsbl",
    description:
      "Timestamped history of scans, fixes, and changes for compliance evidence.",
  },
  "/dashboard/evidence": {
    title: "Evidence export — xsbl",
    description:
      "Export compliance evidence for SOC 2, ISO, and procurement audits.",
  },
};
