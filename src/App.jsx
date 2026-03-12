import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";

// Providers
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/ConfirmModal";

// Auth
import AuthGuard from "./components/auth/AuthGuard";
import AuthCallback from "./components/auth/AuthCallback";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";

// Landing page
import Nav from "./components/landing/Nav";
import Hero from "./components/landing/Hero";
import Marquee from "./components/landing/Marquee";
import VsSection from "./components/landing/VsSection";
import HowSection from "./components/landing/HowSection";
import AgentSection from "./components/landing/AgentSection";
import ComplianceSection from "./components/landing/ComplianceSection";
import GitHubSection from "./components/landing/GitHubSection";
import SimulatorSection from "./components/landing/SimulatorSection";
import PricingSection from "./components/landing/PricingSection";
import FaqSection from "./components/landing/FaqSection";
import CtaSection from "./components/landing/CtaSection";
import Footer from "./components/landing/Footer";

// Pages
import DocsPage from "./pages/DocsPage";
import BlogPage from "./pages/blog/BlogPage";
import BlogArticlePage from "./pages/blog/BlogArticlePage";
import ContactPage from "./pages/ContactPage";
import AgencyPage from "./pages/AgencyPage";
import StatusPage from "./pages/StatusPage";
import ClientDashboardPage from "./pages/ClientDashboardPage";

// Legal
import PrivacyPage from "./pages/PrivacyPage";
import TermsPage from "./pages/TermsPage";
import SecurityPage from "./pages/SecurityPage";

// Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import SitesPage from "./pages/dashboard/SitesPage";
import SiteDetailPage from "./pages/dashboard/SiteDetailPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BillingPage from "./pages/dashboard/BillingPage";
import AuditLogPage from "./pages/dashboard/AuditLogPage";
import EvidenceExportPage from "./pages/dashboard/EvidenceExportPage";
import ElementTester from "./pages/dashboard/ElementTester";
import OnboardingPage from "./pages/dashboard/OnboardingPage";
import NotFoundPage from "./pages/NotFoundPage";
import ErrorBoundary, {
  GlobalErrorHandler,
} from "./components/ui/ErrorBoundary";
import useDocumentMeta, { PAGE_META } from "./hooks/useDocumentMeta";
import { blogArticles } from "./data/blogArticles";

function LandingPage() {
  const { org } = useAuth();
  const showPricing = !org || org.plan === "free";
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Nav />
      <main id="main-content">
        <Hero />
        <Marquee />
        <VsSection />
        <HowSection />
        <AgentSection />
        <GitHubSection />
        <SimulatorSection />
        <ComplianceSection />
        {showPricing && <PricingSection />}
        <FaqSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

function PublicLayout({ children }) {
  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Nav />
      <main id="main-content" style={{ minHeight: "calc(100vh - 64px)" }}>
        {children}
      </main>
      <Footer />
    </>
  );
}

function PageMeta() {
  var location = useLocation();
  var path = location.pathname;

  // Look up known routes first
  var meta = PAGE_META[path];

  // Dynamic routes
  if (!meta) {
    if (path.startsWith("/dashboard/sites/")) {
      meta = {
        title: "Site details — xsbl",
        description:
          "View accessibility scan results, issues, score history, and fix suggestions for your site.",
      };
    } else if (path.startsWith("/blog/")) {
      var slug = path.replace("/blog/", "");
      var article = blogArticles.find(function (a) {
        return a.slug === slug;
      });
      if (article) {
        meta = {
          title: article.title + " — xsbl",
          description: article.subtitle || "Read on the xsbl blog.",
        };
      } else {
        meta = {
          title: "Blog — xsbl",
          description:
            "Articles on web accessibility, WCAG compliance, and inclusive design.",
        };
      }
    } else if (path.startsWith("/status/")) {
      meta = {
        title: "Accessibility status — xsbl",
        description:
          "Public accessibility status page showing WCAG compliance score and issue breakdown.",
      };
    } else if (path.startsWith("/client-dashboard/")) {
      meta = {
        title: "Client dashboard — xsbl",
        description:
          "View your site's accessibility scan results and compliance status.",
      };
    } else {
      meta = {
        title: "xsbl — make your web accessible",
        description:
          "AI-powered web accessibility scanner and WCAG 2.2 compliance tool.",
      };
    }
  }

  useDocumentMeta({
    title: meta.title,
    description: meta.description,
    path: path,
    image: meta.image,
  });

  return null;
}

/* Scroll to #hash after navigation (e.g. /blog → /#pricing) */
function ScrollToHash() {
  const location = useLocation();

  // Scroll to top on route change (unless hash is present)
  useEffect(
    function () {
      if (!location.hash) {
        window.scrollTo(0, 0);
      }
    },
    [location.pathname]
  );

  // Handle hash scrolling
  useEffect(
    function () {
      if (!location.hash) return;
      var id = location.hash.replace("#", "");
      var attempts = 0;
      var maxAttempts = 20;

      /* Retry until the element exists (landing page may still be mounting) */
      var interval = setInterval(function () {
        var el = document.getElementById(id);
        attempts++;
        if (el) {
          clearInterval(interval);
          el.scrollIntoView({ behavior: "smooth" });
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
        }
      }, 100);

      return function () {
        clearInterval(interval);
      };
    },
    [location.pathname, location.hash]
  );
  return null;
}

export default function App() {
  const { t } = useTheme();

  return (
    <div
      style={{
        background: t.paper,
        color: t.ink,
        minHeight: "100vh",
        transition: "background 0.4s, color 0.4s",
      }}
    >
      <BrowserRouter>
        <ErrorBoundary>
          <GlobalErrorHandler />
          <PageMeta />
          <ScrollToHash />
          <ToastProvider>
            <ConfirmProvider>
              <Routes>
                {/* Public */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/auth/callback" element={<AuthCallback />} />
                <Route
                  path="/docs"
                  element={
                    <PublicLayout>
                      <DocsPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/blog"
                  element={
                    <PublicLayout>
                      <BlogPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/blog/:slug"
                  element={
                    <PublicLayout>
                      <BlogArticlePage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/contact"
                  element={
                    <PublicLayout>
                      <ContactPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/agency"
                  element={
                    <PublicLayout>
                      <AgencyPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/privacy"
                  element={
                    <PublicLayout>
                      <PrivacyPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/terms"
                  element={
                    <PublicLayout>
                      <TermsPage />
                    </PublicLayout>
                  }
                />
                <Route
                  path="/security"
                  element={
                    <PublicLayout>
                      <SecurityPage />
                    </PublicLayout>
                  }
                />

                <Route path="/status/:slug" element={<StatusPage />} />
                <Route
                  path="/client-dashboard/:token"
                  element={<ClientDashboardPage />}
                />

                {/* Onboarding */}
                <Route
                  path="/dashboard/onboarding"
                  element={
                    <AuthGuard>
                      <OnboardingPage />
                    </AuthGuard>
                  }
                />

                {/* Dashboard */}
                <Route
                  path="/dashboard"
                  element={
                    <AuthGuard>
                      <DashboardLayout />
                    </AuthGuard>
                  }
                >
                  <Route index element={<OverviewPage />} />
                  <Route path="sites" element={<SitesPage />} />
                  <Route path="sites/:id" element={<SiteDetailPage />} />
                  <Route path="tester" element={<ElementTester />} />
                  <Route path="audit-log" element={<AuditLogPage />} />
                  <Route path="evidence" element={<EvidenceExportPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="billing" element={<BillingPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ConfirmProvider>
          </ToastProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </div>
  );
}
