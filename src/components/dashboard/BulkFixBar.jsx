import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../ui/Toast";
import { Loader2, ExternalLink, Check, X } from "lucide-react";

function GitHubIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function BulkFixBar({
  selectedIds,
  issues,
  site,
  onClear,
  onFixed,
}) {
  const { t } = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  var hasGitHub = site && site.github_repo && site.github_token;
  var count = selectedIds.length;
  if (count === 0) return null;

  // Count by impact
  var selectedIssues = issues.filter(function (iss) {
    return selectedIds.indexOf(iss.id) !== -1;
  });
  var impacts = { critical: 0, serious: 0, moderate: 0, minor: 0 };
  selectedIssues.forEach(function (iss) {
    impacts[iss.impact] = (impacts[iss.impact] || 0) + 1;
  });

  var handleBulkFix = async function () {
    if (!hasGitHub) {
      toast.warning("Connect a GitHub repo in site settings first");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var { data, error } = await supabase.functions.invoke("bulk-fix-pr", {
        body: { issue_ids: selectedIds, site_id: site.id },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setResult(data);
      toast.success(
        "PR #" +
          data.pr_number +
          " created with " +
          data.issues_fixed +
          " fixes!"
      );
      onFixed && onFixed(selectedIds);
    } catch (err) {
      toast.error("Bulk fix failed: " + String(err).substring(0, 100));
    }
    setLoading(false);
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 150,
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "0.7rem 1.2rem",
        borderRadius: 12,
        background: t.cardBg,
        border: "1px solid " + t.ink08,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)",
        animation: "bulkBarIn 0.25s ease",
        maxWidth: "90vw",
      }}
    >
      {/* Count + impact badges */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1.1rem",
            fontWeight: 700,
            color: t.ink,
          }}
        >
          {count}
        </span>
        <span style={{ fontSize: "0.78rem", color: t.ink50 }}>selected</span>
        {impacts.critical > 0 && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              padding: "0.1rem 0.3rem",
              borderRadius: 3,
              background: t.red + "15",
              color: t.red,
            }}
          >
            {impacts.critical} critical
          </span>
        )}
        {impacts.serious > 0 && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.55rem",
              fontWeight: 600,
              padding: "0.1rem 0.3rem",
              borderRadius: 3,
              background: t.red + "10",
              color: t.red,
            }}
          >
            {impacts.serious} serious
          </span>
        )}
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: t.ink08 }} />

      {/* Result */}
      {result ? (
        <a
          href={result.pr_url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "var(--mono)",
            fontSize: "0.78rem",
            color: t.green,
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          <Check size={15} /> PR #{result.pr_number} <ExternalLink size={11} />
        </a>
      ) : (
        <button
          onClick={handleBulkFix}
          disabled={loading || !hasGitHub}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.45rem 1rem",
            borderRadius: 7,
            border: "none",
            background: hasGitHub ? "#24292e" : t.ink20,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: loading || !hasGitHub ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? (
            <Loader2 size={14} className="xsbl-spin" />
          ) : (
            <GitHubIcon size={14} />
          )}
          {loading
            ? "Creating PR..."
            : hasGitHub
            ? "Create fix PR"
            : "Connect GitHub first"}
        </button>
      )}

      {/* Close */}
      <button
        onClick={onClear}
        style={{
          background: "none",
          border: "none",
          padding: "0.2rem",
          cursor: "pointer",
          color: t.ink50,
          display: "flex",
        }}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes bulkBarIn { from { opacity: 0; transform: translateX(-50%) translateY(10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }
        .xsbl-spin { animation: xsbl-spin 0.6s linear infinite; }
        @keyframes xsbl-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
