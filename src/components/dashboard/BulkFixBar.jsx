import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../ui/Toast";
import { Loader2, ExternalLink, Check, X } from "lucide-react";
import "../../styles/github-pr.css";
import "../../styles/dashboard.css";

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
    <div className="bulk-bar">
      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
        <span className="bulk-bar__count">{count}</span>
        <span className="bulk-bar__label">selected</span>
        {impacts.critical > 0 && (
          <span className="bulk-bar__impact bulk-bar__impact--critical">
            {impacts.critical} critical
          </span>
        )}
        {impacts.serious > 0 && (
          <span className="bulk-bar__impact bulk-bar__impact--serious">
            {impacts.serious} serious
          </span>
        )}
      </div>

      <div className="bulk-bar__divider" />

      {result ? (
        <a
          href={result.pr_url}
          target="_blank"
          rel="noopener noreferrer"
          className="pr-result__link"
          style={{ color: "var(--green)", fontWeight: 600 }}
        >
          <Check size={15} /> PR #{result.pr_number} <ExternalLink size={11} />
        </a>
      ) : (
        <button
          onClick={handleBulkFix}
          disabled={loading || !hasGitHub}
          className={"gh-btn" + (!hasGitHub ? " gh-btn--disabled-look" : "")}
          style={{ padding: "0.45rem 1rem" }}
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

      <button onClick={onClear} className="bulk-bar__close">
        <X size={16} />
      </button>
    </div>
  );
}
