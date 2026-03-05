import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../ui/Toast";
import { Loader2, ExternalLink, Check, AlertTriangle } from "lucide-react";

function GitHubIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function CreatePRButton({ issue, site }) {
  const { t } = useTheme();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  var hasGitHub = site && site.github_repo && site.github_token;

  if (!hasGitHub) return null;

  const handleCreatePR = async () => {
    setLoading(true);
    setResult(null);
    try {
      var {
        data: { session },
      } = await supabase.auth.getSession();
      var { data, error } = await supabase.functions.invoke("create-fix-pr", {
        body: { issue_id: issue.id, site_id: site.id },
        headers: { Authorization: "Bearer " + (session?.access_token || "") },
      });

      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);

      setResult(data);

      if (data.status === "created") {
        toast.success("PR #" + data.pr_number + " created!");
      } else if (data.status === "suggestion") {
        toast.info(
          "Could not find the exact source file — see suggestion below"
        );
      }
    } catch (err) {
      toast.error("Failed: " + String(err).substring(0, 100));
      setResult({ error: String(err) });
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: "0.8rem" }}>
      {/* Create PR button */}
      {!result && (
        <button
          onClick={handleCreatePR}
          disabled={loading}
          style={{
            padding: "0.5rem 1rem",
            borderRadius: 7,
            border: "none",
            background: "#24292e",
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.82rem",
            fontWeight: 600,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          {loading ? (
            <Loader2 size={14} className="xsbl-spin" />
          ) : (
            <GitHubIcon size={14} />
          )}
          {loading ? "Creating PR\u2026" : "Create fix PR"}
        </button>
      )}

      {/* PR created */}
      {result && result.status === "created" && (
        <div
          style={{
            padding: "0.8rem",
            borderRadius: 8,
            background: `${t.green}08`,
            border: `1px solid ${t.green}20`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.4rem",
            }}
          >
            <Check size={15} color={t.green} strokeWidth={2.5} />
            <span
              style={{ fontSize: "0.84rem", fontWeight: 600, color: t.green }}
            >
              PR #{result.pr_number} created
            </span>
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: t.ink50,
              margin: "0 0 0.4rem 0",
              lineHeight: 1.5,
            }}
          >
            {result.description}
          </p>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href={result.pr_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.72rem",
                color: t.accent,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
              }}
            >
              View on GitHub <ExternalLink size={11} />
            </a>
            <span
              style={{
                fontFamily: "var(--mono)",
                fontSize: "0.62rem",
                color: t.ink50,
              }}
            >
              {result.file} → {result.branch}
            </span>
          </div>
        </div>
      )}

      {/* Suggestion (no source file found) */}
      {result && result.status === "suggestion" && (
        <div
          style={{
            padding: "0.8rem",
            borderRadius: 8,
            background: t.accentBg,
            border: `1px solid ${t.accent}20`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              marginBottom: "0.4rem",
            }}
          >
            <AlertTriangle size={15} color={t.amber} strokeWidth={2} />
            <span
              style={{ fontSize: "0.84rem", fontWeight: 600, color: t.ink }}
            >
              Suggested fix
            </span>
          </div>
          <p
            style={{
              fontSize: "0.78rem",
              color: t.ink50,
              margin: "0 0 0.5rem 0",
              lineHeight: 1.5,
            }}
          >
            {result.description}
          </p>
          {result.fixed_content && (
            <pre
              style={{
                padding: "0.6rem 0.8rem",
                borderRadius: 6,
                background: t.codeBg,
                fontFamily: "var(--mono)",
                fontSize: "0.68rem",
                color: "#a3a3a3",
                overflowX: "auto",
                whiteSpace: "pre-wrap",
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              {result.fixed_content}
            </pre>
          )}
          <p
            style={{ fontSize: "0.68rem", color: t.ink50, marginTop: "0.4rem" }}
          >
            Suggested file:{" "}
            <code style={{ fontFamily: "var(--mono)", color: t.accent }}>
              {result.file_path}
            </code>
          </p>
        </div>
      )}

      {/* Error */}
      {result && result.error && !result.status && (
        <div
          style={{
            padding: "0.6rem 0.8rem",
            borderRadius: 8,
            marginTop: "0.3rem",
            background: `${t.red}08`,
            border: `1px solid ${t.red}20`,
            fontSize: "0.78rem",
            color: t.red,
          }}
        >
          {result.error}
        </div>
      )}

      <style>{`.xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
