import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../ui/Toast";
import {
  Terminal,
  Loader2,
  Check,
  ExternalLink,
  Key,
  Lock,
  FileCode,
  Trash2,
  AlertTriangle,
} from "lucide-react";

export default function CISetupPanel({ site, onUpdate }) {
  const { t } = useTheme();
  const { session } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [uninstalling, setUninstalling] = useState(false);
  const [threshold, setThreshold] = useState(site?.ci_score_threshold || 70);
  const [error, setError] = useState(null);

  var hasGitHub = site && site.github_repo && site.github_token;
  var isInstalled = site && site.ci_enabled;

  if (!hasGitHub) return null;

  var handleInstall = async function () {
    setLoading(true);
    setError(null);
    try {
      var { data, error: invokeErr } = await supabase.functions.invoke(
        "install-ci-workflow",
        {
          body: { site_id: site.id, score_threshold: threshold },
          headers: {
            Authorization: "Bearer " + (session?.access_token || ""),
          },
        }
      );
      if (invokeErr) throw new Error(invokeErr.message);
      if (data?.error) throw new Error(data.error);

      if (data.status === "installed" || data.status === "already_installed") {
        toast.success(
          data.status === "already_installed"
            ? "CI workflow is already installed"
            : "CI/CD configured for " + site.github_repo
        );
        onUpdate &&
          onUpdate({
            ...site,
            ci_enabled: true,
            ci_score_threshold: threshold,
          });
      }
    } catch (err) {
      setError(String(err).substring(0, 300));
      toast.error("CI setup failed");
    }
    setLoading(false);
  };

  var handleUninstall = async function () {
    setUninstalling(true);
    setError(null);
    try {
      var { data, error: invokeErr } = await supabase.functions.invoke(
        "install-ci-workflow",
        {
          body: { site_id: site.id, action: "uninstall" },
          headers: {
            Authorization: "Bearer " + (session?.access_token || ""),
          },
        }
      );
      if (invokeErr) throw new Error(invokeErr.message);
      if (data?.error) throw new Error(data.error);

      toast.success("CI workflow removed from " + site.github_repo);
      onUpdate && onUpdate({ ...site, ci_enabled: false, ci_api_key: null });
    } catch (err) {
      setError(String(err).substring(0, 200));
      toast.error("Uninstall failed");
    }
    setUninstalling(false);
  };

  return (
    <div
      style={{
        padding: "1.2rem 1.4rem",
        borderRadius: 12,
        border: "1px solid " + (isInstalled ? t.green + "25" : t.ink08),
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.4rem",
        }}
      >
        <Terminal size={16} color={t.accent} strokeWidth={1.8} />
        <h3
          style={{
            fontSize: "0.92rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          CI/CD Scanning
        </h3>
        {isInstalled && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.5rem",
              fontWeight: 600,
              padding: "0.1rem 0.35rem",
              borderRadius: 3,
              background: t.green + "15",
              color: t.green,
              textTransform: "uppercase",
            }}
          >
            Active
          </span>
        )}
      </div>

      {/* ── Installed state ── */}
      {isInstalled && (
        <div>
          <p
            style={{
              fontSize: "0.76rem",
              color: t.ink50,
              lineHeight: 1.6,
              marginBottom: "0.6rem",
            }}
          >
            Accessibility scans run automatically on every push to{" "}
            <code
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                color: t.accent,
              }}
            >
              {site.github_default_branch || "main"}
            </code>
            .
          </p>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              fontSize: "0.72rem",
              color: t.ink50,
              lineHeight: 1.5,
              marginBottom: "0.6rem",
              padding: "0.6rem 0.8rem",
              borderRadius: 8,
              background: t.ink04,
            }}
          >
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Check size={12} color={t.green} strokeWidth={2.5} />
              <span>
                Secrets:{" "}
                <code style={{ fontFamily: "var(--mono)", color: t.ink }}>
                  XSBL_API_KEY
                </code>
                {", "}
                <code style={{ fontFamily: "var(--mono)", color: t.ink }}>
                  XSBL_SITE_ID
                </code>
              </span>
            </div>
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Check size={12} color={t.green} strokeWidth={2.5} />
              <span>
                Workflow:{" "}
                <code style={{ fontFamily: "var(--mono)", color: t.ink }}>
                  .github/workflows/xsbl-a11y.yml
                </code>
              </span>
            </div>
            {site.ci_score_threshold && (
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
              >
                <Check size={12} color={t.green} strokeWidth={2.5} />
                <span>
                  Score threshold:{" "}
                  <code style={{ fontFamily: "var(--mono)", color: t.ink }}>
                    {site.ci_score_threshold}
                  </code>
                </span>
              </div>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              flexWrap: "wrap",
            }}
          >
            <a
              href={"https://github.com/" + site.github_repo + "/actions"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                color: t.accent,
                textDecoration: "none",
              }}
            >
              View Actions <ExternalLink size={11} />
            </a>

            <a
              href={
                "https://github.com/" +
                site.github_repo +
                "/blob/" +
                (site.github_default_branch || "main") +
                "/.github/workflows/xsbl-a11y.yml"
              }
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                fontFamily: "var(--mono)",
                fontSize: "0.7rem",
                color: t.ink50,
                textDecoration: "none",
              }}
            >
              View workflow <ExternalLink size={11} />
            </a>

            <button
              onClick={handleUninstall}
              disabled={uninstalling}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.25rem",
                marginLeft: "auto",
                padding: "0.3rem 0.6rem",
                borderRadius: 5,
                border: "1px solid " + t.red + "25",
                background: "none",
                color: t.red,
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                fontWeight: 600,
                cursor: uninstalling ? "not-allowed" : "pointer",
                opacity: uninstalling ? 0.5 : 1,
              }}
            >
              {uninstalling ? (
                <Loader2 size={11} className="xsbl-spin" />
              ) : (
                <Trash2 size={11} />
              )}
              Remove
            </button>
          </div>
        </div>
      )}

      {/* ── Not installed state ── */}
      {!isInstalled && !loading && (
        <div>
          <p
            style={{
              fontSize: "0.76rem",
              color: t.ink50,
              lineHeight: 1.6,
              marginBottom: "0.6rem",
            }}
          >
            Scan for WCAG violations on every push. One click sets up
            everything:
          </p>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.3rem",
              marginBottom: "0.8rem",
            }}
          >
            {[
              { icon: Key, text: "Create a CI-specific API key" },
              {
                icon: Lock,
                text:
                  "Push XSBL_API_KEY and XSBL_SITE_ID as encrypted secrets to " +
                  site.github_repo,
              },
              {
                icon: FileCode,
                text:
                  "Commit a GitHub Actions workflow to " +
                  (site.github_default_branch || "main"),
              },
            ].map(function (item, i) {
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.4rem",
                    fontSize: "0.72rem",
                    color: t.ink,
                    lineHeight: 1.5,
                  }}
                >
                  <item.icon
                    size={13}
                    color={t.ink50}
                    strokeWidth={1.8}
                    style={{ marginTop: 2, flexShrink: 0 }}
                  />
                  {item.text}
                </div>
              );
            })}
          </div>

          {/* Score threshold */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "0.8rem",
            }}
          >
            <label
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Score threshold
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={threshold}
              onChange={function (e) {
                setThreshold(Number(e.target.value));
              }}
              style={{
                width: 56,
                padding: "0.3rem 0.4rem",
                borderRadius: 5,
                border: "1.5px solid " + t.ink08,
                background: t.paper,
                color: t.ink,
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                textAlign: "center",
                outline: "none",
              }}
            />
            <span style={{ fontSize: "0.66rem", color: t.ink50 }}>
              Warn if score drops below
            </span>
          </div>

          <button
            onClick={handleInstall}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: 7,
              border: "none",
              background: t.accent,
              color: "white",
              fontFamily: "var(--body)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
            }}
          >
            <Terminal size={14} />
            Set up CI/CD
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.3rem",
            padding: "0.4rem 0",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              color: t.accent,
              fontSize: "0.82rem",
            }}
          >
            <Loader2 size={15} className="xsbl-spin" />
            Setting up CI/CD…
          </div>
          <div
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.66rem",
              color: t.ink50,
              lineHeight: 1.6,
            }}
          >
            Creating API key, pushing secrets, committing workflow…
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            background: t.red + "08",
            border: "1px solid " + t.red + "20",
            fontSize: "0.74rem",
            color: t.red,
            marginTop: "0.5rem",
            lineHeight: 1.5,
            display: "flex",
            alignItems: "flex-start",
            gap: "0.4rem",
          }}
        >
          <AlertTriangle
            size={14}
            strokeWidth={1.8}
            style={{ marginTop: 1, flexShrink: 0 }}
          />
          <span>{error}</span>
        </div>
      )}

      <style>{`.xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
