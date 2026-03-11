import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
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
  ArrowDownRight,
  AlertTriangle,
  X,
  Clock,
  Info,
} from "lucide-react";
import { Navigate } from "react-router-dom";

var PLAN_SITE_LIMITS = {
  free: 1,
  starter: 1,
  pro: 999,
  agency: 999,
};

var PLAN_ORDER = {
  free: 0,
  starter: 1,
  pro: 2,
  agency: 3,
};

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

/* ── Downgrade blocked modal (too many sites) ── */
function DowngradeBlockedModal({
  t,
  targetPlan,
  sitesUsed,
  siteLimit,
  onClose,
}) {
  var excess = sitesUsed - siteLimit;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          borderRadius: 14,
          background: t.cardBg,
          border: "1px solid " + t.ink08,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "1.2rem 1.4rem 0.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <AlertTriangle size={18} color={t.amber} strokeWidth={2} />
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1rem",
                fontWeight: 700,
                color: t.ink,
                margin: 0,
              }}
            >
              Can't downgrade yet
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.ink50,
              padding: "0.2rem",
              display: "flex",
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "0 1.4rem 1.4rem" }}>
          <p
            style={{
              fontSize: "0.88rem",
              color: t.ink50,
              lineHeight: 1.7,
              margin: "0 0 1rem",
            }}
          >
            You currently have{" "}
            <strong style={{ color: t.ink }}>
              {sitesUsed} site{sitesUsed !== 1 ? "s" : ""}
            </strong>
            , but the{" "}
            <strong style={{ color: t.ink, textTransform: "capitalize" }}>
              {targetPlan}
            </strong>{" "}
            plan only allows{" "}
            <strong style={{ color: t.ink }}>{siteLimit}</strong>. Please remove{" "}
            <strong style={{ color: t.red }}>{excess}</strong> site
            {excess !== 1 ? "s" : ""} before downgrading.
          </p>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: 7,
                border: "1.5px solid " + t.ink20,
                background: "none",
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <Link
              to="/dashboard/sites"
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: 7,
                border: "none",
                background: t.accent,
                color: "white",
                fontFamily: "var(--body)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Manage sites
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Downgrade confirm modal (sites OK — proceed?) ── */
function DowngradeConfirmModal({
  t,
  currentPlan,
  targetPlan,
  previewData,
  loading,
  confirming,
  onConfirm,
  onClose,
}) {
  var currentPlanObj = plans.find(function (p) {
    return p.key === currentPlan;
  });
  var targetPlanObj = plans.find(function (p) {
    return p.key === targetPlan;
  });
  var isCancelToFree = targetPlan === "free";

  // Features they'll lose
  var currentFeatures = currentPlanObj ? currentPlanObj.features : [];
  var targetFeatures = targetPlanObj ? targetPlanObj.features : [];
  var lostFeatures = currentFeatures.filter(function (f) {
    return !targetFeatures.some(function (tf) {
      return tf.toLowerCase() === f.toLowerCase();
    });
  });

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.4)",
        padding: "1rem",
      }}
      onClick={function (e) {
        if (e.target === e.currentTarget && !confirming) onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 460,
          borderRadius: 14,
          background: t.cardBg,
          border: "1px solid " + t.ink08,
          boxShadow: "0 16px 48px rgba(0,0,0,0.15)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 1.4rem 0.8rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <ArrowDownRight size={18} color={t.amber} strokeWidth={2} />
            <h3
              style={{
                fontFamily: "var(--serif)",
                fontSize: "1rem",
                fontWeight: 700,
                color: t.ink,
                margin: 0,
              }}
            >
              {isCancelToFree ? "Cancel subscription" : "Confirm downgrade"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={confirming}
            style={{
              background: "none",
              border: "none",
              cursor: confirming ? "default" : "pointer",
              color: t.ink50,
              padding: "0.2rem",
              display: "flex",
              opacity: confirming ? 0.4 : 1,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: "0 1.4rem 1.4rem" }}>
          {/* Plan change summary */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.8rem",
              borderRadius: 8,
              background: t.ink04 || t.ink + "06",
              marginBottom: "1rem",
            }}
          >
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.15rem",
                }}
              >
                Current
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: t.ink,
                  textTransform: "capitalize",
                }}
              >
                {currentPlan}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: t.ink50,
                }}
              >
                ${currentPlanObj ? currentPlanObj.price : 0}/mo
              </div>
            </div>
            <div style={{ color: t.ink30, fontSize: "1.2rem" }}>→</div>
            <div style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.6rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.15rem",
                }}
              >
                New plan
              </div>
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1rem",
                  fontWeight: 700,
                  color: t.ink,
                  textTransform: "capitalize",
                }}
              >
                {targetPlan}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  color: t.ink50,
                }}
              >
                {targetPlanObj
                  ? targetPlanObj.price === 0
                    ? "Free"
                    : "$" + targetPlanObj.price + "/mo"
                  : "Free"}
              </div>
            </div>
          </div>

          {/* Proration / refund info */}
          {loading ? (
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: t.accentBg,
                border: "1px solid " + t.accent + "20",
                marginBottom: "1rem",
                fontSize: "0.82rem",
                color: t.ink50,
              }}
            >
              Calculating credit…
            </div>
          ) : previewData ? (
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: t.accentBg,
                border: "1px solid " + t.accent + "20",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.5rem",
                }}
              >
                <Info
                  size={14}
                  color={t.accent}
                  style={{ marginTop: 2, flexShrink: 0 }}
                />
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: t.ink70 || t.ink50,
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {previewData.message}
                </p>
              </div>
            </div>
          ) : null}

          {/* Features they'll lose */}
          {lostFeatures.length > 0 && (
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.62rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "0.4rem",
                }}
              >
                You'll lose access to
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                {lostFeatures.slice(0, 5).map(function (f, i) {
                  return (
                    <div
                      key={i}
                      style={{
                        fontSize: "0.78rem",
                        color: t.ink50,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <X size={11} color={t.red} strokeWidth={2.5} /> {f}
                    </div>
                  );
                })}
                {lostFeatures.length > 5 && (
                  <div
                    style={{
                      fontSize: "0.76rem",
                      color: t.ink30,
                      fontStyle: "italic",
                      paddingLeft: "1.1rem",
                    }}
                  >
                    + {lostFeatures.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              onClick={onClose}
              disabled={confirming}
              style={{
                flex: 1,
                padding: "0.55rem",
                borderRadius: 7,
                border: "1.5px solid " + t.ink20,
                background: "none",
                color: t.ink,
                fontFamily: "var(--body)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: confirming ? "default" : "pointer",
                opacity: confirming ? 0.5 : 1,
              }}
            >
              Keep current plan
            </button>
            <button
              onClick={onConfirm}
              disabled={confirming || loading}
              style={{
                flex: 1,
                padding: "0.55rem",
                borderRadius: 7,
                border: "none",
                background: t.red || "#e53e3e",
                color: "white",
                fontFamily: "var(--body)",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: confirming || loading ? "default" : "pointer",
                opacity: confirming || loading ? 0.6 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.3rem",
              }}
            >
              {confirming
                ? "Processing…"
                : isCancelToFree
                ? "Cancel subscription"
                : "Confirm downgrade"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BillingPage() {
  const { t } = useTheme();
  const {
    org,
    session,
    usage: cachedUsage,
    refreshOrg,
    fetchUsage,
  } = useAuth();
  const [searchParams] = useSearchParams();
  const [usage, setUsage] = useState(null);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [downgradeBlock, setDowngradeBlock] = useState(null);
  const [downgradeConfirm, setDowngradeConfirm] = useState(null);
  const [downgradePreview, setDowngradePreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);

  // Only org owner can access billing
  if (org && org.role !== "owner") {
    return <Navigate to="/dashboard" replace />;
  }

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

  // Fetch usage
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
      const { data, error } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: { plan: planKey },
          headers: { Authorization: `Bearer ${session?.access_token}` },
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
      const { data, error } = await supabase.functions.invoke(
        "customer-portal",
        {
          headers: { Authorization: `Bearer ${session?.access_token}` },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.url) window.location.href = data.url;
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
    setPortalLoading(false);
  };

  // Step 1: Check site limits, then open confirm modal with preview
  var handleDowngrade = async function (targetKey) {
    var targetLimit = PLAN_SITE_LIMITS[targetKey] || 1;
    var sitesUsed = usage ? usage.sites_used : 0;

    // Gate: too many sites for target plan
    if (sitesUsed > targetLimit) {
      setDowngradeBlock({
        targetPlan: targetKey,
        sitesUsed: sitesUsed,
        siteLimit: targetLimit,
      });
      return;
    }

    // Sites OK — fetch proration preview from server, then show confirm modal
    setDowngradeConfirm({ targetPlan: targetKey });
    setPreviewLoading(true);
    setDowngradePreview(null);

    try {
      var { data, error } = await supabase.functions.invoke("downgrade-plan", {
        body: { target_plan: targetKey, preview_only: true },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      });
      if (error) throw new Error(error.message);

      // Server may also return a site-count error (race condition safety)
      if (data?.error === "too_many_sites") {
        setDowngradeConfirm(null);
        setDowngradeBlock({
          targetPlan: targetKey,
          sitesUsed: data.sites_used,
          siteLimit: data.site_limit,
        });
        return;
      }

      setDowngradePreview(data);
    } catch (err) {
      // Show generic preview if the server preview fails
      setDowngradePreview({
        message:
          targetKey === "free"
            ? "Your subscription will be canceled at the end of your current billing period. You'll keep full access until then."
            : "Any unused time on your current plan will be applied as a prorated credit to your next invoice.",
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  // Step 2: User confirmed — execute the downgrade
  var executeDowngrade = async function () {
    if (!downgradeConfirm) return;
    var targetKey = downgradeConfirm.targetPlan;
    setConfirming(true);

    try {
      var { data, error } = await supabase.functions.invoke("downgrade-plan", {
        body: { target_plan: targetKey },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      });
      if (error) throw new Error(error.message);

      // Server-side site-count block (race condition)
      if (data?.error === "too_many_sites") {
        setDowngradeConfirm(null);
        setConfirming(false);
        setDowngradeBlock({
          targetPlan: targetKey,
          sitesUsed: data.sites_used,
          siteLimit: data.site_limit,
        });
        return;
      }

      if (data?.error) {
        throw new Error(data.message || data.error);
      }

      setDowngradeConfirm(null);
      setConfirming(false);
      setMessage({
        type: "success",
        text: data?.message || "Plan updated successfully.",
      });
      refreshOrg?.();
      fetchUsage?.(true).then(function (d) {
        if (d) setUsage(d);
      });
    } catch (err) {
      setConfirming(false);
      setDowngradeConfirm(null);
      setMessage({
        type: "error",
        text: err.message || "Failed to downgrade. Please try again.",
      });
    }
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
          <button
            onClick={function () {
              setMessage(null);
            }}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "inherit",
              opacity: 0.6,
              display: "flex",
              padding: "0.1rem",
            }}
          >
            <X size={14} />
          </button>
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
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: t.accent,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <CreditCard size={13} />
              {portalLoading ? "Loading…" : "Manage payment method"}
            </button>
          )}
        </div>

        {/* Usage */}
        {usage && (
          <div
            style={{
              padding: "1.4rem",
              borderRadius: 12,
              border: "1px solid " + t.ink08,
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
                marginBottom: "0.8rem",
              }}
            >
              This month
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.8rem",
              }}
            >
              {[
                {
                  label: "Scans",
                  used: usage.scans_used,
                  limit: usage.scans_limit,
                },
                {
                  label: "Sites",
                  used: usage.sites_used,
                  limit: usage.sites_limit,
                },
                {
                  label: "AI suggestions",
                  used: usage.ai_suggestions_used || 0,
                  limit: usage.ai_suggestions_limit || 10,
                },
                {
                  label: "GitHub PRs",
                  used: usage.github_prs_used || 0,
                  limit: usage.github_prs_limit || 1,
                },
              ].map(function (item) {
                var atLimit = item.used >= item.limit && item.limit !== 999;
                return (
                  <div key={item.label}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.78rem",
                        color: t.ink,
                        marginBottom: "0.2rem",
                      }}
                    >
                      <span>{item.label}</span>
                      <span
                        style={{ fontFamily: "var(--mono)", fontWeight: 600 }}
                      >
                        {item.used} /{" "}
                        {item.limit === 999 ? "\u221E" : item.limit}
                      </span>
                    </div>
                    <div
                      style={{
                        height: 4,
                        borderRadius: 2,
                        background: t.ink08,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          borderRadius: 2,
                          width:
                            (item.limit === 999
                              ? 5
                              : Math.min(100, (item.used / item.limit) * 100)) +
                            "%",
                          background: atLimit ? t.red : t.accent,
                          transition: "width 0.3s",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
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
            (PLAN_ORDER[currentPlan] ?? 0) > (PLAN_ORDER[p.key] ?? 0);
          const isUpgrade = !isCurrent && !isDowngrade && p.key !== currentPlan;
          const Icon = p.icon;
          const isProcessing =
            loadingPlan === p.key ||
            (downgradeConfirm?.targetPlan === p.key && confirming);

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
                    handleDowngrade(p.key);
                  } else if (p.key !== "free") {
                    handleUpgrade(p.key);
                  }
                }}
                disabled={isCurrent || isProcessing}
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: 7,
                  border: isCurrent
                    ? "none"
                    : isDowngrade
                    ? "1.5px solid " + (t.ink15 || t.ink20)
                    : "1.5px solid " + t.ink20,
                  background: isCurrent ? t.accent : "none",
                  color: isCurrent ? "white" : isDowngrade ? t.ink50 : t.ink,
                  fontFamily: "var(--body)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: isCurrent || isProcessing ? "default" : "pointer",
                  opacity: isCurrent ? 0.7 : isProcessing ? 0.5 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                }}
              >
                {isCurrent ? (
                  "Current plan"
                ) : isProcessing ? (
                  "Processing…"
                ) : isDowngrade ? (
                  <>
                    <ArrowDownRight size={13} /> Downgrade
                  </>
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

      {/* Downgrade blocked modal (too many sites) */}
      {downgradeBlock && (
        <DowngradeBlockedModal
          t={t}
          targetPlan={downgradeBlock.targetPlan}
          sitesUsed={downgradeBlock.sitesUsed}
          siteLimit={downgradeBlock.siteLimit}
          onClose={function () {
            setDowngradeBlock(null);
          }}
        />
      )}

      {/* Downgrade confirm modal (sites OK, confirm proration) */}
      {downgradeConfirm && (
        <DowngradeConfirmModal
          t={t}
          currentPlan={currentPlan}
          targetPlan={downgradeConfirm.targetPlan}
          previewData={downgradePreview}
          loading={previewLoading}
          confirming={confirming}
          onConfirm={executeDowngrade}
          onClose={function () {
            if (!confirming) {
              setDowngradeConfirm(null);
              setDowngradePreview(null);
            }
          }}
        />
      )}
    </div>
  );
}
