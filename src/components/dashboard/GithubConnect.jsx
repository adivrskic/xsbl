import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { useToast } from "../ui/Toast";
import { Check, Loader2, ExternalLink, Unlink } from "lucide-react";

// GitHub SVG icon (lucide doesn't have brand icons)
function GitHubIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function GitHubConnect({ site, onUpdate }) {
  const { t } = useTheme();
  const toast = useToast();
  const [repo, setRepo] = useState(site.github_repo || "");
  const [ghToken, setGhToken] = useState(site.github_token ? "••••••••" : "");
  const [branch, setBranch] = useState(site.github_default_branch || "main");
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connected, setConnected] = useState(
    !!site.github_repo && !!site.github_token
  );

  const handleSave = async () => {
    if (!repo.trim() || !ghToken.trim()) {
      toast.error("Both repo and token are required");
      return;
    }

    // Don't save the masked token
    var tokenToSave = ghToken === "••••••••" ? undefined : ghToken.trim();

    setSaving(true);
    var updateData = {
      github_repo: repo.trim(),
      github_default_branch: branch.trim() || "main",
    };
    if (tokenToSave) updateData.github_token = tokenToSave;

    var { error } = await supabase
      .from("sites")
      .update(updateData)
      .eq("id", site.id);
    if (error) {
      toast.error("Failed to save: " + error.message);
    } else {
      toast.success("GitHub repo connected");
      setConnected(true);
      onUpdate?.({ ...site, ...updateData });
    }
    setSaving(false);
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      var res = await fetch("https://api.github.com/repos/" + repo.trim(), {
        headers: {
          Authorization:
            "token " + (ghToken === "••••••••" ? site.github_token : ghToken),
          Accept: "application/vnd.github.v3+json",
        },
      });
      if (res.ok) {
        var data = await res.json();
        toast.success(
          "Connected to " +
            data.full_name +
            " (" +
            (data.private ? "private" : "public") +
            ")"
        );
        setBranch(data.default_branch || "main");
      } else {
        var err = await res.json();
        toast.error("GitHub API error: " + (err.message || res.status));
      }
    } catch (e) {
      toast.error("Connection failed: " + String(e));
    }
    setTesting(false);
  };

  const handleDisconnect = async () => {
    setSaving(true);
    await supabase
      .from("sites")
      .update({
        github_repo: null,
        github_token: null,
        github_default_branch: "main",
      })
      .eq("id", site.id);
    setRepo("");
    setGhToken("");
    setBranch("main");
    setConnected(false);
    toast.success("GitHub disconnected");
    onUpdate?.({ ...site, github_repo: null, github_token: null });
    setSaving(false);
  };

  return (
    <div
      style={{
        padding: "1.3rem",
        borderRadius: 10,
        border: `1px solid ${t.ink08}`,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "0.8rem",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <GitHubIcon size={17} />
          <span style={{ fontSize: "0.88rem", fontWeight: 600, color: t.ink }}>
            GitHub Integration
          </span>
        </div>
        {connected && (
          <span
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.58rem",
              fontWeight: 600,
              padding: "0.15rem 0.4rem",
              borderRadius: 3,
              textTransform: "uppercase",
              background: `${t.green}12`,
              color: t.green,
              display: "flex",
              alignItems: "center",
              gap: "0.2rem",
            }}
          >
            <Check size={10} /> Connected
          </span>
        )}
      </div>

      <p
        style={{
          fontSize: "0.78rem",
          color: t.ink50,
          lineHeight: 1.6,
          marginBottom: "1rem",
        }}
      >
        Connect a GitHub repo to create pull requests that fix accessibility
        issues directly in your code.
      </p>

      {/* Repo input */}
      <div style={{ marginBottom: "0.6rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.25rem",
          }}
        >
          Repository (owner/repo)
        </label>
        <input
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          placeholder="acme/website"
          style={{
            width: "100%",
            padding: "0.45rem 0.7rem",
            borderRadius: 6,
            border: `1.5px solid ${t.ink20}`,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.8rem",
            outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => (e.target.style.borderColor = t.accent)}
          onBlur={(e) => (e.target.style.borderColor = t.ink20)}
        />
      </div>

      {/* Token input */}
      <div style={{ marginBottom: "0.6rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.25rem",
          }}
        >
          Personal Access Token
        </label>
        <input
          type="password"
          value={ghToken}
          onChange={(e) => setGhToken(e.target.value)}
          onFocus={(e) => {
            if (ghToken === "••••••••") {
              e.target.style.borderColor = t.accent;
              setGhToken("");
            }
          }}
          placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
          style={{
            width: "100%",
            padding: "0.45rem 0.7rem",
            borderRadius: 6,
            border: `1.5px solid ${t.ink20}`,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.8rem",
            outline: "none",
            boxSizing: "border-box",
          }}
          onBlur={(e) => (e.target.style.borderColor = t.ink20)}
        />
        <p style={{ fontSize: "0.68rem", color: t.ink50, marginTop: "0.2rem" }}>
          Needs{" "}
          <code
            style={{
              fontFamily: "var(--mono)",
              fontSize: "0.62rem",
              color: t.accent,
            }}
          >
            repo
          </code>{" "}
          scope.{" "}
          <a
            href="https://github.com/settings/tokens/new?scopes=repo&description=xsbl-a11y-fixes"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: t.accent, textDecoration: "none" }}
          >
            Create one{" "}
            <ExternalLink size={10} style={{ verticalAlign: "middle" }} />
          </a>
        </p>
      </div>

      {/* Branch */}
      <div style={{ marginBottom: "1rem" }}>
        <label
          style={{
            display: "block",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: t.ink50,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: "0.25rem",
          }}
        >
          Default branch
        </label>
        <input
          value={branch}
          onChange={(e) => setBranch(e.target.value)}
          placeholder="main"
          style={{
            width: 120,
            padding: "0.45rem 0.7rem",
            borderRadius: 6,
            border: `1.5px solid ${t.ink20}`,
            background: t.paper,
            color: t.ink,
            fontFamily: "var(--mono)",
            fontSize: "0.8rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <button
          onClick={handleTest}
          disabled={!repo.trim() || testing}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: 6,
            border: `1.5px solid ${t.ink20}`,
            background: "none",
            color: t.ink,
            fontFamily: "var(--body)",
            fontSize: "0.78rem",
            fontWeight: 500,
            cursor: "pointer",
            opacity: !repo.trim() || testing ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {testing ? <Loader2 size={13} className="xsbl-spin" /> : null}
          Test connection
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !repo.trim()}
          style={{
            padding: "0.4rem 0.8rem",
            borderRadius: 6,
            border: "none",
            background: t.accent,
            color: "white",
            fontFamily: "var(--body)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: "pointer",
            opacity: saving || !repo.trim() ? 0.5 : 1,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
          }}
        >
          {saving ? (
            <Loader2 size={13} className="xsbl-spin" />
          ) : (
            <Check size={13} />
          )}
          Save
        </button>
        {connected && (
          <button
            onClick={handleDisconnect}
            style={{
              padding: "0.4rem 0.8rem",
              borderRadius: 6,
              border: `1.5px solid ${t.red}40`,
              background: "none",
              color: t.red,
              fontFamily: "var(--body)",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <Unlink size={13} /> Disconnect
          </button>
        )}
      </div>

      <style>{`.xsbl-spin { animation: xsbl-spin 0.6s linear infinite; } @keyframes xsbl-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
