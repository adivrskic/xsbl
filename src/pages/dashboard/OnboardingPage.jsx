import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import "../../styles/dashboard.css";
import "../../styles/dashboard-pages.css";
import "../../styles/dashboard-modals.css";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  ArrowRight,
  Globe,
  Rocket,
  Loader2,
  Check,
  Sparkles,
  CreditCard,
  Zap,
  Crown,
  GitPullRequest,
  Bell,
  Clock,
  ExternalLink,
  SkipForward,
  Chrome,
  Lock,
} from "lucide-react";
import CIWorkflowPanel from "../../components/dashboard/CIWorkflowPanel";

function genToken() {
  const c = "abcdef0123456789";
  let t = "xsbl-v1-";
  for (let i = 0; i < 12; i++) t += c[Math.floor(Math.random() * c.length)];
  return t;
}

var ONBOARDING_PLANS = [
  {
    key: "free",
    tier: "Free",
    price: 0,
    blurb: "Try it out, no card needed",
    highlights: ["1 site", "3 scans/mo", "WCAG 2.2 AA", "Basic issue list"],
  },
  {
    key: "starter",
    tier: "Starter",
    price: 19,
    blurb: "For indie devs & personal sites",
    highlights: [
      "1 site",
      "10 scans/mo",
      "50 AI suggestions",
      "5 GitHub PRs/mo",
      "Score badge",
    ],
  },
  {
    key: "pro",
    tier: "Pro",
    price: 69,
    popular: true,
    blurb: "For teams shipping accessible products",
    highlights: [
      "Unlimited sites",
      "100 scans/mo",
      "200 AI suggestions",
      "25 GitHub PRs/mo",
      "Scheduled scans",
      "Slack & email alerts",
      "PDF reports",
      "WCAG 2.2 AAA",
    ],
  },
  {
    key: "agency",
    tier: "Agency",
    price: 249,
    blurb: "For agencies managing client a11y",
    highlights: [
      "Everything in Pro",
      "Unlimited AI & PRs",
      "Client dashboards",
      "White-label reports",
      "VPAT generation",
      "API access",
    ],
  },
];

var SCHEDULE_OPTIONS = [
  { value: "manual", label: "Manual only" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
];

function saveStep(n) {
  try {
    localStorage.setItem("xsbl-onboarding-step", String(n));
  } catch (e) {}
}
function loadStep() {
  try {
    var v = localStorage.getItem("xsbl-onboarding-step");
    return v ? parseInt(v, 10) : 0;
  } catch (e) {
    return 0;
  }
}
function clearStep() {
  try {
    localStorage.removeItem("xsbl-onboarding-step");
  } catch (e) {}
}

function Steps({ current, total }) {
  var { t } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      {Array.from({ length: total }, function (_, i) {
        return (
          <div
            key={i}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                fontWeight: 700,
                background:
                  i < current ? t.accent : i === current ? t.accentBg : t.ink04,
                color:
                  i < current ? "white" : i === current ? t.accent : t.ink50,
                border:
                  i === current
                    ? "2px solid " + t.accent
                    : "2px solid transparent",
                transition: "all 0.3s",
              }}
            >
              {i < current ? <Check size={14} strokeWidth={3} /> : i + 1}
            </div>
            {i < total - 1 && (
              <div
                style={{
                  width: 32,
                  height: 2,
                  borderRadius: 1,
                  background: i < current ? t.accent : t.ink08,
                  transition: "background 0.3s",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StepWorkspace({ orgName, setOrgName, onNext, saving }) {
  var { t } = useTheme();
  var { user } = useAuth();
  var firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  return (
    <div>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
        <Sparkles size={28} color={t.accent} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        Welcome, {firstName}!
      </h1>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.95rem",
          marginBottom: "2rem",
          lineHeight: 1.7,
          maxWidth: 420,
        }}
      >
        Let's get your workspace set up. This is where you'll manage all your
        accessibility scans.
      </p>
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: t.ink,
            marginBottom: "0.4rem",
          }}
        >
          Workspace name
        </label>
        <input
          type="text"
          value={orgName}
          onChange={function (e) {
            setOrgName(e.target.value);
          }}
          placeholder="My Company"
          autoFocus
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "0.7rem 1rem",
            borderRadius: 8,
            border: "1.5px solid " + t.ink20,
            background: t.cardBg,
            color: t.ink,
            fontFamily: "var(--body)",
            fontSize: "0.92rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <p
          style={{ fontSize: "0.76rem", color: t.ink50, marginTop: "0.35rem" }}
        >
          You can change this later in Settings.
        </p>
      </div>
      <button
        onClick={onNext}
        disabled={!orgName.trim() || saving}
        style={{
          padding: "0.65rem 1.5rem",
          borderRadius: 8,
          border: "none",
          background: t.accent,
          color: "white",
          fontFamily: "var(--body)",
          fontSize: "0.9rem",
          fontWeight: 600,
          cursor: !orgName.trim() || saving ? "not-allowed" : "pointer",
          opacity: !orgName.trim() || saving ? 0.5 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        {saving ? (
          <Loader2 size={16} className="xsbl-spin" />
        ) : (
          <ArrowRight size={16} />
        )}
        {saving ? "Saving\u2026" : "Continue"}
      </button>
    </div>
  );
}

function StepPlan({ onSelectPlan, loading }) {
  var { t } = useTheme();
  var [hovered, setHovered] = useState(null);
  return (
    <div>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
        <CreditCard size={28} color={t.accent} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        Choose your plan
      </h1>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.95rem",
          marginBottom: "1.8rem",
          lineHeight: 1.7,
          maxWidth: 460,
        }}
      >
        Start free and upgrade anytime. Paid plans unlock more scans, AI
        suggestions, and integrations.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "0.7rem",
          maxWidth: 520,
          marginBottom: "1.5rem",
        }}
      >
        {ONBOARDING_PLANS.map(function (plan) {
          var isHov = hovered === plan.key,
            pop = plan.popular,
            isLoading = loading === plan.key;
          return (
            <div
              key={plan.key}
              onClick={function () {
                if (!loading) onSelectPlan(plan.key);
              }}
              onMouseEnter={function () {
                setHovered(plan.key);
              }}
              onMouseLeave={function () {
                setHovered(null);
              }}
              style={{
                position: "relative",
                padding: "1.1rem",
                borderRadius: 10,
                border: pop
                  ? "2px solid " + t.accent
                  : "1.5px solid " + (isHov ? t.ink20 : t.ink08),
                background: pop ? t.accentBg : t.cardBg,
                cursor: loading ? "wait" : "pointer",
                transition: "all 0.2s",
                transform: isHov && !loading ? "translateY(-2px)" : "none",
                boxShadow:
                  isHov && !loading ? "0 8px 24px rgba(0,0,0,0.06)" : "none",
                opacity: loading && !isLoading ? 0.5 : 1,
              }}
            >
              {pop && (
                <span
                  style={{
                    position: "absolute",
                    top: -9,
                    left: "1rem",
                    fontFamily: "var(--mono)",
                    fontSize: "0.55rem",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "white",
                    background: t.accent,
                    padding: "0.15rem 0.5rem",
                    borderRadius: 3,
                  }}
                >
                  Most popular
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--mono)",
                    fontSize: "0.62rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: pop ? t.accent : t.ink50,
                  }}
                >
                  {plan.tier}
                </span>
                {plan.key === "agency" && (
                  <Crown size={13} color={t.ink50} strokeWidth={1.5} />
                )}
              </div>
              <div style={{ marginBottom: "0.4rem" }}>
                <span
                  style={{
                    fontFamily: "var(--serif)",
                    fontSize: "1.6rem",
                    fontWeight: 700,
                    color: t.ink,
                    letterSpacing: "-0.02em",
                  }}
                >
                  {plan.price === 0 ? "Free" : "$" + plan.price}
                </span>
                {plan.price > 0 && (
                  <span
                    style={{
                      fontSize: "0.78rem",
                      color: t.ink50,
                      marginLeft: "0.2rem",
                    }}
                  >
                    /mo
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.76rem",
                  color: t.ink50,
                  marginBottom: "0.7rem",
                  lineHeight: 1.4,
                }}
              >
                {plan.blurb}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.25rem",
                  marginBottom: "0.8rem",
                }}
              >
                {plan.highlights.slice(0, 5).map(function (f, i) {
                  return (
                    <div
                      key={i}
                      style={{
                        fontSize: "0.72rem",
                        color: t.ink50,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <Check
                        size={11}
                        color={pop ? t.accent : t.ink20}
                        strokeWidth={2.5}
                      />
                      {f}
                    </div>
                  );
                })}
                {plan.highlights.length > 5 && (
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: t.ink50,
                      paddingLeft: "1.35rem",
                      fontStyle: "italic",
                    }}
                  >
                    + {plan.highlights.length - 5} more
                  </div>
                )}
              </div>
              <div
                style={{
                  padding: "0.45rem 0",
                  borderRadius: 6,
                  textAlign: "center",
                  fontFamily: "var(--body)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  background: pop ? t.accent : "transparent",
                  color: pop ? "white" : t.ink,
                  border: pop ? "none" : "1.5px solid " + t.ink20,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.35rem",
                }}
              >
                {isLoading ? (
                  <Loader2 size={14} className="xsbl-spin" />
                ) : plan.key === "free" ? (
                  <>
                    Continue free <ArrowRight size={13} />
                  </>
                ) : (
                  <>
                    <Zap size={12} /> Start with {plan.tier}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: t.ink50,
          maxWidth: 460,
          lineHeight: 1.6,
        }}
      >
        All paid plans include a free trial. Cancel anytime from Settings →
        Billing.
      </p>
    </div>
  );
}

function StepAddSite({ domain, setDomain, onNext, onSkip, saving }) {
  var { t } = useTheme();
  return (
    <div>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
        <Globe size={28} color={t.accent} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        Add your first site
      </h1>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.95rem",
          marginBottom: "2rem",
          lineHeight: 1.7,
          maxWidth: 420,
        }}
      >
        Enter the domain you want to scan for accessibility issues.
      </p>
      <div style={{ marginBottom: "1.5rem" }}>
        <label
          style={{
            display: "block",
            fontSize: "0.82rem",
            fontWeight: 600,
            color: t.ink,
            marginBottom: "0.4rem",
          }}
        >
          Domain
        </label>
        <input
          type="text"
          value={domain}
          onChange={function (e) {
            setDomain(e.target.value);
          }}
          placeholder="example.com"
          autoFocus
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "0.7rem 1rem",
            borderRadius: 8,
            border: "1.5px solid " + t.ink20,
            background: t.cardBg,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.92rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
        <button
          onClick={onNext}
          disabled={!domain.trim() || saving}
          style={{
            padding: "0.65rem 1.5rem",
            borderRadius: 8,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: !domain.trim() || saving ? "not-allowed" : "pointer",
            opacity: !domain.trim() || saving ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {saving ? (
            <Loader2 size={16} className="xsbl-spin" />
          ) : (
            <ArrowRight size={16} />
          )}
          {saving ? "Adding\u2026" : "Add site & scan"}
        </button>
        <button
          onClick={onSkip}
          style={{
            padding: "0.65rem 1rem",
            borderRadius: 8,
            border: "1.5px solid " + t.ink20,
            background: "none",
            color: t.ink50,
            fontFamily: "var(--body)",
            fontSize: "0.88rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}

function StepSetup({ site, onNext }) {
  var { t } = useTheme();
  var [githubRepo, setGithubRepo] = useState("");
  var [githubToken, setGithubToken] = useState("");
  var [slackUrl, setSlackUrl] = useState("");
  var [alertEmail, setAlertEmail] = useState("");
  var [schedule, setSchedule] = useState("manual");
  var [savingSection, setSavingSection] = useState(null);
  var [saved, setSaved] = useState({});

  var handleSaveGithub = async function () {
    if (!githubRepo.trim() || !githubToken.trim() || !site) return;
    setSavingSection("github");
    await supabase
      .from("sites")
      .update({
        github_repo: githubRepo.trim(),
        github_token: githubToken.trim(),
        github_default_branch: "main",
      })
      .eq("id", site.id);
    setSaved(function (p) {
      return { ...p, github: true };
    });
    setSavingSection(null);
  };

  var handleSaveAlerts = async function () {
    if (!site) return;
    setSavingSection("alerts");
    var updates = {};
    if (slackUrl.trim()) updates.slack_webhook_url = slackUrl.trim();
    if (alertEmail.trim())
      updates.alert_emails = alertEmail
        .split(",")
        .map(function (e) {
          return e.trim();
        })
        .filter(Boolean);
    if (Object.keys(updates).length > 0)
      await supabase
        .from("organizations")
        .update(updates)
        .eq("id", site.org_id);
    setSaved(function (p) {
      return { ...p, alerts: true };
    });
    setSavingSection(null);
  };

  var handleSaveSchedule = async function () {
    if (!site || schedule === "manual") return;
    setSavingSection("schedule");
    await supabase
      .from("sites")
      .update({ scan_schedule: schedule, schedule_hour: 6 })
      .eq("id", site.id);
    setSaved(function (p) {
      return { ...p, schedule: true };
    });
    setSavingSection(null);
  };

  var card = function (key) {
    return {
      padding: "1rem 1.2rem",
      borderRadius: 10,
      border: saved[key]
        ? "1.5px solid " + t.green + "40"
        : "1.5px solid " + t.ink08,
      background: saved[key] ? t.green + "06" : t.cardBg,
      marginBottom: "0.6rem",
      transition: "all 0.2s",
    };
  };
  var lbl = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "0.6rem",
  };
  var inp = {
    width: "100%",
    padding: "0.5rem 0.7rem",
    borderRadius: 6,
    border: "1.5px solid " + t.ink12,
    background: t.paper,
    color: t.ink,
    fontFamily: "var(--mono)",
    fontSize: "0.78rem",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "0.4rem",
  };
  var sbtn = function (on) {
    return {
      padding: "0.35rem 0.8rem",
      borderRadius: 5,
      border: "none",
      background: on ? t.accent : t.ink08,
      color: on ? "white" : t.ink50,
      fontFamily: "var(--mono)",
      fontSize: "0.7rem",
      fontWeight: 600,
      cursor: on ? "pointer" : "default",
      opacity: on ? 1 : 0.5,
      display: "inline-flex",
      alignItems: "center",
      gap: "0.3rem",
    };
  };

  return (
    <div>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
        <Zap size={28} color={t.accent} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        Supercharge your setup
      </h1>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.95rem",
          marginBottom: "1.5rem",
          lineHeight: 1.7,
          maxWidth: 440,
        }}
      >
        These are optional — configure now or later from Settings.
      </p>

      <div style={card("github")}>
        <div style={lbl}>
          <GitPullRequest size={15} color={saved.github ? t.green : t.ink50} />
          <span style={{ fontSize: "0.84rem", fontWeight: 600, color: t.ink }}>
            GitHub Integration
          </span>
          {saved.github && <Check size={13} color={t.green} strokeWidth={3} />}
        </div>
        <p
          style={{
            fontSize: "0.74rem",
            color: t.ink50,
            marginBottom: "0.6rem",
            lineHeight: 1.5,
          }}
        >
          Connect a repo to auto-create PRs that fix accessibility issues.
        </p>
        {!saved.github && (
          <>
            <input
              value={githubRepo}
              onChange={function (e) {
                setGithubRepo(e.target.value);
              }}
              placeholder="owner/repo"
              style={inp}
            />
            <input
              type="password"
              value={githubToken}
              onChange={function (e) {
                setGithubToken(e.target.value);
              }}
              placeholder="ghp_xxxxxxxxxxxx (repo scope)"
              style={inp}
            />
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <button
                onClick={handleSaveGithub}
                disabled={
                  !githubRepo.trim() ||
                  !githubToken.trim() ||
                  savingSection === "github"
                }
                style={sbtn(githubRepo.trim() && githubToken.trim())}
              >
                {savingSection === "github" ? (
                  <Loader2 size={11} className="xsbl-spin" />
                ) : (
                  <Check size={11} />
                )}{" "}
                Connect
              </button>
              <a
                href="https://github.com/settings/tokens/new?scopes=repo&description=xsbl-a11y-fixes"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: "0.68rem",
                  color: t.accent,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.2rem",
                  textDecoration: "none",
                }}
              >
                Get token <ExternalLink size={9} />
              </a>
            </div>
          </>
        )}
        {saved.github && site && (
          <div style={{ marginTop: "0.5rem" }}>
            <div
              style={{
                fontSize: "0.72rem",
                color: t.ink50,
                marginBottom: "0.4rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Zap size={11} color={t.accent} />
              Auto-scan on every deploy?
            </div>
            <CIWorkflowPanel
              site={{
                ...site,
                github_repo: githubRepo,
                github_token: githubToken,
              }}
              onUpdate={function () {}}
              compact
            />
          </div>
        )}
      </div>

      <div style={card("alerts")}>
        <div style={lbl}>
          <Bell size={15} color={saved.alerts ? t.green : t.ink50} />
          <span style={{ fontSize: "0.84rem", fontWeight: 600, color: t.ink }}>
            Alerts
          </span>
          {saved.alerts && <Check size={13} color={t.green} strokeWidth={3} />}
        </div>
        <p
          style={{
            fontSize: "0.74rem",
            color: t.ink50,
            marginBottom: "0.6rem",
            lineHeight: 1.5,
          }}
        >
          Get notified when scans find new critical issues.
        </p>
        {!saved.alerts && (
          <>
            <input
              value={slackUrl}
              onChange={function (e) {
                setSlackUrl(e.target.value);
              }}
              placeholder="Slack webhook URL (optional)"
              style={inp}
            />
            <input
              value={alertEmail}
              onChange={function (e) {
                setAlertEmail(e.target.value);
              }}
              placeholder="Alert email(s), comma separated"
              style={inp}
            />
            <button
              onClick={handleSaveAlerts}
              disabled={
                (!slackUrl.trim() && !alertEmail.trim()) ||
                savingSection === "alerts"
              }
              style={sbtn(slackUrl.trim() || alertEmail.trim())}
            >
              {savingSection === "alerts" ? (
                <Loader2 size={11} className="xsbl-spin" />
              ) : (
                <Check size={11} />
              )}{" "}
              Save alerts
            </button>
          </>
        )}
      </div>

      <div style={card("schedule")}>
        <div style={lbl}>
          <Clock size={15} color={saved.schedule ? t.green : t.ink50} />
          <span style={{ fontSize: "0.84rem", fontWeight: 600, color: t.ink }}>
            Scan Schedule
          </span>
          {saved.schedule && (
            <Check size={13} color={t.green} strokeWidth={3} />
          )}
        </div>
        <p
          style={{
            fontSize: "0.74rem",
            color: t.ink50,
            marginBottom: "0.6rem",
            lineHeight: 1.5,
          }}
        >
          Automatically re-scan on a schedule to catch regressions.
        </p>
        {!saved.schedule && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              flexWrap: "wrap",
            }}
          >
            {SCHEDULE_OPTIONS.map(function (opt) {
              var on = schedule === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={function () {
                    setSchedule(opt.value);
                  }}
                  style={{
                    padding: "0.35rem 0.7rem",
                    borderRadius: 5,
                    border: on
                      ? "1.5px solid " + t.accent
                      : "1.5px solid " + t.ink08,
                    background: on ? t.accentBg : "transparent",
                    color: on ? t.accent : t.ink50,
                    fontFamily: "var(--mono)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
            {schedule !== "manual" && (
              <button
                onClick={handleSaveSchedule}
                disabled={savingSection === "schedule"}
                style={sbtn(true)}
              >
                {savingSection === "schedule" ? (
                  <Loader2 size={11} className="xsbl-spin" />
                ) : (
                  <Check size={11} />
                )}{" "}
                Save
              </button>
            )}
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: "0.6rem", marginTop: "1.2rem" }}>
        <button
          onClick={onNext}
          style={{
            padding: "0.65rem 1.5rem",
            borderRadius: 8,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          Continue <ArrowRight size={16} />
        </button>
        <button
          onClick={onNext}
          style={{
            padding: "0.65rem 1rem",
            borderRadius: 8,
            border: "1.5px solid " + t.ink20,
            background: "none",
            color: t.ink50,
            fontFamily: "var(--body)",
            fontSize: "0.82rem",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <SkipForward size={14} /> Skip, I'll do this later
        </button>
      </div>
    </div>
  );
}

var CHROME_STORE_URL =
  "https://chrome.google.com/webstore/detail/xsbl-accessibility/placeholder";

function StepExtension({ onNext, onSkip }) {
  var { t } = useTheme();
  var { org } = useAuth();
  var plan = org?.plan || "free";
  var hasPro = plan !== "free" && plan !== "starter";

  var features = [
    { label: "Real-time contrast boost & text scaling", free: true },
    { label: "Keyboard navigation overlay & focus rings", free: true },
    { label: "Stop motion & media (videos, GIFs, animations)", free: true },
    { label: "Dyslexia-friendly mode (font, spacing, ruler)", free: false },
    { label: "Color blindness correction filters", free: false },
    { label: "ARIA & heading hierarchy auto-fix", free: false },
    { label: "Caption detection for uncaptioned media", free: false },
    { label: "Read aloud (text-to-speech)", free: false },
    { label: "Reading mode (strip clutter)", free: false },
    { label: "Color tint overlays (12 colors)", free: false },
    { label: "Accessible font override (Lexend, Atkinson)", free: false },
    { label: "AI-generated alt text for images", free: false },
  ];

  return (
    <div>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
        <Chrome size={28} color={t.accent} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        Get the Chrome extension
      </h1>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.95rem",
          marginBottom: "1.5rem",
          lineHeight: 1.7,
          maxWidth: 440,
        }}
      >
        Make <em>any</em> website accessible while you browse. Boost contrast,
        generate alt text with AI, enable keyboard navigation, and turn on
        dyslexia-friendly mode — on every site you visit.
      </p>

      {/* Feature list */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.35rem",
          marginBottom: "1.5rem",
          maxWidth: 400,
        }}
      >
        {features.map(function (f, i) {
          var unlocked = f.free || hasPro;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.45rem 0.65rem",
                borderRadius: 7,
                background: unlocked ? t.green + "06" : t.ink04,
                border: "1px solid " + (unlocked ? t.green + "15" : t.ink08),
              }}
            >
              {unlocked ? (
                <Check
                  size={13}
                  strokeWidth={2.5}
                  color={t.green}
                  style={{ flexShrink: 0 }}
                />
              ) : (
                <Lock
                  size={12}
                  strokeWidth={2}
                  color={t.ink50}
                  style={{ flexShrink: 0 }}
                />
              )}
              <span
                style={{
                  fontSize: "0.8rem",
                  color: unlocked ? t.ink : t.ink50,
                  fontWeight: unlocked ? 500 : 400,
                  flex: 1,
                }}
              >
                {f.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.46rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  padding: "0.08rem 0.3rem",
                  borderRadius: 3,
                  background: f.free ? t.green + "10" : t.accent + "10",
                  color: f.free ? t.green : t.accent,
                  flexShrink: 0,
                }}
              >
                {f.free ? "Free" : "Pro"}
              </span>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div
        style={{
          display: "flex",
          gap: "0.6rem",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <a
          href={CHROME_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={function () {
            try {
              localStorage.setItem("xsbl-ext-prompted", "true");
            } catch (e) {}
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.65rem 1.3rem",
            borderRadius: 8,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.9rem",
            fontWeight: 600,
            textDecoration: "none",
            cursor: "pointer",
          }}
        >
          <Chrome size={16} strokeWidth={2} />
          Add to Chrome
        </a>
        <button
          onClick={function () {
            try {
              localStorage.setItem("xsbl-ext-prompted", "true");
            } catch (e) {}
            onNext();
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.65rem 1rem",
            borderRadius: 8,
            border: "1.5px solid " + t.ink08,
            background: "none",
            color: t.ink50,
            fontFamily: "var(--body)",
            fontSize: "0.84rem",
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          <SkipForward size={14} strokeWidth={2} />
          Skip for now
        </button>
      </div>

      <p
        style={{
          fontSize: "0.72rem",
          color: t.ink50,
          marginTop: "0.6rem",
          maxWidth: 400,
        }}
      >
        You can always install it later from Settings → Integrations.
      </p>
    </div>
  );
}

function StepDone({ site, scanResult, scanning, onFinish }) {
  var { t } = useTheme();
  return (
    <div>
      <div style={{ fontSize: "1.6rem", marginBottom: "0.8rem" }}>
        <Rocket size={28} color={t.accent} strokeWidth={1.5} />
      </div>
      <h1
        style={{
          fontFamily: "var(--serif)",
          fontSize: "1.8rem",
          fontWeight: 700,
          color: t.ink,
          marginBottom: "0.5rem",
          lineHeight: 1.2,
        }}
      >
        {scanning ? "Scanning your site" : "You're all set!"}
      </h1>
      {scanning ? (
        <div>
          <p
            style={{
              color: t.ink50,
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
              lineHeight: 1.7,
              maxWidth: 420,
            }}
          >
            We're scanning{" "}
            <strong style={{ color: t.ink }}>{site?.domain}</strong> in a real
            browser. This takes about a minute.
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              color: t.accent,
              fontSize: "0.88rem",
            }}
          >
            <Loader2 size={18} className="xsbl-spin" /> Running WCAG 2.2 scan
          </div>
        </div>
      ) : scanResult ? (
        <div>
          <p
            style={{
              color: t.ink50,
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
              lineHeight: 1.7,
              maxWidth: 420,
            }}
          >
            First scan complete. Here's a quick look:
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "0.6rem",
              marginBottom: "1.5rem",
              maxWidth: 280,
            }}
          >
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: t.cardBg,
                border: "1px solid " + t.ink08,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color:
                    scanResult.score >= 80
                      ? t.green
                      : scanResult.score >= 50
                      ? t.amber
                      : t.red,
                }}
              >
                {Math.round(scanResult.score)}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                }}
              >
                Score
              </div>
            </div>
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: t.cardBg,
                border: "1px solid " + t.ink08,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: t.red,
                }}
              >
                {scanResult.issues_found}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                }}
              >
                Issues
              </div>
            </div>
          </div>
          <button
            onClick={onFinish}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: 8,
              border: "none",
              background: t.accent,
              color: "white",
              fontFamily: "var(--body)",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Go to dashboard <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div>
          <p
            style={{
              color: t.ink50,
              fontSize: "0.95rem",
              marginBottom: "1.5rem",
              lineHeight: 1.7,
              maxWidth: 420,
            }}
          >
            Your workspace is ready. You can add sites and start scanning from
            the dashboard.
          </p>
          <button
            onClick={onFinish}
            style={{
              padding: "0.65rem 1.5rem",
              borderRadius: 8,
              border: "none",
              background: t.accent,
              color: "white",
              fontFamily: "var(--body)",
              fontSize: "0.9rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            Go to dashboard <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default function OnboardingPage() {
  var { t } = useTheme();
  var { user, org, session, refreshOrg } = useAuth();
  var navigate = useNavigate();
  var [searchParams] = useSearchParams();

  var checkoutSuccess = searchParams.get("checkout") === "success";
  var checkoutCanceled = searchParams.get("checkout") === "canceled";

  var [step, setStepRaw] = useState(function () {
    if (checkoutSuccess) return 2;
    if (checkoutCanceled) return 1;
    var s = loadStep();
    if (s <= 1 && org && org.plan && org.plan !== "free") return 2;
    return s;
  });

  var setStep = function (n) {
    setStepRaw(n);
    saveStep(n);
  };

  useEffect(
    function () {
      if (org && org.plan && org.plan !== "free" && step <= 1) setStep(2);
    },
    [org?.plan]
  );

  useEffect(
    function () {
      if (checkoutSuccess && org) refreshOrg?.();
    },
    [checkoutSuccess]
  );

  var [orgName, setOrgName] = useState(
    org?.name ||
      (user?.user_metadata?.full_name
        ? user.user_metadata.full_name + "'s workspace"
        : "")
  );
  var [domain, setDomain] = useState("");
  var [site, setSite] = useState(null);
  var [scanResult, setScanResult] = useState(null);
  var [scanning, setScanning] = useState(false);
  var [saving, setSaving] = useState(false);
  var [loadingPlan, setLoadingPlan] = useState(null);
  var [error, setError] = useState(null);

  var handleStep1 = async function () {
    setSaving(true);
    setError(null);
    try {
      if (org) {
        await supabase
          .from("organizations")
          .update({ name: orgName.trim() })
          .eq("id", org.id);
      } else {
        var { data: rpcResult, error: rpcErr } = await supabase.rpc(
          "bootstrap_workspace",
          { p_org_name: orgName.trim() || "My workspace" }
        );
        if (rpcErr) {
          setError("Failed to create workspace: " + rpcErr.message);
          setSaving(false);
          return;
        }
        if (rpcResult && rpcResult.error) {
          setError(rpcResult.error);
          setSaving(false);
          return;
        }
      }
      await refreshOrg?.();
      setStep(1);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  var handleSelectPlan = async function (planKey) {
    setError(null);
    if (planKey === "free") {
      setStep(2);
      return;
    }
    setLoadingPlan(planKey);
    try {
      var origin = window.location.origin;
      var { data, error: checkoutErr } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            plan: planKey,
            success_url: origin + "/dashboard/onboarding?checkout=success",
            cancel_url: origin + "/dashboard/onboarding?checkout=canceled",
          },
          headers: {
            Authorization: "Bearer " + (session ? session.access_token : ""),
          },
        }
      );
      if (checkoutErr) throw new Error(checkoutErr.message);
      if (data && data.url) {
        window.location.href = data.url;
        return;
      }
      setStep(2);
    } catch (err) {
      setError(
        "Checkout failed: " +
          err.message +
          ". You can upgrade later from Billing."
      );
      setTimeout(function () {
        setStep(2);
      }, 2500);
    }
    setLoadingPlan(null);
  };

  var handleAddSite = async function () {
    setSaving(true);
    setError(null);
    try {
      var d = domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
      if (!d || !d.includes(".")) {
        setError("Enter a valid domain");
        setSaving(false);
        return;
      }
      var { data: newSite, error: siteErr } = await supabase
        .from("sites")
        .insert({
          org_id: org.id,
          domain: d,
          display_name: d,
          verification_token: genToken(),
        })
        .select()
        .single();
      if (siteErr) {
        setError(
          siteErr.code === "23505" ? "Domain already added." : siteErr.message
        );
        setSaving(false);
        return;
      }
      setSite(newSite);
      setStep(3);
      setSaving(false);
      setScanning(true);
      try {
        var res = await supabase.functions.invoke("scan-site", {
          body: { site_id: newSite.id },
        });
        if (res.error) throw new Error(res.error.message);
        setScanResult(res.data);
      } catch (e) {
        setScanResult(null);
      }
      setScanning(false);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  var handleSkipSite = function () {
    setStep(4);
  };
  var handleSetupDone = function () {
    setStep(4);
  };
  var handleExtensionDone = function () {
    setStep(5);
  };

  var handleFinish = async function () {
    clearStep();
    await supabase
      .from("organizations")
      .update({ onboarding_complete: true })
      .eq("id", org.id);
    if (user)
      await supabase.from("notification_prefs").upsert(
        {
          user_id: user.id,
          scan_complete: false,
          critical_issues: false,
          weekly_digest: false,
        },
        { onConflict: "user_id" }
      );
    await refreshOrg?.();
    navigate("/dashboard", { replace: true });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: t.paper,
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: step === 1 || step === 3 ? 580 : 500,
          transition: "max-width 0.3s",
        }}
      >
        <div
          style={{
            fontFamily: "var(--mono)",
            fontWeight: 600,
            fontSize: "1.3rem",
            color: t.ink,
            marginBottom: "2rem",
          }}
        >
          xsbl<span style={{ color: t.accent }}>.</span>
        </div>
        <Steps current={step} total={6} />
        {error && (
          <div
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: 8,
              marginBottom: "1rem",
              background: t.red + "08",
              border: "1px solid " + t.red + "20",
              color: t.red,
              fontSize: "0.82rem",
            }}
          >
            {error}
          </div>
        )}
        {step === 0 && (
          <StepWorkspace
            orgName={orgName}
            setOrgName={setOrgName}
            onNext={handleStep1}
            saving={saving}
          />
        )}
        {step === 1 && (
          <StepPlan onSelectPlan={handleSelectPlan} loading={loadingPlan} />
        )}
        {step === 2 && (
          <StepAddSite
            domain={domain}
            setDomain={setDomain}
            onNext={handleAddSite}
            onSkip={handleSkipSite}
            saving={saving}
          />
        )}
        {step === 3 && <StepSetup site={site} onNext={handleSetupDone} />}
        {step === 4 && (
          <StepExtension
            onNext={handleExtensionDone}
            onSkip={handleExtensionDone}
          />
        )}
        {step === 5 && (
          <StepDone
            site={site}
            scanResult={scanResult}
            scanning={scanning}
            onFinish={handleFinish}
          />
        )}
      </div>
      <style>{`@keyframes xsbl-spin { to { transform: rotate(360deg); } } .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }`}</style>
    </div>
  );
}
