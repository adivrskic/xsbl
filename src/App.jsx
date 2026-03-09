import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";

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
import ErrorBoundary from "./components/ui/ErrorBoundary";

function LandingPage() {
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
        <PricingSection />
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

const PAGE_TITLES = {
  "/": "xsbl — make your web accessible",
  "/login": "Sign in — xsbl",
  "/signup": "Sign up — xsbl",
  "/reset-password": "Reset password — xsbl",
  "/docs": "Documentation — xsbl",
  "/blog": "Blog — xsbl",
  "/contact": "Contact — xsbl",
  "/agency": "Agency plan — xsbl",
  "/dashboard": "Dashboard — xsbl",
  "/dashboard/sites": "Sites — xsbl",
  "/dashboard/settings": "Settings — xsbl",
  "/dashboard/billing": "Billing — xsbl",
  "/dashboard/onboarding": "Get started — xsbl",
  "/dashboard/tester": "Element tester — xsbl",
  "/dashboard/audit-log": "Audit log — xsbl",
  "/dashboard/evidence": "Evidence export — xsbl",
};

function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    var path = location.pathname;
    if (PAGE_TITLES[path]) {
      document.title = PAGE_TITLES[path];
    } else if (path.startsWith("/dashboard/sites/")) {
      document.title = "Site details — xsbl";
    } else if (path.startsWith("/blog/")) {
      // Try to extract slug and find article title
      var slug = path.replace("/blog/", "");
      try {
        var el = document.querySelector(".blog-article__title");
        if (el && el.textContent) {
          document.title = el.textContent + " — xsbl";
        } else {
          document.title = "Blog — xsbl";
        }
      } catch (e) {
        document.title = "Blog — xsbl";
      }
    } else if (path.startsWith("/status/")) {
      document.title = "Accessibility status — xsbl";
    } else if (path.startsWith("/client-dashboard/")) {
      document.title = "Client dashboard — xsbl";
    } else {
      document.title = "xsbl — make your web accessible";
    }
  }, [location.pathname]);
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
          <PageTitle />
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
