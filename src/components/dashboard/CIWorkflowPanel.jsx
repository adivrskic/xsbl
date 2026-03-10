import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../ui/Toast";
import { useConfirm } from "../ui/ConfirmModal";
import {
  Play,
  Check,
  Loader2,
  ExternalLink,
  Trash2,
  Zap,
  RefreshCw,
} from "lucide-react";

function GitHubIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function CIWorkflowPanel({ site, onUpdate, compact }) {
  const { t } = useTheme();
  const toast = useToast();
  const confirm = useConfirm();
  const [installing, setInstalling] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [result, setResult] = useState(null);

  var hasGitHub = site && site.github_repo && site.github_token;
  var isEnabled = site && site.ci_enabled;

  if (!hasGitHub) return null;

  var handleInstall = async function () {
    setInstalling(true);
    setResult(null);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var { data, error } = await supabase.functions.invoke(
        "install-ci-workflow",
        {
          body: { site_id: site.id, action: "install" },
          headers: {
            Authorization: "Bearer " + (session?.access_token || ""),
          },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setResult(data);
      if (data.status === "installed") {
        toast.success("CI workflow installed!");
        onUpdate && onUpdate({ ...site, ci_enabled: true });
      } else if (data.status === "already_installed") {
        toast.info("CI workflow is already installed");
        onUpdate && onUpdate({ ...site, ci_enabled: true });
      }
    } catch (err) {
      toast.error("Install failed: " + String(err).substring(0, 120));
      setResult({ error: String(err) });
    }
    setInstalling(false);
  };

  var handleUninstall = async function () {
    var ok = await confirm({
      title: "Remove CI workflow",
      message:
        "This will delete the xsbl workflow file and secrets from " +
        site.github_repo +
        ". Accessibility scans will no longer run automatically on deploy.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;

    setUninstalling(true);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var { data, error } = await supabase.functions.invoke(
        "install-ci-workflow",
        {
          body: { site_id: site.id, action: "uninstall" },
          headers: {
            Authorization: "Bearer " + (session?.access_token || ""),
          },
        }
      );
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      toast.success("CI workflow removed");
      setResult(null);
      onUpdate && onUpdate({ ...site, ci_enabled: false });
    } catch (err) {
      toast.error("Failed: " + String(err).substring(0, 100));
    }
    setUninstalling(false);
  };

  // ── Compact mode (for onboarding) ──
  if (compact) {
    if (isEnabled) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            fontSize: "0.74rem",
            color: t.green,
            fontWeight: 600,
          }}
        >
          <Check size={13} strokeWidth={3} /> CI scanning enabled
        </div>
      );
    }

    return (
      <button
        onClick={handleInstall}
        disabled={installing}
        style={{
          padding: "0.35rem 0.8rem",
          borderRadius: 5,
          border: "none",
          background: installing ? t.ink08 : t.accent,
          color: "white",
          fontFamily: "var(--mono)",
          fontSize: "0.7rem",
          fontWeight: 600,
          cursor: installing ? "not-allowed" : "pointer",
          opacity: installing ? 0.6 : 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        {installing ? (
          <Loader2 size={11} className="xsbl-spin" />
        ) : (
          <Zap size={11} />
        )}{" "}
        {installing ? "Installing…" : "Enable CI scanning"}
      </button>
    );
  }

  // ── Full panel mode (for site settings) ──
  return (
    <div
      style={{
        padding: "1.2rem 1.5rem",
        borderRadius: 12,
        border: isEnabled
          ? "1px solid " + t.green + "30"
          : "1px solid " + t.ink08,
        background: isEnabled ? t.green + "06" : t.cardBg,
        marginBottom: "1rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 7,
            background: isEnabled ? t.green + "15" : t.accentBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {isEnabled ? (
            <Check size={14} color={t.green} strokeWidth={2.5} />
          ) : (
            <Zap size={14} color={t.accent} strokeWidth={2} />
          )}
        </div>
        <div>
          <h3
            style={{
              fontSize: "0.92rem",
              fontWeight: 600,
              color: t.ink,
              margin: 0,
            }}
          >
            CI / Continuous Scanning
          </h3>
        </div>
        {isEnabled && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              fontWeight: 700,
              padding: "0.15rem 0.4rem",
              borderRadius: 4,
              background: t.green + "15",
              color: t.green,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            active
          </span>
        )}
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "0.78rem",
          color: t.ink50,
          lineHeight: 1.6,
          margin: "0 0 0.8rem 0",
        }}
      >
        {isEnabled
          ? "Accessibility scans run automatically on every push to " +
            (site.github_default_branch || "main") +
            ". Results appear in your GitHub Actions summary and here in xsbl."
          : "Install a GitHub Actions workflow that automatically scans your site for accessibility issues on every push. One click — no YAML to configure."}
      </p>

      {/* Enabled state */}
      {isEnabled && (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              marginBottom: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href={
                "https://github.com/" +
                site.github_repo +
                "/actions/workflows/xsbl-a11y.yml"
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                color: t.accent,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <GitHubIcon size={12} /> View workflow runs{" "}
              <ExternalLink size={10} />
            </a>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.64rem",
                color: t.ink50,
              }}
            >
              .github/workflows/xsbl-a11y.yml
            </span>
          </div>

          {/* Threshold display */}
          {site.ci_score_threshold && (
            <div
              style={{
                fontSize: "0.72rem",
                color: t.ink50,
                marginBottom: "0.6rem",
              }}
            >
              Score threshold:{" "}
              <span style={{ fontFamily: "var(--mono)", fontWeight: 600 }}>
                {site.ci_score_threshold}
              </span>
            </div>
          )}

          {/* Uninstall */}
          <button
            onClick={handleUninstall}
            disabled={uninstalling}
            style={{
              padding: "0.35rem 0.7rem",
              borderRadius: 5,
              border: "1px solid " + t.red + "30",
              background: "none",
              color: t.red,
              fontFamily: "var(--mono)",
              fontSize: "0.66rem",
              fontWeight: 500,
              cursor: uninstalling ? "not-allowed" : "pointer",
              opacity: uninstalling ? 0.5 : 1,
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            {uninstalling ? (
              <Loader2 size={11} className="xsbl-spin" />
            ) : (
              <Trash2 size={11} />
            )}{" "}
            {uninstalling ? "Removing…" : "Remove workflow"}
          </button>
        </div>
      )}

      {/* Not enabled — install button */}
      {!isEnabled && !result && (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <button
            onClick={handleInstall}
            disabled={installing}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: "none",
              background: "#24292e",
              color: "white",
              fontFamily: "var(--body)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: installing ? "not-allowed" : "pointer",
              opacity: installing ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            {installing ? (
              <Loader2 size={14} className="xsbl-spin" />
            ) : (
              <GitHubIcon size={14} />
            )}
            {installing ? "Installing…" : "Enable CI scanning"}
          </button>
          {installing && (
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.66rem",
                color: t.ink50,
              }}
            >
              Committing workflow & setting secrets…
            </span>
          )}
        </div>
      )}

      {/* Install result — success */}
      {result && result.status === "installed" && (
        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            background: t.green + "08",
            border: "1px solid " + t.green + "20",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.4rem",
          }}
        >
          <Check
            size={14}
            color={t.green}
            strokeWidth={2.5}
            style={{ marginTop: 1, flexShrink: 0 }}
          />
          <div>
            <div
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: t.green,
                marginBottom: "0.2rem",
              }}
            >
              Workflow installed
            </div>
            <div
              style={{
                fontSize: "0.72rem",
                color: t.ink50,
                lineHeight: 1.5,
              }}
            >
              Scans will run on every push to{" "}
              <span style={{ fontFamily: "var(--mono)" }}>
                {result.branch || "main"}
              </span>
              .{" "}
              <a
                href={
                  "https://github.com/" +
                  site.github_repo +
                  "/actions/workflows/xsbl-a11y.yml"
                }
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: t.accent,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.15rem",
                }}
              >
                View on GitHub <ExternalLink size={9} />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Install result — error */}
      {result && result.error && !result.status && (
        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            background: t.red + "08",
            border: "1px solid " + t.red + "20",
            fontSize: "0.78rem",
            color: t.red,
            lineHeight: 1.5,
          }}
        >
          {result.error}
        </div>
      )}

      <style>{`.xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
