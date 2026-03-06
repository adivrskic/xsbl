import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";

// Providers
import { ToastProvider } from "./components/ui/Toast";
import { ConfirmProvider } from "./components/ui/ConfirmModal";

// Auth
import AuthGuard from "./components/auth/AuthGuard";
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
import PricingSection from "./components/landing/PricingSection";
import CtaSection from "./components/landing/CtaSection";
import Footer from "./components/landing/Footer";

// Pages
import DocsPage from "./pages/DocsPage";
import BlogPage from "./pages/blog/BlogPage";
import BlogArticlePage from "./pages/blog/BlogArticlePage";
import ContactPage from "./pages/ContactPage";

// Dashboard
import DashboardLayout from "./pages/dashboard/DashboardLayout";
import OverviewPage from "./pages/dashboard/OverviewPage";
import SitesPage from "./pages/dashboard/SitesPage";
import SiteDetailPage from "./pages/dashboard/SiteDetailPage";
import SettingsPage from "./pages/dashboard/SettingsPage";
import BillingPage from "./pages/dashboard/BillingPage";
import OnboardingPage from "./pages/dashboard/OnboardingPage";

function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      var id = location.hash.replace("#", "");
      // Small delay to let sections render
      setTimeout(function () {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [location]);

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
  "/dashboard": "Dashboard — xsbl",
  "/dashboard/sites": "Sites — xsbl",
  "/dashboard/settings": "Settings — xsbl",
  "/dashboard/billing": "Billing — xsbl",
  "/dashboard/onboarding": "Get started — xsbl",
};

function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;
    document.title =
      PAGE_TITLES[path] ||
      (path.startsWith("/dashboard/sites/")
        ? "Site details — xsbl"
        : path.startsWith("/blog/")
        ? "Blog — xsbl"
        : "xsbl — make your web accessible");
  }, [location.pathname]);
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
        <PageTitle />
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
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
                <Route path="settings" element={<SettingsPage />} />
                <Route path="billing" element={<BillingPage />} />
              </Route>
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </BrowserRouter>
    </div>
  );
}
