import { useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { AlertTriangle, Copy, Check, Loader2, X } from "lucide-react";

export default function VerifyPanel({ site, onVerified }) {
  const { t } = useTheme();
  const { session } = useAuth();
  const [method, setMethod] = useState("meta_tag");
  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState(null);

  const tk = site.verification_token;
  const snippets = {
    meta_tag: `<meta name="xsbl-verification" content="${tk}" />`,
    dns_txt: `xsbl-verification=${tk}`,
    well_known: tk,
  };
  const hints = {
    meta_tag: "Add this meta tag to your site\u2019s <head>:",
    dns_txt: "Add a TXT record to your domain\u2019s DNS:",
    well_known: `Create https://${site.domain}/.well-known/xsbl-verify.txt with:`,
  };
  const tabs = [
    { id: "meta_tag", label: "Meta tag" },
    { id: "dns_txt", label: "DNS" },
    { id: "well_known", label: "File" },
  ];

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async () => {
    setVerifying(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("verify-site", {
        body: { site_id: site.id },
        headers: { Authorization: `Bearer ${session?.access_token}` },
      });
      if (error) throw new Error(error.message);
      setResult(data);
      if (data?.verified) {
        onVerified?.(data);
      }
    } catch (err) {
      setResult({ verified: false, error: err.message });
    }
    setVerifying(false);
  };

  return (
    <div
      style={{
        padding: "1.5rem",
        borderRadius: 12,
        border: `1px solid ${t.amber}30`,
        background: `${t.amber}06`,
        marginBottom: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          marginBottom: "0.5rem",
        }}
      >
        <AlertTriangle size={16} color={t.amber} strokeWidth={2} />
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: "1rem",
            fontWeight: 700,
            color: t.ink,
            margin: 0,
          }}
        >
          Verify ownership
        </h2>
      </div>
      <p
        style={{
          color: t.ink50,
          fontSize: "0.84rem",
          marginBottom: "1rem",
          lineHeight: 1.6,
        }}
      >
        Verify to unlock scheduled scans and compliance reports. You can still
        run manual scans without verification.
      </p>
      <div
        style={{
          display: "flex",
          gap: "0.25rem",
          marginBottom: "1rem",
          background: t.ink04,
          padding: "0.25rem",
          borderRadius: 8,
          width: "fit-content",
        }}
      >
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMethod(id)}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: 6,
              border: "none",
              background: method === id ? t.cardBg : "transparent",
              color: method === id ? t.ink : t.ink50,
              fontFamily: "var(--mono)",
              fontSize: "0.68rem",
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: method === id ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <p style={{ color: t.ink50, fontSize: "0.8rem", marginBottom: "0.5rem" }}>
        {hints[method]}
      </p>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          background: t.codeBg,
          padding: "0.7rem 1rem",
          borderRadius: 8,
          marginBottom: "1rem",
        }}
      >
        <code
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.7rem",
            color: t.green,
            flex: 1,
            overflowX: "auto",
            whiteSpace: "pre",
          }}
        >
          {snippets[method]}
        </code>
        <button
          onClick={() => handleCopy(snippets[method])}
          style={{
            background: "none",
            border: `1px solid ${t.ink20}`,
            borderRadius: 6,
            padding: "0.25rem 0.55rem",
            cursor: "pointer",
            whiteSpace: "nowrap",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.3rem",
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: copied ? t.green : t.ink50,
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Verify button */}
      <button
        onClick={handleVerify}
        disabled={verifying}
        style={{
          padding: "0.55rem 1.2rem",
          borderRadius: 8,
          border: "none",
          background: t.accent,
          color: "white",
          fontFamily: "var(--body)",
          fontSize: "0.85rem",
          fontWeight: 600,
          cursor: verifying ? "not-allowed" : "pointer",
          opacity: verifying ? 0.6 : 1,
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        {verifying ? (
          <Loader2 size={15} className="xsbl-spin" />
        ) : (
          <Check size={15} />
        )}
        {verifying ? "Checking\u2026" : "Verify now"}
      </button>

      {/* Result */}
      {result && (
        <div
          style={{
            marginTop: "0.8rem",
            padding: "0.7rem 0.9rem",
            borderRadius: 8,
            background: result.verified ? t.greenBg : `${t.red}08`,
            border: `1px solid ${
              result.verified ? `${t.green}20` : `${t.red}20`
            }`,
            fontSize: "0.82rem",
            color: result.verified ? t.green : t.red,
          }}
        >
          {result.verified ? (
            <span
              style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}
            >
              <Check size={14} strokeWidth={2.5} /> Verified via{" "}
              {result.method === "meta_tag"
                ? "meta tag"
                : result.method === "dns_txt"
                ? "DNS TXT record"
                : "well-known file"}
              !
            </span>
          ) : (
            <div>
              <div style={{ marginBottom: "0.3rem", fontWeight: 600 }}>
                Verification failed
              </div>
              <div style={{ fontSize: "0.76rem", color: t.ink50 }}>
                We checked all three methods and couldn't find your token. Make
                sure the meta tag, DNS record, or file is live, then try again.
                {result.checks && (
                  <div style={{ marginTop: "0.3rem" }}>
                    {result.checks.map((c, i) => (
                      <div
                        key={i}
                        style={{
                          fontFamily: "var(--mono)",
                          fontSize: "0.65rem",
                        }}
                      >
                        {c.found ? "\u2713" : "\u2717"}{" "}
                        {c.method.replace("_", " ")}
                        {c.error ? ` (${c.error})` : ""}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
