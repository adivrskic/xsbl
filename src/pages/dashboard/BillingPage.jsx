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

const plans = [
  {
    name: "Free",
    key: "free",
    price: 0,
    features: [
      "1 site",
      "3 scans / month",
      "10 AI suggestions / mo",
      "1 GitHub PR / mo",
      "WCAG 2.2 AA",
    ],
    icon: Zap,
  },
  {
    name: "Starter",
    key: "starter",
    price: 19,
    features: [
      "1 site",
      "10 scans / month",
      "50 AI suggestions / mo",
      "5 GitHub PRs / mo",
      "Score badge",
      "Simulator preview",
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
      "200 AI suggestions / mo",
      "25 GitHub PRs / mo",
      "Accessibility simulator",
      "Scheduled scans",
      "AI alt text",
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
      "Unlimited AI + PRs",
      "Accessibility simulator",
      "Client read-only dashboards",
      "Auto PDF reports to clients",
      "Custom scan profiles",
      "Multi-org dashboard",
      "White-label reports + VPAT",
      "Audit log + API access",
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
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.3rem",
        }}
      >
        Billing
      </h1>
      <p style={{ color: t.ink50, fontSize: "0.88rem", marginBottom: "2rem" }}>
        Manage your subscription and usage.
      </p>

      {/* Status message */}
      {message && (
        <div
          style={{
            padding: "0.8rem 1rem",
            borderRadius: 8,
            marginBottom: "1.5rem",
            background:
              message.type === "success"
                ? t.greenBg
                : message.type === "error"
                ? `${t.red}08`
                : t.accentBg,
            border: `1px solid ${
              message.type === "success"
                ? `${t.green}20`
                : message.type === "error"
                ? `${t.red}20`
                : `${t.accent}20`
            }`,
            color:
              message.type === "success"
                ? t.green
                : message.type === "error"
                ? t.red
                : t.accent,
            fontSize: "0.84rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {message.type === "success" && <Check size={15} />}
          {message.text}
        </div>
      )}

      {/* Current plan + usage */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.8rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            padding: "1.4rem",
            borderRadius: 12,
            border: `1px solid ${t.accent}25`,
            background: t.accentBg,
          }}
        >
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.accent,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 600,
              marginBottom: "0.3rem",
            }}
          >
            Current plan
          </div>
          <div
            style={{
              fontFamily: "var(--serif)",
              fontSize: "1.4rem",
              fontWeight: 700,
              color: t.ink,
              textTransform: "capitalize",
              marginBottom: "0.5rem",
            }}
          >
            {currentPlan}
          </div>
          {currentPlan !== "free" && (
            <button
              onClick={handlePortal}
              disabled={portalLoading}
              style={{
                background: "none",
                border: `1px solid ${t.accent}`,
                borderRadius: 6,
                padding: "0.35rem 0.75rem",
                color: t.accent,
                fontFamily: "var(--body)",
                fontSize: "0.76rem",
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                opacity: portalLoading ? 0.6 : 1,
              }}
            >
              <CreditCard size={13} /> Manage subscription{" "}
              <ExternalLink size={11} />
            </button>
          )}
        </div>

        {usage && (
          <div
            style={{
              padding: "1.4rem",
              borderRadius: 12,
              border: `1px solid ${t.ink08}`,
              background: t.cardBg,
            }}
          >
            <div
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                    color: t.ink,
                    marginBottom: "0.2rem",
                  }}
                >
                  <span>Scans</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                    {usage.scans_used} /{" "}
                    {usage.scans_limit === 999 ? "∞" : usage.scans_limit}
                  </span>
                </div>
                <div
                  style={{ height: 4, borderRadius: 2, background: t.ink08 }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      width: `${Math.min(
                        100,
                        (usage.scans_used / usage.scans_limit) * 100
                      )}%`,
                      background:
                        usage.scans_used >= usage.scans_limit
                          ? t.red
                          : t.accent,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.78rem",
                    color: t.ink,
                    marginBottom: "0.2rem",
                  }}
                >
                  <span>Sites</span>
                  <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                    {usage.sites_used} /{" "}
                    {usage.sites_limit === 999 ? "∞" : usage.sites_limit}
                  </span>
                </div>
                <div
                  style={{ height: 4, borderRadius: 2, background: t.ink08 }}
                >
                  <div
                    style={{
                      height: "100%",
                      borderRadius: 2,
                      width: `${Math.min(
                        100,
                        (usage.sites_used / usage.sites_limit) * 100
                      )}%`,
                      background:
                        usage.sites_used >= usage.sites_limit
                          ? t.red
                          : t.accent,
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plan cards */}
      <h2
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.1rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "1rem",
        }}
      >
        Plans
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "0.8rem",
        }}
      >
        {plans.map((p) => {
          const isCurrent = currentPlan === p.key;
          const isDowngrade =
            plans.findIndex((x) => x.key === currentPlan) >
            plans.findIndex((x) => x.key === p.key);
          const Icon = p.icon;

          return (
            <div
              key={p.key}
              style={{
                padding: "1.4rem 1.2rem",
                borderRadius: 12,
                position: "relative",
                border: `1px solid ${isCurrent ? t.accent : t.ink08}`,
                background: isCurrent ? t.accentBg : t.cardBg,
                display: "flex",
                flexDirection: "column",
              }}
            >
              {p.popular && (
                <span
                  style={{
                    position: "absolute",
                    top: -8,
                    right: 12,
                    fontFamily: "var(--mono)",
                    fontSize: "0.56rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "white",
                    background: t.accent,
                    padding: "0.12rem 0.45rem",
                    borderRadius: 3,
                  }}
                >
                  Popular
                </span>
              )}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  marginBottom: "0.4rem",
                }}
              >
                <Icon size={15} color={t.accent} strokeWidth={1.8} />
                <div
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.7rem",
                    color: t.ink50,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {p.name}
                </div>
              </div>

              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.6rem",
                  fontWeight: 700,
                  color: t.ink,
                  marginBottom: "0.7rem",
                }}
              >
                ${p.price}
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: t.ink50,
                    fontFamily: "var(--body)",
                  }}
                >
                  /mo
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  marginBottom: "1.2rem",
                  flex: 1,
                }}
              >
                {p.features.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      fontSize: "0.76rem",
                      color: t.ink50,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                    }}
                  >
                    <Check size={12} color={t.green} strokeWidth={2.5} /> {f}
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  if (isCurrent) return;
                  if (isDowngrade) {
                    handlePortal();
                  } else if (p.key !== "free") {
                    handleUpgrade(p.key);
                  }
                }}
                disabled={
                  isCurrent ||
                  (p.key === "free" && currentPlan === "free") ||
                  loadingPlan === p.key ||
                  (isDowngrade && portalLoading)
                }
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 7,
                  border: isCurrent ? "none" : `1.5px solid ${t.ink20}`,
                  background: isCurrent ? t.accent : "none",
                  color: isCurrent ? "white" : t.ink,
                  fontFamily: "var(--body)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor:
                    isCurrent || (p.key === "free" && currentPlan === "free")
                      ? "default"
                      : "pointer",
                  opacity: isCurrent
                    ? 0.7
                    : loadingPlan === p.key || (isDowngrade && portalLoading)
                    ? 0.5
                    : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                }}
              >
                {isCurrent ? (
                  "Current plan"
                ) : isDowngrade ? (
                  portalLoading ? (
                    "Redirecting…"
                  ) : (
                    <>
                      Downgrade via portal <ExternalLink size={12} />
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
