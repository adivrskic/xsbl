import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { supabase } from "../../lib/supabase";
import { logAudit } from "../../lib/audit";
import { Copy, Check, Eye, EyeOff, Trash2, X } from "lucide-react";

/* ── Verification Token with show/hide ── */
export function VerificationTokenPanel({ site }) {
  const { t } = useTheme();
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  var token = site.verification_token || "";
  var masked = token.substring(0, 8) + "••••••••••";

  var handleCopy = function () {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: t.ink,
          marginBottom: "0.4rem",
        }}
      >
        Verification token
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <code
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.72rem",
            color: t.accent,
            flex: 1,
          }}
        >
          {show ? token : masked}
        </code>
        <button
          onClick={function () {
            setShow(!show);
          }}
          style={{
            background: "none",
            border: "1px solid " + t.ink20,
            borderRadius: 5,
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: t.ink50,
          }}
        >
          {show ? "Hide" : "Show"}
        </button>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "1px solid " + t.ink20,
            borderRadius: 5,
            padding: "0.2rem 0.5rem",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: "0.6rem",
            color: copied ? t.green : t.ink50,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Badge Embed Panel ── */
export function BadgeEmbedPanel({ site }) {
  const { t } = useTheme();
  const [style, setStyle] = useState("flat");
  const [copied, setCopied] = useState(false);

  var supabaseUrl = supabase.supabaseUrl || "";
  var badgeUrl =
    supabaseUrl +
    "/functions/v1/badge?domain=" +
    encodeURIComponent(site.domain) +
    "&style=" +
    style;

  var formats = {
    markdown: "![accessibility](" + badgeUrl + ")",
    html: '<img src="' + badgeUrl + '" alt="Accessibility score" />',
    url: badgeUrl,
  };
  const [fmt, setFmt] = useState("markdown");

  var handleCopy = function () {
    navigator.clipboard.writeText(formats[fmt]);
    setCopied(true);
    setTimeout(function () {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          fontSize: "0.88rem",
          fontWeight: 600,
          color: t.ink,
          marginBottom: "0.5rem",
        }}
      >
        Score Badge
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: t.ink50,
          marginBottom: "0.6rem",
          lineHeight: 1.5,
        }}
      >
        Embed your accessibility score in README, docs, or your website.
      </p>
      {site.score != null && (
        <div style={{ marginBottom: "0.6rem" }}>
          <img
            src={badgeUrl}
            alt="accessibility badge"
            style={{ height: 20 }}
          />
        </div>
      )}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
        {["flat", "plastic", "minimal"].map(function (s) {
          return (
            <button
              key={s}
              onClick={function () {
                setStyle(s);
              }}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 4,
                border: "none",
                background: style === s ? t.accent : t.ink04,
                color: style === s ? "white" : t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
        {["markdown", "html", "url"].map(function (f) {
          return (
            <button
              key={f}
              onClick={function () {
                setFmt(f);
              }}
              style={{
                padding: "0.25rem 0.5rem",
                borderRadius: 4,
                border: "none",
                background: fmt === f ? t.ink08 : "transparent",
                color: fmt === f ? t.ink : t.ink50,
                fontFamily: "var(--mono)",
                fontSize: "0.6rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          background: t.codeBg,
          padding: "0.5rem 0.7rem",
          borderRadius: 6,
        }}
      >
        <code
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.62rem",
            color: "#a3a3a3",
            flex: 1,
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          {formats[fmt]}
        </code>
        <button
          onClick={handleCopy}
          style={{
            background: "none",
            border: "1px solid " + t.ink20,
            borderRadius: 4,
            padding: "0.15rem 0.4rem",
            cursor: "pointer",
            fontFamily: "var(--mono)",
            fontSize: "0.55rem",
            color: copied ? t.green : t.ink50,
            flexShrink: 0,
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
    </div>
  );
}

/* ── Ignore Rules Panel ── */
export function IgnoreRulesPanel({ site, onUpdate }) {
  var { t } = useTheme();
  var rules = site.ignore_rules || [];
  var [removing, setRemoving] = useState(null);

  var handleRemove = async function (index) {
    setRemoving(index);
    var updated = rules.filter(function (_, i) {
      return i !== index;
    });
    var { data } = await supabase
      .from("sites")
      .update({ ignore_rules: updated })
      .eq("id", site.id)
      .select()
      .single();
    if (data) onUpdate(data);
    setRemoving(null);
  };

  if (rules.length === 0) return null;

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 12,
        border: "1px solid " + t.ink08,
        background: t.cardBg,
        marginBottom: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
          marginBottom: "0.5rem",
        }}
      >
        <EyeOff size={15} color={t.amber} strokeWidth={2} />
        <h3
          style={{
            fontSize: "0.92rem",
            fontWeight: 600,
            color: t.ink,
            margin: 0,
          }}
        >
          Ignore rules
        </h3>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: "0.58rem",
            fontWeight: 700,
            padding: "0.1rem 0.35rem",
            borderRadius: 4,
            background: t.amber + "15",
            color: t.amber,
          }}
        >
          {rules.length}
        </span>
      </div>
      <p
        style={{
          fontSize: "0.74rem",
          color: t.ink50,
          margin: "0 0 0.6rem",
          lineHeight: 1.5,
        }}
      >
        These rules are auto-ignored on new scans. Issues matching these
        patterns won't appear as open.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
        {rules.map(function (rule, i) {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 0.7rem",
                borderRadius: 7,
                border: "1px solid " + t.ink08,
                background: t.paper,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: "0.72rem",
                  fontWeight: 600,
                  color: t.accent,
                }}
              >
                {rule.rule_id}
              </span>
              <span
                style={{
                  flex: 1,
                  fontSize: "0.74rem",
                  color: t.ink50,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {rule.description || ""}
              </span>
              <button
                onClick={function () {
                  handleRemove(i);
                }}
                disabled={removing === i}
                aria-label={"Remove ignore rule for " + rule.rule_id}
                style={{
                  padding: "0.2rem",
                  borderRadius: 4,
                  border: "none",
                  background: "none",
                  color: t.ink50,
                  cursor: "pointer",
                  display: "flex",
                  opacity: removing === i ? 0.3 : 1,
                }}
              >
                <X size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Danger Zone — working delete ── */
export function DangerZonePanel({ site }) {
  const { t } = useTheme();
  const navigate = useNavigate();
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  var handleDelete = async function () {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    setDeleting(true);
    await supabase.from("issues").delete().eq("site_id", site.id);
    await supabase.from("scans").delete().eq("site_id", site.id);
    await supabase.from("sites").delete().eq("id", site.id);
    logAudit({
      action: "site.deleted",
      resourceType: "site",
      resourceId: site.id,
      description: "Deleted site " + site.domain,
      metadata: { domain: site.domain },
    });
    navigate("/dashboard/sites");
  };

  return (
    <div
      style={{
        padding: "1.2rem",
        borderRadius: 10,
        border: "1px solid " + t.red + "20",
        background: t.red + "04",
      }}
    >
      <div
        style={{
          fontSize: "0.82rem",
          fontWeight: 600,
          color: t.red,
          marginBottom: "0.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.4rem",
        }}
      >
        <Trash2 size={14} strokeWidth={2} /> Danger zone
      </div>
      <p
        style={{ fontSize: "0.76rem", color: t.ink50, marginBottom: "0.7rem" }}
      >
        {confirming
          ? "Are you sure? This permanently deletes all scan history and issues for " +
            site.domain +
            "."
          : "Removing deletes all scan history and issues."}
      </p>
      <div style={{ display: "flex", gap: "0.4rem" }}>
        <button
          onClick={handleDelete}
          disabled={deleting}
          style={{
            padding: "0.4rem 0.9rem",
            borderRadius: 6,
            border: confirming ? "none" : "1.5px solid " + t.red,
            background: confirming ? t.red : "none",
            color: confirming ? "white" : t.red,
            fontFamily: "var(--body)",
            fontSize: "0.78rem",
            fontWeight: 600,
            cursor: deleting ? "not-allowed" : "pointer",
            opacity: deleting ? 0.5 : 1,
          }}
        >
          {deleting
            ? "Deleting..."
            : confirming
            ? "Yes, delete permanently"
            : "Remove site"}
        </button>
        {confirming && !deleting && (
          <button
            onClick={function () {
              setConfirming(false);
            }}
            style={{
              padding: "0.4rem 0.9rem",
              borderRadius: 6,
              border: "1.5px solid " + t.ink20,
              background: "none",
              color: t.ink,
              fontFamily: "var(--body)",
              fontSize: "0.78rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}
