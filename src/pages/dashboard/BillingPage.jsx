import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  CreditCard,
  ExternalLink,
  Check,
  Sparkles,
  Zap,
  Building2,
  ArrowUpRight,
} from "lucide-react";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import "../../styles/BillingPage.css";

const plans = [
  {
    name: "Free",
    key: "free",
    price: 0,
    features: ["1 site", "3 scans / month", "Basic issue list", "WCAG 2.2 AA"],
    icon: Zap,
  },
  {
    name: "Starter",
    key: "starter",
    price: 19,
    features: [
      "1 site",
      "10 scans / month",
      "AI fix suggestions",
      "Score badge",
      "Email support",
    ],
    icon: Sparkles,
  },
  {
    name: "Pro",
    key: "pro",
    price: 69,
    popular: true,
    features: [
      "Unlimited sites",
      "100 scans / month",
      "Scheduled scans",
      "AI fixes + alt text",
      "Score trends",
      "Slack + email alerts",
      "PDF reports",
      "WCAG 2.2 AA + AAA",
    ],
    icon: Zap,
  },
  {
    name: "Agency",
    key: "agency",
    price: 249,
    features: [
      "Everything in Pro",
      "Multi-org dashboard",
      "White-label reports",
      "VPAT generation",
      "Audit log",
      "API access",
      "Dedicated support",
    ],
    icon: Building2,
  },
];

export default function BillingPage() {
  const { t } = useTheme();
  const { org, refreshOrg } = useAuth();
  const [searchParams] = useSearchParams();
  const [usage, setUsage] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Check for Stripe redirect
  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setMessage({
        type: "success",
        text: "Subscription activated! It may take a moment to update.",
      });
      refreshOrg?.();
    } else if (searchParams.get("canceled") === "true") {
      setMessage({ type: "info", text: "Checkout was canceled." });
    }
  }, [searchParams, refreshOrg]);

  // Fetch usage — use cached from AuthContext
  const cachedUsage = useAuth().usage;
  const { fetchUsage } = useAuth();
  useEffect(() => {
    if (!org) return;
    if (cachedUsage) {
      setUsage(cachedUsage);
      return;
    }
    fetchUsage(true).then(function (data) {
      if (data) setUsage(data);
    });
  }, [org?.id, cachedUsage]);

  const handleUpgrade = async (planKey) => {
    if (planKey === "free") return;
    setLoadingPlan(planKey);
    try {
      const {
        data: { session: s },
      } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: { plan: planKey },
          headers: { Authorization: `Bearer ${s?.access_token}` },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setLoadingPlan(null);
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const {
        data: { session: ps },
      } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke(
        "customer-portal",
        {
          headers: { Authorization: `Bearer ${ps?.access_token}` },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setPortalLoading(false);
  };

  const currentPlan = org?.plan || "free";

  return (
    <div>
      <h1 className="dash-page-title">Billing</h1>
      <p className="dash-page-subtitle" style={{ marginBottom: "2rem" }}>
        Manage your subscription and usage.
      </p>

      {message && (
        <div className={"billing-message billing-message--" + message.type}>
          {message.type === "success" && <Check size={15} />}
          {message.text}
        </div>
      )}

      <div className="billing-summary">
        <div className="billing-plan-card">
          <div className="billing-plan-card__label">Current plan</div>
          <div className="billing-plan-card__name">{currentPlan}</div>
          {currentPlan !== "free" && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              className="billing-portal-btn"
            >
              <CreditCard size={13} /> Manage subscription{" "}
              <ExternalLink size={11} />
            </button>
          )}
        </div>

        {usage && (
          <div className="billing-usage-card">
            <div
              className="dash-card__label"
              style={{ marginBottom: "0.5rem" }}
            >
              This month
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}
            >
              <div>
                <div className="billing-usage__row">
                  <span>Scans</span>
                  <span className="billing-usage__count">
                    {usage.scans_used} /{" "}
                    {usage.scans_limit === 999 ? "∞" : usage.scans_limit}
                  </span>
                </div>
                <div className="billing-usage__bar">
                  <div
                    className="billing-usage__fill"
                    style={{
                      width: `${Math.min(
                        100,
                        (usage.scans_used / usage.scans_limit) * 100
                      )}%`,
                      background:
                        usage.scans_used >= usage.scans_limit
                          ? "var(--red)"
                          : "var(--accent)",
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="billing-usage__row">
                  <span>Sites</span>
                  <span className="billing-usage__count">
                    {usage.sites_used} /{" "}
                    {usage.sites_limit === 999 ? "∞" : usage.sites_limit}
                  </span>
                </div>
                <div className="billing-usage__bar">
                  <div
                    className="billing-usage__fill"
                    style={{
                      width: `${Math.min(
                        100,
                        (usage.sites_used / usage.sites_limit) * 100
                      )}%`,
                      background:
                        usage.sites_used >= usage.sites_limit
                          ? "var(--red)"
                          : "var(--accent)",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <h2 className="dash-section-title">Plans</h2>
      <div className="billing-plans-grid">
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          const isDowngrade =
            plans.findIndex((x) => x.key === currentPlan) >
            plans.findIndex((x) => x.key === p.key);
          const Icon = p.icon;

          return (
            <div
              key={p.key}
              className={
                "billing-plan" + (isCurrent ? " billing-plan--current" : "")
              }
            >
              {p.popular && (
                <span className="billing-plan__popular">Popular</span>
              )}

              <div className="billing-plan__header">
                <Icon size={15} color="var(--accent)" strokeWidth={1.8} />
                <div className="billing-plan__tier">{p.name}</div>
              </div>

              <div className="billing-plan__price">
                ${p.price}
                <span className="billing-plan__period">/mo</span>
              </div>

              <div className="billing-plan__features">
                {p.features.map((f, i) => (
                  <div key={i} className="billing-plan__feature">
                    <Check size={12} color="var(--green)" strokeWidth={2.5} />{" "}
                    {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (isCurrent) return;
                  if (isDowngrade) handlePortal();
                  else if (p.key !== "free") handleUpgrade(p.key);
                }}
                disabled={
                  isCurrent ||
                  (p.key === "free" && currentPlan === "free") ||
                  loadingPlan === p.key ||
                  (isDowngrade && portalLoading)
                }
                className="billing-plan__cta"
              >
                {isCurrent ? (
                  "Current plan"
                ) : isDowngrade ? (
                  portalLoading ? (
                    "Redirecting…"
                  ) : (
                    <>
                      <ExternalLink size={12} /> Downgrade via portal
                    </>
                  )
                ) : p.key === "free" ? (
                  "Free"
                ) : loadingPlan === p.key ? (
                  "Redirecting…"
                ) : (
                  <>
                    <ArrowUpRight size={14} /> Upgrade
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
