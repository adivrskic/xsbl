import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import {
  ArrowRight,
  Globe,
  Rocket,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";

function genToken() {
  const c = "abcdef0123456789";
  let t = "xsbl-v1-";
  for (let i = 0; i < 12; i++) t += c[Math.floor(Math.random() * c.length)];
  return t;
}

/* ── Step indicator ── */
function Steps({ current, total }) {
  const { t } = useTheme();
  return (
    <div
      style={{
        display: "flex",
        gap: "0.5rem",
        alignItems: "center",
        marginBottom: "2rem",
      }}
    >
      {Array.from({ length: total }, (_, i) => (
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
              color: i < current ? "white" : i === current ? t.accent : t.ink50,
              border:
                i === current
                  ? `2px solid ${t.accent}`
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
      ))}
    </div>
  );
}

/* ── Step 1: Name workspace ── */
function StepWorkspace({ orgName, setOrgName, onNext, saving }) {
  const { t } = useTheme();
  const { user } = useAuth();

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";

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
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="My Company"
          autoFocus
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "0.7rem 1rem",
            borderRadius: 8,
            border: `1.5px solid ${t.ink20}`,
            background: t.cardBg,
            color: t.ink,
            fontFamily: "var(--body)",
            fontSize: "0.92rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.accent)}
          onBlur={(e) => (e.target.style.borderColor = t.ink20)}
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
        {saving ? "Saving…" : "Continue"}
      </button>
    </div>
  );
}

/* ── Step 2: Add first site ── */
function StepAddSite({ domain, setDomain, onNext, onSkip, saving }) {
  const { t } = useTheme();

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
        Enter the domain you want to scan for accessibility issues. We'll check
        it against WCAG 2.2 in a real browser.
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
          onChange={(e) => setDomain(e.target.value)}
          placeholder="example.com"
          autoFocus
          style={{
            width: "100%",
            maxWidth: 360,
            padding: "0.7rem 1rem",
            borderRadius: 8,
            border: `1.5px solid ${t.ink20}`,
            background: t.cardBg,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.92rem",
            outline: "none",
            boxSizing: "border-box",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.accent)}
          onBlur={(e) => (e.target.style.borderColor = t.ink20)}
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
          {saving ? "Adding…" : "Add site & scan"}
        </button>
        <button
          onClick={onSkip}
          style={{
            padding: "0.65rem 1rem",
            borderRadius: 8,
            border: `1.5px solid ${t.ink20}`,
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

/* ── Step 3: Scanning / done ── */
function StepScan({ site, scanResult, scanning, onFinish }) {
  const { t } = useTheme();

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
        {scanning ? "Scanning your site…" : "You're all set!"}
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
            browser. This takes about 10–15 seconds.
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
            <Loader2 size={18} className="xsbl-spin" />
            Running WCAG 2.2 scan…
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
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.6rem",
              marginBottom: "1.5rem",
              maxWidth: 360,
            }}
          >
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: t.cardBg,
                border: `1px solid ${t.ink08}`,
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
                border: `1px solid ${t.ink08}`,
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
            <div
              style={{
                padding: "0.8rem",
                borderRadius: 8,
                background: t.cardBg,
                border: `1px solid ${t.ink08}`,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--serif)",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: t.ink,
                }}
              >
                {scanResult.violations_count}
              </div>
              <div
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.55rem",
                  color: t.ink50,
                  textTransform: "uppercase",
                }}
              >
                Rules
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

/* ── Main onboarding page ── */
export default function OnboardingPage() {
  const { t } = useTheme();
  const { user, org, refreshOrg } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [orgName, setOrgName] = useState(
    org?.name || user?.user_metadata?.full_name
      ? `${user.user_metadata.full_name}'s workspace`
      : ""
  );
  const [domain, setDomain] = useState("");
  const [site, setSite] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Step 1 → save org name
  const handleStep1 = async () => {
    setSaving(true);
    setError(null);
    try {
      if (org) {
        await supabase
          .from("organizations")
          .update({ name: orgName.trim() })
          .eq("id", org.id);
      }
      await refreshOrg?.();
      setStep(1);
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  // Step 2 → add site + trigger scan
  const handleStep2 = async () => {
    setSaving(true);
    setError(null);
    try {
      let d = domain
        .trim()
        .toLowerCase()
        .replace(/^https?:\/\//, "")
        .replace(/\/.*$/, "");
      if (!d || !d.includes(".")) {
        setError("Enter a valid domain");
        setSaving(false);
        return;
      }

      const { data: newSite, error: siteErr } = await supabase
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
      setStep(2);
      setSaving(false);

      // Trigger scan
      setScanning(true);
      try {
        const res = await supabase.functions.invoke("scan-site", {
          body: { site_id: newSite.id },
        });
        if (res.error) throw new Error(res.error.message);
        setScanResult(res.data);
      } catch {
        // Scan failed but onboarding continues
        setScanResult(null);
      }
      setScanning(false);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleSkipSite = () => {
    setStep(2);
  };

  const handleFinish = async () => {
    // Mark onboarding complete
    await supabase
      .from("organizations")
      .update({ onboarding_complete: true })
      .eq("id", org.id);
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
      <div style={{ width: "100%", maxWidth: 500 }}>
        {/* Logo */}
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

        <Steps current={step} total={3} />

        {error && (
          <div
            style={{
              padding: "0.6rem 0.9rem",
              borderRadius: 8,
              marginBottom: "1rem",
              background: `${t.red}08`,
              border: `1px solid ${t.red}20`,
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
          <StepAddSite
            domain={domain}
            setDomain={setDomain}
            onNext={handleStep2}
            onSkip={handleSkipSite}
            saving={saving}
          />
        )}
        {step === 2 && (
          <StepScan
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
